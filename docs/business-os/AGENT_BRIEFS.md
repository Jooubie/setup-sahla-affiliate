# Setup Sahla focused agent briefs

These briefs are file-bound execution contracts. All agents must follow `OPERATING_SYSTEM.md`, `EVIDENCE_AND_COMPLIANCE.md`, the approved design, the launch-plan global constraints, and prior passed gate artifacts. Reading repository inputs is allowed; writing is limited to each brief's allowed files. Agents must preserve user changes, report uncertainty, and stop at their boundary rather than editing another owner's output.

## Product/Provider Research

- **Scope:** Research at least twelve problem-led candidates across the approved clusters; verify exact models and Amazon Egypt/Noon Egypt availability; capture manufacturer specifications, compatibility, local provider observations, dated prices, seller/fulfillment notes, risks, and closest alternatives. Make no final selection.
- **Allowed files:** Only `research/product-candidates.csv`, `research/product-evidence.csv`, and `research/reports/product-provider-research.md`. This agent may create their parent directories but may not edit any other path. It owns `research/product-candidates.csv` and `research/product-evidence.csv`; it must not edit `research/evidence.csv`, `research/keywords.csv`, or `research/seo-evidence.csv`.
- **Required evidence:** One row per source observation; direct manufacturer and exact retailer URLs; Egypt market; exact model/listing identity; ISO-8601 UTC capture time for unstable observations; snapshot price in EGP; stock and seller/fulfillment wording; compatibility and safety sources; source-linked risk and rejection notes; rights status for every image-source observation.
- **Prohibited actions:** Final product selection; fabricated values; combined multi-URL rows; copied reviews; invented testing; scraping or redistributing listing images; adding affiliate IDs; editing canonical or SEO files; treating rating/review counts as proof of quality.
- **Expected report path:** `research/reports/product-provider-research.md`.
- **Completion criteria:** At least twelve candidates cover all approved problem clusters; every candidate has a traceable evidence package and provider outcome; high-risk candidates are clearly rejected; all rows validate against the canonical evidence fields needed by Research Integration; the report lists gaps without guessing.

## SEO/Trend Research

- **Scope:** Research Egypt/MENA demand, buyer intent, English, Arabic, and transliterated query variants; document trend direction, labeled demand proxies or sourced volume, competition/content gaps, and non-overlapping product and guide intent assignments. Make no product selection.
- **Allowed files:** Only `research/keywords.csv`, `research/seo-evidence.csv`, and `research/reports/seo-trend-research.md`. This agent may create their parent directories but may not edit any other path. It owns `research/keywords.csv` and `research/seo-evidence.csv`; it must not edit `research/evidence.csv`, `research/product-candidates.csv`, or `research/product-evidence.csv`.
- **Required evidence:** Named official trend/search source where available; exact query, locale, period, metric or explicitly labeled proxy; direct source URL; ISO-8601 UTC capture time; language and intent; competition observation; mapped problem cluster and proposed route; clear limitations when a commercial keyword tool is unavailable.
- **Prohibited actions:** Fabricated volume; converting indexed interest or result counts into search volume; choosing final products; editing product/provider staging; merging the canonical evidence ledger; unsupported traffic forecasts; copied competitor text; creating overlapping guide intents without flagging the conflict.
- **Expected report path:** `research/reports/seo-trend-research.md`.
- **Completion criteria:** Each proposed product route and all three proposed guide routes have one primary query and at least four supporting variants, including relevant Arabic/transliterated rows; intent overlap and evidence limits are documented; every metric/proxy traces to a single staged source row.

## Research Integration

