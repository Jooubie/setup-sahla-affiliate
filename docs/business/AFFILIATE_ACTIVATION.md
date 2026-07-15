# Setup Sahla affiliate activation runbook

This runbook turns verified direct retailer destinations into commission-capable links only after the owner has the relevant approval and a tracked destination passes review. It does not create accounts, supply identifiers, or provide legal/tax advice.

## Activation states

Only these link states are valid:

- `DIRECT_LINK — AFFILIATE ID REQUIRED`: verified direct retailer destination; no tracking identifier is present. This is the launch default.
- `AFFILIATE_LINK — VERIFIED`: owner-approved program identifier is present and the final exact-model destination and tracking behavior were checked.
- `LINK DISABLED — REVIEW REQUIRED`: failed, unsafe, mismatched, or unresolved destination; do not show it as a prominent CTA.

A status change must record the product, retailer, direct URL, affiliate URL if applicable, owner-supplied account/tag, reviewer, UTC check time, exact destination reached, result, and rollback URL. Never infer, borrow, or hand-edit a tracking identifier.

## Amazon Egypt Associates activation

The research captured an official Amazon Egypt Associates enrollment page and an operating agreement that requires program-formatted tagged links for tracking. Approval remains discretionary and owner-controlled.

### Phase A — application readiness

1. Publish the original-content Setup Sahla site at [OWNER INPUT REQUIRED — domain].
2. Verify that the site clearly identifies its purpose and owner contact route and includes affiliate disclosure, privacy, methodology, about, and useful editorial content.
3. Confirm all public product visuals are original unless a separate permission or approved program-content record exists.
4. Prepare [OWNER INPUT REQUIRED — Amazon Associates ID/tag], owner identity, payment details, tax information, and any website/app details requested by the current application.
5. Complete [OWNER INPUT REQUIRED — legal and tax review] before representing or receiving affiliate income.
6. Apply through the official Amazon Egypt Associates enrollment flow and retain approval/account records privately; do not commit secrets or personal details to the repository.

### Phase B — tagged-link conversion

1. Start from the approved canonical direct Amazon Egypt URL for one exact product.
2. Generate the special tagged link using the current Amazon Associates tool available in the approved account.
3. Store the owner-provided tag in the deployment secret/configuration path, not in editorial prose. Do not invent a fallback tag.
4. Open the generated destination and verify retailer, Egypt storefront, exact model/variant, secure protocol, expected tag behavior, and absence of unrelated redirects.
5. Record reviewer and UTC check time. Change only that provider record to `AFFILIATE_LINK — VERIFIED`.
6. Repeat one link at a time. A successful link does not approve the others.
7. Keep the known-safe direct destination as rollback. If the tagged link fails later, restore the direct link or disable it.

### Phase C — disclosure and content check

- Before the first verified affiliate CTA, use a clear disclosure such as: “Setup Sahla may earn a commission from qualifying purchases made through eligible affiliate links, at no extra cost to you.”
- While every link is still direct, use wording that does not imply current earnings, such as: “These are direct retailer links. Affiliate tracking will be enabled only after program approval and verification.”
- Name the retailer in CTA text, apply sponsored/no-follow treatment where appropriate, and never imply Amazon endorses Setup Sahla.
- Use only program-supplied product content within its current terms. Ordinary listing images remain `SOURCE_LINK_ONLY` and are not public creative.

## Noon Egypt decision

The current public Noon Associate Marketing terms define the program territory as the **UAE and Saudi Arabia**. That wording does not establish Egypt commission eligibility. Noon operates an Egypt storefront, so its exact product pages can remain useful provider destinations, but all Noon Egypt links stay direct and non-monetized until [OWNER INPUT REQUIRED — Noon Egypt eligibility confirmation] is received and retained.

Owner verification procedure:

1. Ask Noon affiliate support in writing whether the owner's account may earn from Egypt storefront transactions and Egypt destination URLs.
2. Request the applicable agreement/territory language, link-generation method, attribution rules, and permitted program-content terms.
3. Retain the written response and review it with the owner's legal/tax adviser.
4. If Egypt is not supported or the answer is unclear, keep `DIRECT_LINK — AFFILIATE ID REQUIRED` and do not describe the link as affiliate, monetized, or commission-earning.
5. If Egypt eligibility is explicitly confirmed, generate and test each link separately, then use `AFFILIATE_LINK — VERIFIED` only for destinations that pass.

No Noon product imagery may be scraped. An approved account still requires a fresh program-content rights review before public use.

## Link governance

### Required registry fields

| Field | Rule |
|---|---|
| Product and provider ID | Must map to the canonical exact model and retailer |
| Direct URL | Verified Egypt retailer product-detail destination |
| Affiliate URL | Empty until generated through an approved program method |
| Status | One of the three exact activation states |
| Owner account reference | Owner-supplied non-secret identifier; never guessed |
| Destination checked | Final retailer, market, model, and variant reached |
| Checked at / reviewer | ISO-8601 UTC timestamp and named operator |
| Disclosure mode | Direct-link wording or verified-affiliate wording |
| Rollback URL | Last known safe direct destination |
| Failure note | Redirect, mismatch, broken page, unsafe behavior, or policy issue |

### State transitions

`DIRECT_LINK — AFFILIATE ID REQUIRED` → owner approval and generated link → exact-destination test → `AFFILIATE_LINK — VERIFIED`.

Any state → failed destination, changed model, unsafe redirect, or policy uncertainty → `LINK DISABLED — REVIEW REQUIRED` → remove prominent CTA → reopen the earliest evidence/claim gate → reverify → safe direct or verified affiliate state.

### Review cadence

- On launch day and every 14 days: verify exact listing, destination, price snapshot, seller/fulfillment note, stock observation, return/warranty wording when used, affiliate state, and checked date.
- Immediately after any reader report or automated failure: remove the prominent CTA and investigate.
- Every 90 days: re-read applicable program terms, disclosure language, image/content permissions, and all commercial-page claims.
- On any tag or account change: retest every affected link; do not assume prior verification transfers.

## Disclosure placement and records

Disclosure appears before the first commercial CTA on every page with a retailer link. The footer may repeat it but cannot replace the page-level disclosure. Direct-link disclosure and verified-affiliate disclosure are different states and must not be mixed.

Keep a private program folder with application/approval records, current terms capture, tag/account reference, support confirmations, payment/tax setup, and review dates. Keep secrets and personal data out of source control. The public corrections path should let readers report mismatched links without exposing private account details.

## Owner inputs

- [OWNER INPUT REQUIRED — domain]
- [OWNER INPUT REQUIRED — Amazon Associates ID/tag]
- [OWNER INPUT REQUIRED — Noon Egypt eligibility confirmation]
- [OWNER INPUT REQUIRED — analytics platform]
- [OWNER INPUT REQUIRED — email platform]
- [OWNER INPUT REQUIRED — legal and tax review]
- [OWNER INPUT REQUIRED — owner contact and correction inbox]
- [OWNER INPUT REQUIRED — payment and identity details requested by each approved program]

Until these are supplied, direct provider links and original content keep the site publication-ready, but affiliate monetization remains inactive or only partially active.

