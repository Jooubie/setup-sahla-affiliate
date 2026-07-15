# Setup Sahla agents

Five Claude Code subagents that make the [business operating system](../../docs/business-os/OPERATING_SYSTEM.md) executable. Invoke them by name (e.g. "use the sahla-research agent to …") or let the product-manager agent sequence them.

| Agent | Owns | Gates | Writable lane |
|-------|------|-------|---------------|
| **sahla-research** | Product/provider + SEO/trend evidence gathering (web search, dated sources). Stages, never selects. | G1 | `research/*.csv` (staging), `research/reports/` |
| **sahla-product-manager** | Roadmap + the 5-product/3-guide selection, canonical evidence merge, evidence-bound claims & guide content, and coordinating the other agents. | G0, G2, G3 | `data/`, `research/evidence.csv`, `content/`, `docs/research/`, `docs/editorial/`, `docs/business/`, `.superpowers/sdd/progress.md` |
| **sahla-creative** | Brand + voice system and original, accessible logo/category/lifestyle creatives; hands site-ready files to the website agent. | G4 | `brand/`, `assets/generated/`, `tests/brand-assets.test.mjs` |
| **sahla-website-developer** | Building/maintaining the public site from approved canonical data, brand, and guides; runs the verification matrix. | G5 | `site/` only |
| **sahla-reviewer** | Independent final review — runs the full verification matrix fresh, assigns each defect to the earliest gate, blesses publish/refresh. Fixes nothing outside its report. | G5/G6 | `docs/launch/`, `.superpowers/sdd/progress.md` |

## Mapping to the original 7 briefs

The seven prose contracts in [AGENT_BRIEFS.md](../../docs/business-os/AGENT_BRIEFS.md) map onto these five:

- **sahla-research** = Product/Provider Research + SEO/Trend Research
- **sahla-product-manager** = Research Integration + Editorial + orchestration/roadmap
- **sahla-creative** = Identity/Creatives
- **sahla-website-developer** = Website
- **sahla-reviewer** = Final Review

Every original role now has an owner. Two roles stay merged: research collapses the two parallel research briefs into one agent (run it twice — once for product/provider, once for SEO/trend), and the product-manager still carries both Research Integration and Editorial. Split either out if the workload justifies a dedicated agent.

## The `.superpowers/sdd/progress.md` overlap

Both **sahla-product-manager** and **sahla-reviewer** may write the durable ledger. That is intentional and matches the operating system: the PM records roadmap/gate progress; the reviewer records final verdicts, commit ranges, and remaining dependencies. To avoid collisions, treat the reviewer's entries as append-only sign-off blocks and never rewrite each other's sections.

## Boundary discipline

Each agent writes **only** its own lane and stops at the boundary — matching the ownership model in the operating system. An agent that finds a problem upstream returns it to the owning agent instead of silently editing another lane. This mirrors the gate/rollback rules so nothing flows downstream unverified.
