# Setup Sahla affiliate activation runbook

This runbook turns verified direct retailer destinations into commission-capable links only after the owner has the relevant approval and a tracked destination passes review. It does not create accounts, supply identifiers, or provide legal/tax advice.

Policy sources reviewed: 2026-07-14 UTC

- [Amazon Egypt Associates enrollment](https://affiliate-program.amazon.eg/welcome)
- [Amazon Egypt Associates Operating Agreement](https://affiliate-program.amazon.eg/help/operating/agreement)
- [Amazon Egypt Associates Program Policies](https://affiliate-program.amazon.eg/help/operating/policies/)
- [Noon Associate Marketing Terms](https://affiliates.noon.com/en/terms)
- [Noon Egypt storefront](https://www.noon.com/egypt-en/)

Program terms can change. Re-review the current official pages before enrollment, activation, or a 90-day policy refresh; this reviewed date is not a promise that the terms remain unchanged.

## Activation states

Only these link states are valid:

- `DIRECT_LINK — AFFILIATE ID REQUIRED`: verified direct retailer destination; no tracking identifier is present. This is the launch default.
- `AFFILIATE_LINK — VERIFIED`: owner-approved program identifier is present and the final exact-model destination and tracking behavior were checked.
- `LINK DISABLED — REVIEW REQUIRED`: failed, unsafe, mismatched, or unresolved destination; do not show it as a prominent CTA.

A status change must record the product, retailer, direct URL, affiliate URL if applicable, owner-supplied account/tag, reviewer, UTC check time, exact destination reached, result, and rollback URL. Never infer, borrow, or hand-edit a tracking identifier.

## Amazon Egypt Associates activation

The research captured an official Amazon Egypt Associates enrollment page and an operating agreement that requires program-formatted tagged links for tracking. Approval remains discretionary and owner-controlled.

### Phase A — pre-application

1. Publish the original-content Setup Sahla site at [OWNER INPUT REQUIRED — domain].
2. Verify that the site clearly identifies its purpose and owner contact route and includes affiliate disclosure, privacy, methodology, about, and useful editorial content.
3. Confirm all public product visuals are original unless a separate permission or approved program-content record exists.
4. Prepare owner identity, payment details, tax information, and any website/app details requested by the current application. No Amazon tracking tag is available or required at this pre-application stage.
5. Complete [OWNER INPUT REQUIRED — legal and tax review] before representing or receiving affiliate income.
6. Record the public URL and pre-application review. Do not generate, guess, or request insertion of a tag before enrollment.

### Phase B — enrollment

1. Apply through the official Amazon Egypt Associates enrollment flow using the already-public site.
2. Retain the enrollment/account result privately. Approval and any assigned account/tag values come from Amazon, not from the build.
3. Keep every Amazon destination as `DIRECT_LINK — AFFILIATE ID REQUIRED` while enrollment or account access is unresolved.

### Phase C — post-enrollment tag setup

1. After enrollment provides account access, obtain [OWNER INPUT REQUIRED — Amazon Associates ID/tag] from the owner's approved account.
2. Start from the approved canonical direct Amazon Egypt URL for one exact product.
3. Generate the special tagged link using the current Amazon Associates tool available in that account.
4. Open `npm run intake:admin` and store the complete generated link under that exact product and retailer as `pending`. Product Control writes the gitignored `.vault/affiliate-links.local.json`; do not place the URL in editorial prose or canonical evidence.
5. Open the generated destination and verify retailer, Egypt storefront, exact model/variant, secure protocol, expected tag behavior, and absence of unrelated redirects.
6. Record reviewer and UTC check time, then mark only that dashboard link `verified`. The site prebuild resolver changes only that provider's runtime status to `AFFILIATE_LINK — VERIFIED`.
7. Repeat one link at a time. A successful link does not approve the others.
8. Keep the known-safe direct destination as rollback. If the tagged link fails later, restore the direct link or disable it.

### Phase D — disclosure and rendering

#### Required Amazon Associate identification

After Setup Sahla is enrolled and participates in Amazon Associates, publish this clear identification separately from any contextual link notice:

> As an Amazon Associate I earn from qualifying purchases.

Keep it plainly visible on the affiliate-disclosure page and wherever the current Amazon policy requires. Do not display it as a claim of participation before enrollment is active.

#### Contextual commission disclosure

Before the first verified affiliate CTA on each commercial page, use a clear contextual notice such as: “Setup Sahla may earn a commission from qualifying purchases made through eligible affiliate links, at no extra cost to you.” This page-level notice explains the link context; it does not replace the required Amazon Associate identification.

#### Direct-link wording before activation

While a provider link is still direct, use wording that does not imply current affiliate credit: “This is a direct retailer link. Affiliate tracking is not active for this link.” Direct-link wording must not include the Amazon Associate identification unless Setup Sahla is already an enrolled participant elsewhere on the site.

- Name the retailer in CTA text, apply the exact relationship attributes below through the shared component, and never imply Amazon endorses Setup Sahla.
- Use only program-supplied product content within its current terms. Ordinary listing images remain `SOURCE_LINK_ONLY` and are not public creative.
- Render every verified affiliate link deterministically with `target="_blank" rel="sponsored nofollow noopener noreferrer"`; do not omit or reorder these rel tokens in the shared commercial-link component.
- Safe external-link rule: require HTTPS, allowlist the approved Amazon Egypt or Noon Egypt host, preserve the verified exact-model destination, reject user-controlled destination input, and inspect the final redirect before activation.
- A direct non-affiliate commercial link uses `target="_blank" rel="nofollow noopener noreferrer"` until its status becomes verified affiliate.

## Noon Egypt decision

The current public Noon Associate Marketing terms define the program territory as the **UAE and Saudi Arabia**. Record Noon Egypt eligibility exactly as `Unverified — public terms do not establish Egypt eligibility`. Noon operates an Egypt storefront, so its exact product pages can remain useful provider destinations, but all Noon Egypt links stay direct with tracking inactive until [OWNER INPUT REQUIRED — Noon Egypt eligibility confirmation] is received and retained.

Owner verification procedure:

1. Ask Noon affiliate support in writing whether the owner's account may earn from Egypt storefront transactions and Egypt destination URLs.
2. Request the applicable agreement/territory language, link-generation method, attribution rules, and permitted program-content terms.
3. Retain the written response and review it with the owner's legal/tax adviser.
4. If Egypt is not supported or the answer is unclear, keep `DIRECT_LINK — AFFILIATE ID REQUIRED`, retain `Unverified — public terms do not establish Egypt eligibility`, and do not describe the link as affiliate or commission-earning.
5. If Egypt eligibility is explicitly confirmed, generate and test each link separately, then use `AFFILIATE_LINK — VERIFIED` only for destinations that pass.

No Noon product imagery may be scraped. An approved account still requires a fresh program-content rights review before public use.

## Link governance

### Required registry fields

| Field | Rule |
|---|---|
| Product and provider ID | Must map to the canonical exact model and retailer |
| Direct URL | Verified Egypt retailer product-detail destination |
| Affiliate URL | Empty until generated through an approved program method; stored only in the private Product Control registry |
| Status | One of the three exact activation states |
| Noon eligibility | `Unverified — public terms do not establish Egypt eligibility` until written owner confirmation is retained |
| Owner account reference | Owner-supplied non-secret identifier; never guessed |
| Destination checked | Final retailer, market, model, and variant reached |
| Checked at / reviewer | ISO-8601 UTC timestamp and named operator |
| Disclosure mode | Direct-link wording or verified-affiliate wording |
| Rollback URL | Last known safe direct destination |
| Failure note | Redirect, mismatch, broken page, unsafe behavior, or policy issue |

### State transitions

For Amazon: `DIRECT_LINK — AFFILIATE ID REQUIRED` → completed enrollment/account access → owner-supplied tag → program-generated link → exact-destination test → `AFFILIATE_LINK — VERIFIED`.

For Noon Egypt: `DIRECT_LINK — AFFILIATE ID REQUIRED` plus `Unverified — public terms do not establish Egypt eligibility` → written Egypt eligibility confirmation → owner-supplied program link → exact-destination test → `AFFILIATE_LINK — VERIFIED`.

Any state → failed destination, changed model, unsafe redirect, or policy uncertainty → `LINK DISABLED — REVIEW REQUIRED` → remove prominent CTA → reopen the earliest evidence/claim gate → reverify → safe direct or verified affiliate state.

### Review cadence

- On launch day and every 14 days: verify exact listing, destination, price snapshot, seller/fulfillment note, stock observation, return/warranty wording when used, affiliate state, and checked date.
- Immediately after any reader report or automated failure: remove the prominent CTA, set the disabled state, and stop further distribution of the affected link.
- Within one business day after containment: complete incident documentation, assign follow-up, and record the next review; this follow-up SLA never delays immediate CTA removal.
- Every 90 days: re-read applicable program terms, disclosure language, image/content permissions, and all commercial-page claims.
- On any tag or account change: retest every affected link; do not assume prior verification transfers.

## Disclosure placement and records

Disclosure appears before the first commercial CTA on every page with a retailer link. The footer may repeat it but cannot replace the page-level disclosure. Direct-link disclosure and verified-affiliate disclosure are different states and must not be mixed.

Keep a private program folder with application/approval records, current terms capture, tag/account reference, support confirmations, payment/tax setup, and review dates. Keep secrets and personal data out of source control. The public corrections path should let readers report mismatched links without exposing private account details.

## Owner inputs

- [OWNER INPUT REQUIRED — domain]
- [OWNER INPUT REQUIRED — Amazon Associates ID/tag] after enrollment supplies the owner's approved value
- [OWNER INPUT REQUIRED — Noon Egypt eligibility confirmation]
- [OWNER INPUT REQUIRED — analytics platform]
- [OWNER INPUT REQUIRED — email platform]
- [OWNER INPUT REQUIRED — legal and tax review]
- [OWNER INPUT REQUIRED — owner contact and correction inbox]
- [OWNER INPUT REQUIRED — payment and identity details requested by each approved program]

Until these are supplied, direct provider links and original content keep the site publication-ready, but affiliate monetization remains inactive or only partially active.
