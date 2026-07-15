# Spec — Product Intake Dashboard

**Feature:** A control dashboard where the owner adds/manages products (name, provider, images, links, real affiliate link) that the **Product Manager (orchestrator) agent automatically picks up and delegates** to research, creative, and marketing — feeding the existing Setup Sahla launch gates. Designed from day one to be extractable into a standalone SaaS.

**Spec-kit set:** [constitution.md](constitution.md) · spec.md (this) · [plan.md](plan.md) · [tasks.md](tasks.md)
**Governs / governed by:** [OPERATING_SYSTEM.md](../../docs/business-os/OPERATING_SYSTEM.md), [VAULT_PROTOCOL.md](../../docs/business-os/VAULT_PROTOCOL.md), [agents README](../../.claude/agents/README.md).

## Problem

Adding a new product today is manual and undocumented: someone has to hand-edit research CSVs, brief each agent, and thread the affiliate link in safely. The owner wants to drop in a product once and have the agent system take it from seed to launch-ready, without weakening the evidence gates or leaking tracking IDs.

## Solution shape

The dashboard is an **intake queue**; the Product Manager is the **dispatcher**. The queue is a file-based (later DB-based) work bus: each item carries its own status and per-agent delegation flags, so agents coordinate through the store instead of ad-hoc handoffs. Adding an item **automatically** triggers the orchestrator.

```
Owner ─add─► intake queue ─auto-trigger─► Orchestrator (sahla-product-manager)
                                              │ sets delegations
                 ┌────────────────────────────┼────────────────────────────┐
            sahla-research               sahla-creative                PM/marketing
            evidence, provider,          original product +            guide angle,
            availability, price          lifestyle images              claims, CTA
                 └────────────────────────────┼────────────────────────────┘
                              all done + gates pass → promote → products.json → vault:seal
```

## User stories & acceptance criteria

**US1 — Add a product.** As the owner, I add name, category, problem hypothesis, provider(s) + public listing URL + affiliate-key reference, image reference(s), notes, and priority.
- AC1: The item is written to the intake queue with `status:new` and validated against the schema; invalid input is rejected with a clear message.
- AC2: No affiliate tracking URL is stored in the queue — only a key reference.

**US2 — Automatic delegation.** As the owner, when I add a product I do nothing else; the orchestrator runs on its own.
- AC1: Within one trigger cycle of a new item, the orchestrator sets `status:dispatched` and delegation flags for research, creative, and marketing.
- AC2: The trigger requires no human command; the dispatch is recorded in the execution ledger.

**US3 — Agents pick up their work.** As an agent, I act only on items delegated to me.
- AC1: `sahla-research` processes items where `delegations.research="requested"`, produces staged evidence in `research/*.csv`, and sets the flag `done`.
- AC2: `sahla-creative` processes its items, produces `ORIGINAL` images in `assets/generated/`, sets its flag `done`.
- AC3: Neither agent writes outside its vault lane.

**US4 — Promote to canonical.** As the orchestrator, when all delegations are done and gates pass, I promote the product.
- AC1: The item's evidence/claims pass G2/G3 and `vault:gate`; only then is a canonical record written to `products.json` and the vault re-sealed.
- AC2: If promotion would exceed the 5-product site limit, the orchestrator surfaces the "what does it replace?" decision instead of auto-adding.

**US5 — Safe affiliate links.** As the owner, my real affiliate link is stored securely and rendered live.
- AC1: The real link lives only in the vault; the built site injects it at build time.
- AC2: A missing vault key falls back to the public listing URL with `DIRECT_LINK — AFFILIATE ID REQUIRED`.

**US6 — SaaS readiness.** As the business, the intake+orchestration layer can be re-pointed from the JSON file to a hosted DB without rewriting orchestration.
- AC1: Orchestration depends only on the `IntakeSource` port; a second adapter (Supabase) can be added without editing dispatch logic.
- AC2: The automation trigger is an event contract, emittable by a file watcher (Phase A) or a DB webhook (Phase B).

## Out of scope (this spec)

- Multi-tenant auth, billing, and hosting (Phase B / SaaS — described in plan.md, not built here).
- Raising the 5-product site limit (a business decision, not a dashboard feature).
- A separate dedicated marketing agent (PM owns marketing until volume justifies a split).

## Success definition

The owner adds one product in the dashboard and, with no further manual steps, the orchestrator dispatches it and the agents carry it to a promotable, gate-passing canonical record — with the affiliate link safe in the vault and the whole flow re-pointable to a SaaS backend.
