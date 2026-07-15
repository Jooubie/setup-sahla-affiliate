# Technical Plan — Product Intake Dashboard

How the [spec](spec.md) is built, the exact tools/stacks, the automation mechanism, and the SaaS-extraction seam. Upholds the [constitution](constitution.md).

## Architecture at a glance

```
┌────────────────────────────── Phase A: embedded in this repo ──────────────────────────────┐
│  /admin (React+Vite+Tailwind, dev-only)                                                     │
│        │ POST                                                                                │
│  intake write endpoint (dev-only Node/vinext route)                                         │
│        │ writes + validates                                                                 │
│  data/product-intake.json  ◄── IntakeSource port ──►  Orchestrator (Claude Agent SDK)       │
│        ▲ fs.watch                                          │ dispatch                        │
│  scripts/intake-watch.mjs ── emits product.added ──────────┘                                 │
│                                              │                                               │
│                       sahla-research · sahla-creative · PM/marketing                         │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
         same IntakeSource port + event contract, different adapters
┌────────────────────────────── Phase B: extracted SaaS ─────────────────────────────────────┐
│  Next.js dashboard (Supabase Auth) → Supabase Postgres (RLS, org_id)                        │
│        └─ DB webhook on insert(status='new') → queue → Orchestrator worker (Agent SDK)       │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Tools & stack

### Phase A — embedded (build this first)

| Concern | Choice | Why |
|--------|--------|-----|
| Language | **TypeScript** | matches `site/` |
| Dashboard UI | **React 19 + Vite + Tailwind v4**, route `/admin` | reuse the existing site stack + design tokens; nothing new to learn |
| Prod safety | `/admin` behind `ADMIN_ENABLED` env flag, tree-shaken from the Cloudflare build | constitution §6 |
| Intake store | **`data/product-intake.json`** + **`data/product-intake.schema.json`** | plain, git-versioned, diff-able; fits the file-based architecture |
| Validation | **`scripts/validate_intake.mjs`** + **`tests/intake.test.mjs`** (`node --test`) | mirrors existing `validate_research.mjs` pattern; zero new deps |
| Write endpoint | dev-only **vinext server route** (or `scripts/intake-server.mjs`) | a static site can't write files; endpoint exists only under `npm run dev` |
| **Automation** | **`scripts/intake-watch.mjs`** — `fs.watch` on the intake file, debounced | dependency-free; emits a `product.added` event on new `status:new` items |
| Orchestrator runtime | **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`, headless) invoking the existing `sahla-product-manager` agent | the "dependent agent"; reuses `.claude/agents/*` unchanged |
| Secrets | **`.vault/secrets.local.json`** (gitignored) + build-time resolver | Vault Protocol; constitution §2 |

### Phase B — SaaS extraction (design now, build later)

| Concern | Choice | Notes |
|--------|--------|-------|
| DB | **Supabase Postgres**, `product_intake` table, **RLS by `org_id`** | multi-tenant; replaces the JSON file |
| Auth | **Supabase Auth** | per-owner login |
| Dashboard | **Next.js App Router** on Cloudflare Pages/Vercel | same React components, hosted |
| Automation | **Supabase DB webhook / Edge Function** on `insert(status='new')` → **Cloudflare Queues** (or pgmq) → Orchestrator worker | event-driven, same contract |
| Secrets | Supabase Vault / KMS-encrypted column | never plaintext |
| Billing (later) | **Stripe** | per-org plans |

## The extraction seam (SaaS readiness)

One interface makes the file→DB swap free. Orchestration imports only this port:

```ts
interface IntakeSource {
  listPending(): Promise<IntakeItem[]>;                     // status:new
  get(id: string): Promise<IntakeItem>;
  setStatus(id: string, status: IntakeStatus): Promise<void>;
  setDelegation(id: string, agent: AgentKey, state: DelegationState): Promise<void>;
  promote(id: string, canonical: CanonicalProduct): Promise<void>; // runs gates, writes products.json / DB
}
```

- Phase A: `FileIntakeSource` (reads/writes the JSON, calls `vault:gate` on promote).
- Phase B: `SupabaseIntakeSource` (same methods over Postgres).
- The orchestrator and delegation logic never import a concrete store — only `IntakeSource`. That is what lets the dashboard "turn into a SaaS later as a dependent agent doing the exact same thing."

The trigger is likewise abstracted as an **event contract** `{ type: "product.added", intakeId }`: emitted by `intake-watch.mjs` (A) or a DB webhook (B). The orchestrator's handler is identical either way.

## Automated delegation — how the trigger works (Phase A)

1. Owner submits the `/admin` form → dev endpoint appends a validated `status:new` item to `product-intake.json`.
2. `scripts/intake-watch.mjs` (a long-running `npm run intake:watch`) sees the change, finds new items, emits `product.added`.
3. The watcher invokes the orchestrator headlessly via the Agent SDK: "process intake item `IN-xxxx`". The orchestrator sets `status:dispatched` and the three delegation flags, appends a ledger line.
4. `sahla-research` and `sahla-creative` (run on a schedule or on the same watch) pick up their `requested` flags, do the work in their lanes, flip flags to `done`.
5. When all flags are `done`, the orchestrator runs G2/G3 + `vault:gate` and, if green, `promote()`s → `products.json` + `vault:seal`.

Manual override always exists (`npm run intake:process -- IN-xxxx`) so automation is convenient, not mandatory.

## Data model (Phase A)

`data/product-intake.json` — array of items:

```json
{
  "intakeId": "IN-2026-0007",
  "name": "Ugreen Revodok 105 USB-C Hub",
  "category": "Ports and connectivity",
  "problemHypothesis": "Budget 5-in-1 alternative to the Anker 332.",
  "providers": [
    { "retailer": "Amazon Egypt", "productUrl": "https://www.amazon.eg/-/en/dp/XXXX",
      "affiliateKeyRef": "amazonEgypt.ugreen-revodok-105" }
  ],
  "images": [{ "kind": "reference", "sourceUrl": "https://...", "imageRights": "SOURCE_LINK_ONLY" }],
  "ownerNotes": "Verify USB-C video support.",
  "priority": "high",
  "status": "new",
  "delegations": { "research": "requested", "creative": "requested", "marketing": "requested" },
  "targetSlug": null,
  "promotedProductId": null,
  "createdAt": "2026-07-15"
}
```

Enums reuse existing policy values (`imageRights`, affiliate status). `affiliateKeyRef` must not contain `http` (schema-enforced) — links live in the vault.

Status lifecycle: `new → dispatched → researching → images → drafting → ready → promoted | rejected | on-hold`.

## Agent changes (additive, small)

- **sahla-product-manager:** add `data/product-intake.json` to its writable lane (update `.vault/agent-lanes.json`); add the "process the intake queue" routine; owns promotion.
- **sahla-research / sahla-creative:** read their delegation flags to focus work; still stage only.
- Vault: intake file is **not** sealed (it changes constantly); promotion re-seals `products.json`.

## Risks & mitigations

- **Automation racing the gates** → the orchestrator is the only writer of canonical data; the watcher only dispatches, never promotes.
- **Agent SDK auth in headless runs** → document a service token; if absent, the watcher queues and notifies instead of failing.
- **File-write concurrency (Phase A)** → single-writer endpoint + atomic write (temp file + rename).
- **Scope creep toward SaaS too early** → Phase B is gated behind an explicit business decision; Phase A ships value alone.
