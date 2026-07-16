# Setup Sahla agent task contract

Use this contract for every Claude subagent task. It keeps context small without weakening the evidence and publication gates.

## Task packet

Every task starts with this packet:

```text
Task:
Intake ID or route:
Current gate:
Read:
Write:
Do not touch:
Evidence needed:
Verification:
Return:
```

If a field is missing, ask the Product Manager for that field instead of loading the whole repository.

## Context budget

1. Read only the files named in the task packet, this contract, and direct imports/dependencies you discover.
2. Search first; open only relevant line ranges. Do not reread every business document for a small product or route change.
3. Read `EVIDENCE_AND_COMPLIANCE.md` only when the task changes evidence, claims, images, prices, providers, disclosures, or affiliate behavior.
4. Read `OPERATING_SYSTEM.md` only when a gate, owner, rollback, or launch decision is unclear.
5. `.vault/agent-lanes.json` is the authoritative write boundary. Stop and hand back work that belongs to another lane.
6. Never paste long source files into handoffs. Reference `path:line` and summarize the delta.

## Catalog contract

- `data/product-intake.json` is an unlimited private pipeline.
- `data/products.json` is the gate-approved public catalog. The current launch contract contains exactly five products and three guides.
- A new item does not become public automatically. All required lanes must report `done`; any `skipped` lane puts the item on hold.
- Promotion requires explicit Product Manager selection or replacement, pre- and post-write gates, and vault resealing.
- Affiliate URLs are owner-controlled in `.vault/affiliate-links.local.json`. Agents never read or write that file.

## Compact handoff

Return no more than eight bullets unless a report artifact is explicitly requested:

- Outcome and gate status
- Files changed
- Evidence IDs or sources added
- Verification commands and real results
- Open risks or owner inputs
- Exact next owner/action

Do not repeat the project mission, policy text, or unchanged file contents in the handoff.