- **Scope:** Review the two staged research packages, reject incomplete rows, merge accepted observations into the canonical evidence ledger, score candidates, select exactly five opportunities, assign exactly three guide intents, build the validated canonical schema/data and evidence-backed report, and own G3 by creating evidence-bound factual claim records from the passed canonical selection.
- **Allowed files:** `research/evidence.csv`, `data/`, `scripts/validate_research.mjs`, `tests/research-data.test.mjs`, and `docs/research/`. Research Integration alone may merge staged rows from `research/product-evidence.csv` and `research/seo-evidence.csv` into `research/evidence.csv`; it must not rewrite either agent's staged CSV.
- **Required evidence:** Passed Product/Provider and SEO/Trend reports; one canonical row per accepted source observation; source IDs referenced by every product; documented 100-point score components; exact-model/provider evidence; primary keyword source and capture time; risks, closest rejected alternative, compatibility, and affiliate/image status values. G3 additionally requires passed G2 canonical data, approved evidence IDs/URLs, Task 1 evidence/compliance rules, and the preliminary plain-language claim templates.
- **Prohibited actions:** Filling research gaps by inference; changing staged observations without returning them to the owner; inventing affiliate IDs, volumes, prices, stock, claims, or model matches; presenting any factual, commercial, specification, compatibility, price, trend, or comparative claim without direct supporting evidence; using editorial judgment outside a labeled subjective fit/preference conclusion or to introduce unsupported facts; selecting a candidate with unresolved counterfeit, electrical-safety, or model-identity risk; producing other teams' assets or site code.
- **Expected report path:** `docs/research/PRODUCT_RESEARCH_REPORT.md`.
- **Completion criteria:** `research/evidence.csv` preserves its canonical header and contains only reviewed rows; exactly five valid, unique canonical records and exactly three non-overlapping guide assignments exist; score totals and evidence IDs validate; automated research validation/tests pass; the report explains selection, rejection, limitations, and sources; and G3 passes with evidence-bound claim records in which every factual claim traces directly to canonical evidence.

## Identity/Creatives

- **Scope:** Define the Setup Sahla identity and voice system; create accessible logo assets and original category/lifestyle creatives that express practical setup fixes; test every required brand asset.
- **Allowed files:** `brand/`, `public/brand/`, and `tests/brand-assets.test.mjs` only.
- **Required evidence:** Passed G2 canonical data and selection rationale; approved design specification; Task 1 evidence/compliance and image-rights rules; documented asset origin; one allowed image-rights value per asset; source/permission and review date for any non-original asset; accessible title/alt guidance, color contrast results, dimensions, formats, and file-size audit. G4 does not require or consume G3 output.
- **Prohibited actions:** Copying retailer photography or reviews; using a retailer logo; depicting impossible ports/cables or unsupported product behavior; claiming permission without a record; editing product data, editorial content, or site code; embedding promotional or price text into images.
- **Expected report path:** `brand/IDENTITY_CREATIVE_REPORT.md`.
- **Completion criteria:** Brand and voice rules are actionable; all required SVG/raster assets exist and are original or permission-reviewed; SVGs are accessible; raster sizes/dimensions pass the asset test and audit; any limitation or replacement condition is documented.

## Editorial

- **Scope:** After the independent G3 and G4 branches both pass, consume Research Integration's G3 evidence-bound claim records and Identity/Creatives' completed G4 voice guide/assets to write exactly three complete English launch guides from approved keyword assignments, with Arabic-aware terminology where natural; add compatibility gates, skip guidance, disclosures, FAQs, and contextual links to all five products. Editorial owns neither G3 nor G4.
- **Allowed files:** `content/guides/` and `docs/editorial/` only.
- **Required evidence:** Passed G3 evidence-bound claim records and source-linked claim inventory; completed G4 brand tokens, voice guide, and approved assets; approved keyword map; at least two direct source URLs per guide; published/updated dates; exact price capture dates for any price mentioned; and claim-level support for factual, technical, compatibility, trend, comparative, and commercial statements.
- **Prohibited actions:** Adding or changing products, scores, prices, providers, affiliate status, or keywords in canonical sources; editing or claiming ownership of G3 claim records or G4 identity outputs; presenting a factual claim without direct supporting evidence; using editorial judgment for anything except an explicitly subjective fit or preference conclusion; allowing a subjective conclusion to introduce unsupported facts; copied reviews or competitor copy; invented testing; fake scarcity; unsupported superlatives; undated prices; hiding disclosure after a CTA; drafting guides before both G3 and G4 pass; writing more or fewer than three launch guides.
- **Expected report path:** `docs/editorial/EDITORIAL_REPORT.md`.
- **Completion criteria:** Exactly three publication-ready source guides consume both passed G3 claims and completed G4 voice/assets, have unique intent and complete metadata, place disclosure before the first commercial CTA, link contextually to all five products, preserve direct claim/source traceability, and pass content-policy checks without an unresolved failure.

