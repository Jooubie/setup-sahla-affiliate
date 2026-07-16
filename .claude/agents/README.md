# Setup Sahla Claude agents

Five file-bound agents execute the business gates without loading the whole repository for every task.

| Agent | Gate | Writable lane |
|---|---|---|
| `sahla-research` | G1 | Research staging and focused reports; never `research/evidence.csv`. |
| `sahla-product-manager` | G0/G2/G3 | Canonical data/evidence, content, business decisions and intake ledger. |
| `sahla-creative` | G4 | `brand/`, `assets/generated/`, brand asset test. |
| `sahla-website-developer` | G5 | `site/` only. |
| `sahla-reviewer` | G5/G6 | `docs/launch/` and append-only progress verdicts. |

`.vault/agent-lanes.json` is the authoritative path boundary.

## Invocation

Give the selected agent a packet from `docs/business-os/AGENT_TASK_CONTRACT.md`:

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

Do not invoke an agent with “review the whole project” unless the task is an explicit full launch review.

## Efficient orchestration

- Run `sahla-research` in one named mode: product/provider **or** SEO/trend.
- Run independent research and creative work in parallel only when their write lanes do not overlap.
- Product Manager merges and selects after staged evidence passes; it never fills evidence gaps itself.
- Website agent receives exact approved routes/assets, not the entire research history.
- Reviewer checks the changed range for focused work; it loads all launch artifacts only for final approval.
- Handoffs use `path:line`, real command results and at most eight bullets unless a report is requested.

## Intake boundary

The dashboard may hold unlimited private items. The public launch set remains five gate-approved products and three guides. A watcher dispatch is not automatic agent execution unless `INTAKE_AGENT_CMD` is configured. All lanes must report `done`; skipped work is held. Selection, replacement and promotion are always explicit Product Manager decisions.

Both Product Manager and Reviewer may append to `.superpowers/sdd/progress.md`; neither rewrites the other's entries.
