# Tasks — Product Intake Dashboard

Ordered, independently-verifiable tasks derived from [plan.md](plan.md). Phase A ships value on its own; Phase B is gated behind an explicit business decision. A1–A8 are implemented; live research/creative work remains item-specific.

## Phase A — embedded dashboard + automated delegation

### A1 — Intake schema & store — DONE
- Created `data/product-intake.schema.json` and a committed pipeline. The three unverified expansion products are preserved as `on-hold` instead of being public.
- Enforce: required fields, status/priority/imageRights enums, ISO dates, and `affiliateKeyRef` must not contain `http`.
- **Verify:** `node scripts/validate_intake.mjs` passes on a valid sample and fails on a URL-in-key sample.

### A2 — Validation test — DONE
- Add `scripts/validate_intake.mjs` (exported helpers, existing style) and `tests/intake.test.mjs`.
- **Verify:** `node --test tests/intake.test.mjs` green; wire into `npm test`.

### A3 — IntakeSource port + FileIntakeSource — DONE
- Implemented add/edit/remove/status/delegation/reconcile/promote. Promotion requires `ready`, gates before and after writing, rolls back failures and reseals the vault.
- **Verified:** unit tests cover no-op reconcile, skipped-lane hold, gate failure, post-write rollback, reseal rollback and success.

### A4 — Orchestrator routine — DONE
- `scripts/intake-orchestrate.mjs` and `npm run intake:process` dispatch validated items without an Agent SDK dependency.
- **Verified:** dispatch sets status/delegation flags and appends a ledger line.

### A5 — Watcher — DONE
- Added debounced `fs.watch`. It dispatches without a self-trigger loop; optional external agent execution requires explicit `INTAKE_AGENT_CMD` configuration.
- **Verified:** no-op reconcile does not rewrite the queue.

### A6 — Agent pickup (research + creative) — WIRED
- Update `sahla-research` and `sahla-creative` briefs to read their delegation flags and flip them to `done` after staging their outputs.
- **Verify per product:** research/creative/PM task packets write their lane outputs and signal `done`; a skipped lane produces `on-hold`, never `ready`.

### A7 — Product Control UI (dev-only) — DONE
- Standalone localhost dashboard combines published and pipeline products with search, status, add/edit/remove, multiple retailers, image reference, dispatch and affiliate-link controls. Published canonical records stay protected.
- Uses safe DOM construction instead of `innerHTML`; request bodies are capped at 64 KB.
- **Verified:** HTTP tests cover catalog, structured add, edit, owner status, remove, affiliate save/remove and oversized-body rejection.

### A8 — Affiliate injection + promotion polish — DONE
- Product Control stores per-product/per-retailer URLs in gitignored `.vault/affiliate-links.local.json` as pending or verified.
- Site prebuild injects only verified links into gitignored runtime data; missing/pending links use compliant direct URLs. Product pages switch disclosure and add `sponsored` only for verified affiliate links.
- **Verified:** resolver tests cover pending fallback and verified injection.

**Phase A done when:** the US1–US5 acceptance criteria in [spec.md](spec.md) all pass, and `npm run vault:gate` + `npm test` are green.

## Phase B — SaaS extraction (future; needs go-ahead)

### B1 — Supabase schema
- `product_intake` table with `org_id`, RLS policies, status/delegation columns. Migration via Supabase MCP.

### B2 — SupabaseIntakeSource
- Second `IntakeSource` adapter over Postgres. **No changes to orchestration logic** (proves the seam).

### B3 — Event trigger
- DB webhook / Edge Function on `insert(status='new')` → Cloudflare Queues → orchestrator worker. Same `product.added` contract.

### B4 — Hosted dashboard + auth
- Next.js dashboard on Cloudflare Pages/Vercel + Supabase Auth; reuse the Phase-A React components.

### B5 — Tenancy, secrets, billing
- Encrypted affiliate-secret storage per org; Stripe plans; per-org agent-run metering.

**Phase B done when:** a second tenant adds a product in the hosted dashboard and the same orchestrator delegates it — with only the adapter swapped, orchestration code untouched (US6).

## Suggested build order

A1 → A8 are implemented. Operate Phase A locally, validate real product task packets and defer Phase B until recurring usage justifies it.
