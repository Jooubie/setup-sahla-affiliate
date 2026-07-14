# Setup Sahla evidence and compliance policy

This policy applies to research rows, canonical data, spreadsheets, reports, guides, product pages, creatives, and outbound commercial links. Evidence must support the specific fact for which it is cited; a source's authority in one area does not make it authoritative in another.

## Evidence hierarchy

Use the highest available source that is authoritative for the observation:

1. **Manufacturer and retailer primary sources.** Manufacturer specifications, manuals, compatibility matrices, safety notices, and warranty pages are primary for model identity and technical capabilities. Exact Amazon Egypt and Noon Egypt listings are primary for the listing title, seller/fulfillment observation, visible price, stock signal, visible rating/review count, returns or warranty wording, destination URL, and image-source link at capture time. A retailer listing does not independently prove a performance claim.
2. **Official trend and search data.** Google Trends, search-engine first-party tools, and named official keyword products are primary for the exact market, query, period, and metric or index they expose. If numeric keyword volume is unavailable, record a clearly labeled demand proxy; never convert a proxy into fabricated volume.
3. **Independent technical references.** Standards bodies, testing organizations, reputable technical publications, and independent subject-matter references can validate protocols, risks, interoperability, and comparative context. Record the method and limits, and do not rewrite an independent review as Setup Sahla's own hands-on test.

When sources conflict, record the conflict and prefer the source closest to the specific claim. Manufacturer documentation governs declared specifications; the exact retailer page governs its current listing observation; official trend/search data governs its own demand metric. An independent reference can explain or challenge a claim but cannot erase a model or market mismatch. Unsupported conflicts block the affected claim or selection.

## Evidence record rules

- Record one source observation per row in `research/evidence.csv`; do not combine multiple source URLs into one row.
- Use stable, unique `evidence_id` values and name every downstream record or page in `used_by`.
- Record the applicable market and the exact query, item, model, or listing observed.
- Store an ISO-8601 UTC capture time in `captured_at_utc` for every unstable retail, trend, search, price, stock, seller, rating, review-count, and link observation.
- Keep `metric_name`, `metric_value`, and `metric_unit` faithful to the named source. When the evidence is qualitative, describe it in `observation` and identify the proxy rather than inventing a number.
- Preserve the source name and direct source URL. Search-result snippets are discovery aids, not substitutes for the underlying page when that page is available.
- State limitations, conflicts, locale mismatch, exact-model uncertainty, and access constraints in `notes`.
- A missing required source, capture time, model match, or rights status fails the evidence gate; no downstream owner may fill it by inference.

## Affiliate-link status enum

The affiliate status field accepts only these exact values:

```text
DIRECT_LINK — AFFILIATE ID REQUIRED
AFFILIATE_LINK — VERIFIED
LINK DISABLED — REVIEW REQUIRED
```

- `DIRECT_LINK — AFFILIATE ID REQUIRED` means the destination is a verified direct retailer URL and no tracking identifier has been added. This is the launch default while owner credentials are absent.
- `AFFILIATE_LINK — VERIFIED` may be used only after the owner provides an approved program identifier and the completed deep link has been checked for the correct retailer, exact destination, and tracking behavior.
- `LINK DISABLED — REVIEW REQUIRED` means the URL failed, redirected unsafely, mismatched the exact item, or otherwise requires review. It must not appear in a prominent commercial CTA.

Never invent, infer, or borrow an affiliate identifier. A status change must record the reviewer, check date, and destination tested. Roll back a failed affiliate link to a verified direct URL with the direct-link status; if no safe direct URL exists, use the disabled status.

## Image-rights values

The image-rights field accepts only these values:

- `ORIGINAL`: Created for Setup Sahla, with the source file or generation record retained and no unlicensed logo, product photograph, or copied composition.
- `MANUFACTURER_PERMISSION_REVIEWED`: A manufacturer asset whose license or written permission has been reviewed for the intended channel and use; record the permission source and review date.
- `AFFILIATE_API`: Supplied through an approved retailer affiliate API or program-controlled delivery method and used within its current terms; record the program and retrieval context.
- `SOURCE_LINK_ONLY`: The source URL is retained for research and attribution, but the image itself must not be downloaded, copied, redistributed, or shown publicly.

