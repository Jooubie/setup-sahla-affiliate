# Tasks — Product Intake Dashboard

Ordered, independently-verifiable tasks derived from [plan.md](plan.md). Phase A ships value on its own; Phase B is gated behind an explicit business decision. Nothing here is built yet.

## Phase A — embedded dashboard + automated delegation

### A1 — Intake schema & store
- Create `data/product-intake.schema.json` and an empty `data/product-intake.json` (`[]`).
- Enforce: required fields, status/priority/imageRights enums, ISO dates, and `affiliateKeyRef` must not contain `http`.
- **Verify:** `node scripts/validate_intake.mjs` passes on a valid sample and fails on a URL-in-key sample.

### A2 — Validation test
- Add `scripts/validate_intake.mjs` (exported helpers, existing style) and `tests/intake.test.mjs`.
- **Verify:** `node --test tests/intake.test.mjs` green; wire into `npm test`.

### A3 — IntakeSource port + FileIntakeSource
- Define the `IntakeSource` interface and implement `FileIntakeSource` (list/get/setStatus/setDelegation/promote). `promote()` runs `vault:gate` before writing canonical.
- **Verify:** a unit test drives an item `new → dispatched → …→ promoted` against a temp file; promote refuses when the gate fails.

### A4 — Orchestrator routine (automated dispatch)
- Add the "process the intake queue" routine to `sahla-product-manager`; add `data/product-intake.json` to its lane in `.vault/agent-lanes.json`.
- Add `scripts/intake-process.mjs` (manual: `npm run intake:process -- IN-xxxx`) that invokes the orchestrator via the Claude Agent SDK.
- **Verify:** running it on a `new` item sets `dispatched` + delegation flags and appends a ledger line.

### A5 — Watcher (the automation)
- Add `scripts/intake-watch.mjs` (`fs.watch`, debounced) → emits `product.added` → calls A4. Expose `npm run intake:watch`.
- **Verify:** with the watcher running, adding an item to the JSON auto-triggers dispatch with no manual command.

### A6 — Agent pickup (research + creative)
- Update `sahla-research` and `sahla-creative` briefs to read their delegation flags and flip them to `done` after staging their outputs.
- **Verify:** end-to-end on one test product: research writes `research/*.csv`, creative writes `assets/generated/`, both flags `done`, item reaches `ready`.

### A7 — Admin UI (dev-only) — DONE
- Built as a **standalone Node server** (`scripts/intake-admin-server.mjs`, `npm run intake:admin`), not an in-site route: the Cloudflare Worker runtime has no filesystem, so an in-site API route cannot write the queue in dev or prod. The standalone tool binds to 127.0.0.1 only and is never part of the site build, so production excludes it by construction. Brand-styled; reuses `validateIntakeItem` + `FileIntakeSource` (`add`/`list`/`remove`).
- **Verified:** live HTTP run — GET / serves the dashboard; POST valid → 201 + generated intakeId; POST url-in-key → 400; dispatch endpoint sets `dispatched`; DELETE removes. Unit tests cover `add`/`remove`/`nextIntakeId`.

### A8 — Affiliate injection + promotion polish
- Build-time resolver maps `affiliateKeyRef` → real URL from the vault; missing key → public URL + `DIRECT_LINK — AFFILIATE ID REQUIRED`.
- **Verify:** a product with a vault key renders the real link in `npm run build`; without a key, the compliant fallback renders.

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

A1 → A2 → A3 → A4 → A5 → A6 → A7 → A8, then re-evaluate for Phase B. A1–A6 already make automated delegation real from hand-edited JSON before the UI exists.
