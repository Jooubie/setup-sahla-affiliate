# Constitution — Product Intake Dashboard

Non-negotiable principles. Every task in this spec must uphold all of them; a task that cannot is wrong and must be redesigned.

1. **Gates are inviolable.** The dashboard writes only to the intake queue, never to canonical `data/products.json`. A product becomes canonical only after the Product Manager runs G2/G3 and `npm run vault:gate` passes. Automation may *trigger* the gates; it may never *skip* them.

2. **Secrets stay in the vault.** Real affiliate links and tracking IDs live in `.vault/secrets.local.json` (Phase A) or an encrypted secret store (Phase B). They never enter git, the intake JSON, or a plaintext DB column. Intake references them by key only.

3. **One source of truth.** All work lands on `main`, no branches. The live site renders from canonical `products.json`; the intake queue is staging, not truth.

4. **Storage-agnostic orchestration.** Delegation logic depends on an `IntakeSource` port, never on a concrete store. Swapping the JSON file for a Supabase table (the SaaS step) must not touch orchestration code. This is the seam that lets the dashboard become a standalone SaaS "dependent agent" doing the exact same job.

5. **Automated but observable.** Adding a product auto-triggers the orchestrator with no manual step, and every dispatch, status change, and promotion is appended to the execution ledger. Automation never runs silently.

6. **Dev-only admin.** The `/admin` dashboard and its write endpoint are excluded from the production Cloudflare build. Nothing that mutates data ships to the public site.

7. **Phase-A minimalism.** The embedded phase matches the repo's style: TypeScript, zero new runtime dependencies where practical, `node --test` validation. Heavier infrastructure (DB, auth, queues) belongs only to the SaaS phase.