Amazon or Noon listing images default to `SOURCE_LINK_ONLY`. The public site uses `ORIGINAL` visuals unless current manufacturer permission or an approved affiliate API is documented. If permission expires or cannot be confirmed, withdraw the asset and use the original fallback.

## Disclosure and commercial presentation

- Place a clear affiliate disclosure before the first commercial CTA on every page containing a retailer link. Do not hide it in the footer or place it only after the recommendation.
- Until an affiliate link is verified, the disclosure must not imply that Setup Sahla currently earns commission from that direct link. Explain the current state plainly.
- Name the retailer in CTA text and use honest language such as `Check current price on Amazon Egypt`.
- Apply sponsored/no-follow treatment to commercial links where appropriate and open external destinations safely.
- Present a price only as a dated snapshot with its currency and check date. If the price is missing or uncertain, show `Check current price`; never make a live-price promise.
- Every factual, commercial, specification, compatibility, price, trend, or comparative claim requires direct evidence that supports the exact claim being made.
- Editorial judgment is permitted only for explicitly subjective fit or preference conclusions. It must be labeled as judgment and cannot introduce unsupported facts, specifications, performance implications, comparisons, or market observations.
- Missing evidence is not cured by labeling a factual statement as opinion. Remove the statement or return it to the evidence gate.
- State compatibility gates before purchase links and include meaningful skip guidance.

## Preliminary plain-language claim templates

These neutral Task 1 templates support G3 claim review before the G4 voice guide exists. They are evidence/compliance patterns, not final branded copy:

- **Specification:** `[Model] lists [specification], according to [direct source].`
- **Compatibility:** `This fits only when [evidence-backed requirement]; check [device or port detail] before buying.`
- **Price:** `[EGP amount] snapshot observed at [retailer] on [date]; check the retailer for the current price.`
- **Commercial CTA:** `Check current price on [retailer].`
- **Skip guidance:** `Skip this if [evidence-backed incompatibility or explicitly subjective preference].`
- **Subjective fit:** `Editorial fit judgment: this may suit [user/use case] because [cited facts]; this is a fit conclusion, not a new product fact.`

G3 may use these templates to approve factual claims and clearly bounded fit conclusions. Editorial applies the completed G4 voice guide only during later guide drafting; G3 does not require or create the G4 voice guide.

## Prohibited practices

The following are prohibited in research, editorial copy, structured data, creatives, and UI:

- **Copied reviews:** Do not reproduce customer or publication reviews as Setup Sahla copy, aggregate them without a lawful source, or strip away attribution and context.
- **Invented testing:** Do not claim Setup Sahla used, benchmarked, measured, or lab-tested a product unless that testing actually occurred and its method is documented.
- **Fake scarcity:** Do not invent countdowns, low-stock claims, expiring prices, urgency, or limited-time language. A dated retailer stock observation is not permission to predict future availability.
- **Unsupported superlatives:** Do not use claims such as `best overall`, `fastest`, `cheapest`, `perfect`, or `must buy` unless evidence supports the exact comparison, market, model set, and capture date. Prefer `best fit for this use case` when the documented selection supports it.
- **Undated prices:** Do not publish a price without a snapshot date. Do not describe a snapshot as current after the check or use zero, a guess, or a stale value as a live price.

Also prohibited are scraped or redistributed retailer images, fabricated keyword volumes, retailer endorsement claims, guessed stock or compatibility, hidden commercial relationships, fake affiliate IDs, and silent replacement of one model with another.

## Corrections and failures

Anyone who finds a source, rights, claim, price, or link problem must record it and notify the owner of the earliest affected gate. Immediately disable a failed commercial link, qualify or remove unsupported copy, and preserve the reason for the change. Corrected material must repeat all downstream gates from the point of failure before republication.
