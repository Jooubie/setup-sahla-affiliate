# Setup Sahla operating system

This operating system governs the Egypt-first Setup Sahla launch and later MENA expansion. The approved design, global constraints, evidence ledger, and compliance policy are binding inputs at every gate. A gate passes only when its named owner records the required artifact and can point to the evidence behind the decision. Work that does not pass a gate must not flow downstream.

## Stage gates

### G0 Brief

- **Owner:** Research Integration.
- **Required inputs:** Approved business design; launch-plan global constraints; target market, audience, exclusions, five-product and three-guide limits; open owner/account dependencies.
- **Pass condition:** The launch problem, audience, market, prohibited scope, output counts, evidence standard, and unresolved owner dependencies are explicit and mutually consistent.
- **Artifact:** A dated brief acceptance recorded in the task report and durable execution ledger.
- **Rollback action:** Stop downstream work, restore the last approved brief, record the changed assumption, and route the revision back to the business owner before gathering evidence.

### G1 Evidence

- **Owner:** Product/Provider Research and SEO/Trend Research, within their separate research files.
- **Required inputs:** Passed G0 Brief; `research/evidence.csv` field contract; evidence hierarchy; candidate problem clusters; approved market and freshness rules.
- **Pass condition:** Every material or unstable observation is represented by one source observation with a source URL, capture time, market, metric or labeled proxy, rights status where relevant, and intended use. Product/provider and SEO/trend agents have not edited the same staging CSV.
- **Artifact:** Product/provider and SEO/trend staging ledgers ready for integration into `research/evidence.csv`.
- **Rollback action:** Quarantine incomplete or conflicting rows, remove them from selection use, and return the named gap to the responsible research owner.

### G2 Selection

- **Owner:** Research Integration.
- **Required inputs:** Passed G1 Evidence; candidate, provider, keyword, and evidence ledgers; the approved 100-point score; compatibility, safety, counterfeit, and model-identity risk notes.
- **Pass condition:** Exactly five opportunities pass the score and rejection rules; each has a concrete problem, local provider, buyer-intent path, compatibility guidance, risk note, closest rejected alternative, and traceable evidence. Exactly three non-overlapping guide intents are assigned.
- **Artifact:** Validated canonical product records, schema, keyword map, and evidence-backed research report.
- **Rollback action:** Remove the unsupported selection from canonical data and return it to G1 Evidence; do not substitute a candidate until its full evidence package passes.

After G2 Selection passes, G3 Claims and G4 Creative run as independent parallel branches. Neither gate consumes the other gate's artifact. Both branches must pass before Editorial drafts the three guides, and G5 Publish requires the completed outputs of both branches.

### G3 Claims

- **Owner:** Research Integration.
- **Required inputs:** Passed G2 Selection; canonical product records; approved evidence IDs and URLs; evidence/compliance rules; and the preliminary plain-language claim templates defined in Task 1.
- **Pass condition:** Every factual, commercial, specification, compatibility, price, trend, or comparative claim requires direct evidence that supports that exact claim. Editorial judgment is permitted only for explicitly subjective fit or preference conclusions, must be labeled as such, and cannot introduce unsupported facts. Prices are dated snapshots, limitations and skip guidance are present, and planned disclosure precedes the first commercial CTA.
- **Artifact:** Approved evidence-bound factual claim records and a source-linked claim inventory for later Editorial use.
- **Rollback action:** Remove the unsupported claim, disable affected commercial copy, and reopen G1 Evidence with the responsible research owner when new direct evidence is needed.

### G4 Creative

- **Owner:** Identity/Creatives.
- **Required inputs:** Passed G2 canonical data and selection rationale; approved design specification; and Task 1 evidence/compliance rules, including image rights and accessibility requirements.
- **Pass condition:** Every public visual is original or has an approved rights value, contains no unapproved retailer asset or logo, matches the brand system, truthfully depicts the setup, and meets accessibility and delivery-size requirements.
- **Artifact:** Brand tokens and system, voice guide, tested vector identity assets, and original launch creative set.
- **Rollback action:** Withdraw the asset, replace it with an approved original fallback, record the rights or accuracy defect, and return it to Identity/Creatives.

### G5 Publish

- **Owner:** Website, with Final Review approval.
- **Required inputs:** Passed G2 canonical data; passed G3 evidence-bound claim records and claim inventory; completed G4 brand tokens, voice guide, and assets; exactly three guide manuscripts drafted by Editorial after consuming both G3 and G4 outputs; operating/compliance policies; required route list; and the full verification matrix.
- **Pass condition:** The production build contains exactly five product opportunities and three guides; disclosure appears before the first commercial CTA; links, metadata, structured data, responsive behavior, accessibility, data validation, tests, and build checks pass; owner-only dependencies remain explicit.
- **Artifact:** Verified static production build, launch checklist, deployment record when available, and release commit.
- **Rollback action:** Stop publication or restore the last verified build, set unsafe outbound links to the disabled status, and reopen the earliest failed gate.

### G6 Refresh

- **Owner:** Final Review, coordinating the research, editorial, creative, and website owners as needed.
- **Required inputs:** Published G5 artifact; current canonical data and evidence; retail audit results; link-validation results; content performance and correction notes; prior refresh record.
- **Pass condition:** Retail links, exact listings, prices, stock observations, seller/fulfillment notes, affiliate status, evidence dates, claims, content intent, and asset rights have been reviewed at their required cadence; stale or failed items are corrected, qualified, disabled, or removed and the refreshed build passes G5 again.
- **Artifact:** Dated refresh record in the durable ledger plus refreshed evidence, canonical data, content, and build artifacts where changes were required.
- **Rollback action:** Restore the last verified artifact, change a failed commercial link to `LINK DISABLED — REVIEW REQUIRED`, remove it from prominent CTAs, and reopen the earliest gate affected by the stale or failed evidence.

## Operating cadence

- **Retail checks:** The cadence is launch-day plus every 14 days thereafter. Verify each exact listing, direct or affiliate URL, snapshot price, stock observation, seller/fulfillment note, image-rights status, and checked date.
- **Content refresh review:** Run every 90 days. Reassess search intent, demand evidence, technical claims, compatibility, internal links, article usefulness, disclosure, and continued fit of every recommendation.
- **Failed-link response:** Run an immediate review when a link fails, regardless of either scheduled cadence. Remove the link from prominent CTAs and set `LINK DISABLED — REVIEW REQUIRED` until a verified destination passes review.

Every refresh records who checked the item, when it was checked, which source was used, what changed, and which downstream artifacts were rebuilt. A checked date is evidence of a review, not a claim that price or stock remains live after that moment.

## Handoff and rollback discipline

An owner may accept a handoff only when the prior gate artifact exists and all unresolved limitations are visible. A downstream owner must not silently repair upstream source data: they reopen the originating gate and preserve the rejected evidence or decision in the report. Rollbacks favor a truthful, non-commercial fallback over an unsupported recommendation, guessed value, unlicensed image, or broken link.