## Website

- **Scope:** After canonical data exists, initialize the installed Sites React/Vite/vinext project exactly once, integrate approved brand assets and guide sources, render the required public routes and truthful structured data, implement safe commercial components, and run the full supported site verification matrix.
- **Allowed files:** Only `site/`, and only after validated canonical data exists. The agent may read approved files elsewhere but must not edit or copy changes back outside `site/`.
- **Required evidence:** Passed canonical data and validation output; approved brand assets/rights; exactly three approved guide sources; evidence/compliance rules; link status and checked dates; initializer provenance; preserved `sites()` Vite plugin and hosting metadata; route, metadata, accessibility-semantics, overflow-risk, reduced-motion, link, test, type-check, and Cloudflare Worker-compatible production-build results. Delegated/background work does not open or automate a browser unless the user separately requests browser QA.
- **Prohibited actions:** Starting before canonical data exists; editing research, canonical data, source articles, brand assets, outputs, or business policy; appending fake affiliate IDs; scraping prices, stock, or images at runtime; rendering disabled links as CTAs; inventing schema values; adding accounts, checkout, cookies, analytics, or unapproved services.
- **Expected report path:** `site/WEBSITE_IMPLEMENTATION_REPORT.md`.
- **Completion criteria:** All required routes build from the approved inputs; exactly five products and three guides render; disclosure precedes first commercial CTA; retailer links use safe honest wording and status behavior; navigation, internal links, responsive CSS rules, accessibility semantics, metadata, schema, tests, checks, and the supported Sites production build pass.

## Final Review

- **Scope:** Independently inspect specification compliance and quality across all artifacts; run the full clean-state verification matrix; inspect outbound links, workbook, PDFs, supported Sites deployment state, and owner dependencies; assign every defect to the earliest responsible gate and verify fixes.
- **Allowed files:** Read the full repository. Write only `docs/launch/` and `.superpowers/sdd/progress.md`. Product, evidence, brand, content, deliverable, or site fixes must be returned to their owning agent rather than silently edited by Final Review.
- **Required evidence:** Approved design and plan; all task reports and commit ranges; fresh command output from every required test/build/link check; generated-route, keyboard/focus semantics, minimum tap-target, overflow-risk, and reduced-motion checks; disclosure and outbound-link inspection; workbook/PDF render inspection; terminal deployment result and live URL if deployment is claimed. Browser QA is excluded unless the user separately requests it.
- **Prohibited actions:** Approving on an implementer's assertion; skipping or weakening checks; fixing outside allowed files; claiming deployment without terminal success and a live URL; treating owner account activation as complete; accepting Critical or Important findings; inventing benchmarks or operational results.
- **Expected report path:** `docs/launch/FINAL_REVIEW_REPORT.md`.
- **Completion criteria:** Specification and quality receive separate evidence-backed verdicts; all Critical and Important findings are fixed and re-reviewed; the full verification matrix passes fresh; launch/refresh/affiliate owner actions are explicit; the durable ledger records task commit ranges and the exact remaining account dependency.

## Parallel research handoff

Product/Provider Research and SEO/Trend Research may run in parallel because they do not edit the same CSV. Their ownership is exclusive:

- Product/Provider Research writes `research/product-candidates.csv` and `research/product-evidence.csv`.
- SEO/Trend Research writes `research/keywords.csv` and `research/seo-evidence.csv`.
- Research Integration alone reviews and merges accepted staged rows into `research/evidence.csv`.

No agent resolves a merge collision by editing another agent's file. A staged row remains attributable to its researcher even when Research Integration assigns the canonical `evidence_id`, records acceptance, or rejects it with a reason.
