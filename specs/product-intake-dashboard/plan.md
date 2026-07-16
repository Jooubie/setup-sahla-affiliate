# Technical Plan — Product Control

Current implementation plan for the local product dashboard, intake automation and affiliate-link resolver. The [spec](spec.md) defines user outcomes; this file describes what actually runs.

## Business boundary

- `data/product-intake.json` is an unlimited private catalog/pipeline.
- `data/products.json` is the gate-approved public catalog. The current launch contract remains five products and three guides.
- Adding, editing or dispatching an intake item never publishes it.
- Product selection/replacement and promotion are explicit Product Manager decisions.

## Phase A architecture

```text
http://127.0.0.1:4317 (local Product Control)
        │
        ├── FileIntakeSource ── data/product-intake.json
        │      ├── add / edit / remove / owner status
        │      ├── dispatch / reconcile lane signals
        │      └── explicit promotion with gate + rollback + reseal
        │
        └── AffiliateLinkStore ── .vault/affiliate-links.local.json (gitignored)
                                     │
site prebuild ── resolve-site-products.mjs ── site/data/products.runtime.json (gitignored)
```

The admin server binds only to `127.0.0.1`; it is not imported into or deployed with the Cloudflare public site.

## Stack

| Concern | Implementation |
|---|---|
| Dashboard | Dependency-free HTML/CSS/safe DOM JavaScript served by `scripts/intake-admin-server.mjs` |
| API/store | Node HTTP server + `FileIntakeSource`; validated JSON and atomic temp-file rename |
| Intake validation | `scripts/validate_intake.mjs` and root Node tests |
| Watcher | Debounced `fs.watch`; writes only when state changes |
| Agent execution | Optional owner-configured `INTAKE_AGENT_CMD`, otherwise manual task packets |
| Affiliate links | `.vault/affiliate-links.local.json`; pending/verified per product and retailer |
| Site integration | `scripts/resolve-site-products.mjs` before dev/build/lint/start |

No React admin route, Tailwind dependency, Agent SDK or cloud database is required for Phase A.

## Dashboard behavior

Product Control combines published and pipeline records in one view. It supports:

- search and status filters;
- add/edit/remove for private pipeline products;
- multiple retailer references and an image reference;
- owner status (`new`, `on-hold`, `rejected`);
- dispatch of new products;
- per-product/per-retailer affiliate URL entry, update, verification and removal;
- published product visibility without allowing a UI bypass around canonical promotion.

Published products are protected: the dashboard manages their affiliate URLs but does not directly delete or rewrite canonical evidence.

## Intake lifecycle

```text
new → dispatched → ready → promoted
          │          ▲
          └─ any skipped lane → on-hold
new/on-hold → rejected (owner decision)
```

1. Owner adds an item.
2. Manual process or watcher dispatches it and requests research, creative and PM/marketing lanes.
3. Agents work only from compact task packets and signal their own lane files.
4. Reconcile advances only when every lane is `done`; any `skipped` lane goes on hold.
5. Product Manager reviews evidence and makes a select/replace decision.
6. `promote()` requires `ready`, gates before and after writing, rolls back failures, updates queue state and reseals the vault.

There is no automatic publication.

## Affiliate-link lifecycle

1. Owner pastes a complete HTTPS affiliate URL in Product Control.
2. `pending` stays private and the site continues using the direct retailer URL.
3. Owner checks the exact destination/tracking parameter and marks it `verified`.
4. Site prebuild generates `site/data/products.runtime.json` and injects only verified links.
5. Product pages place disclosure before retailer CTAs and add `rel="sponsored nofollow noopener noreferrer"` only to verified affiliate links.

Agents never read or write the private affiliate-link file.

## Phase B — later, explicit decision only

The `IntakeSource` interface is the extraction seam for a future Supabase/Auth/queue SaaS. Phase B starts only after the local workflow proves useful; no current code should add multi-tenancy, billing or cloud secrets prematurely.

## Verification

- Root: `npm test`, `npm run intake:validate`, `npm run vault:gate`, `npm run vault:secrets`.
- Site: `npm run lint`, `npx tsc --noEmit`, `npm test`.
- Local QA: Product Control add/edit/status/affiliate flows and public desktop/mobile browser checks when requested.
