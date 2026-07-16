# Setup Sahla agent briefs

This is a role map, not a second copy of every policy. The live contracts are:

1. `AGENT_TASK_CONTRACT.md` — task packet, context budget, catalog and handoff rules.
2. `.vault/agent-lanes.json` — authoritative write boundaries.
3. Each `.claude/agents/sahla-*.md` file — role-specific workflow and verification.
4. `EVIDENCE_AND_COMPLIANCE.md` — loaded only for evidence/commercial changes.
5. `OPERATING_SYSTEM.md` — loaded only for gate, owner, rollback or launch decisions.

## Active roles

| Agent | Gate | Owns | Expected output |
|---|---|---|---|
| `sahla-research` | G1 | Product/provider and SEO evidence staging. Never selects. | Dated single-source rows, focused report, signal. |
| `sahla-product-manager` | G0/G2/G3 | Selection/replacement, canonical merge, evidence-bound claims, intake coordination. | Gate decision, canonical delta, next task packet. |
| `sahla-creative` | G4 | Original/permission-reviewed brand and product visuals. | Asset + manifest row + accessibility notes, signal. |
| `sahla-website-developer` | G5 | Public `site/` implementation from approved inputs. | Surgical site delta and build/test/lint results. |
| `sahla-reviewer` | G5/G6 | Independent clean-state verification. Fixes nothing outside its report lane. | Separate compliance and quality verdicts. |

## Research modes

`Sahla-research` runs in one of two explicit modes per task packet; do not load or edit the other mode's files:

- **Product/provider:** `research/product-candidates.csv`, `research/product-evidence.csv`, `research/affiliate-program-evidence.csv`, and a focused report under `research/reports/`.
- **SEO/trend:** `research/keywords.csv`, `research/seo-evidence.csv`, and a focused report under `research/reports/`.

Only `sahla-product-manager` may merge accepted rows into `research/evidence.csv`.

## Intake flow

1. Owner adds or edits an unlimited private item through Product Control.
2. Watcher dispatches only when its optional agent command is configured; otherwise the item remains queued for manual processing.
3. Research, creative and PM/marketing work in their own lanes and signal status files.
4. All lanes must return `done`. A `skipped` lane puts the item on hold.
5. Product Manager makes an explicit selection or replacement decision.
6. Promotion runs gates before and after the canonical write, rolls back on failure, and reseals the vault.

There is no automatic selection or automatic publication.

## Boundary rule

When an upstream defect is found, return `path:line`, severity, failed gate and next owner. Do not repair another agent's lane. Product Manager and Reviewer may both append to `.superpowers/sdd/progress.md`; neither rewrites the other's entries.
