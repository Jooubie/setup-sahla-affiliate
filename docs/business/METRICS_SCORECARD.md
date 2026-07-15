# Setup Sahla launch metrics scorecard

This scorecard measures whether Setup Sahla is discoverable, useful, commercially navigable, and compliant. It does not assume that an outbound click becomes a sale, and it contains no market benchmark, traffic forecast, conversion forecast, commission assumption, or revenue projection.

## Measurement rules

1. Label a value **Observed** only when it comes from the named source and a complete, verified collection window.
2. Label each operating goal **TARGET**. Targets are internal control points, not claims about market behavior.
3. Use `Not configured`, `Not eligible`, `Incomplete window`, or `Not enough data` instead of zero when measurement is unavailable.
4. Treat retailer outbound clicks as qualified commercial navigation, not purchases or commission.
5. Report Amazon commission only after an approved tagged link exists and the program reports the result. Keep Noon Egypt commission as `Not eligible/unverified` until written Egypt eligibility is retained.
6. Do not compare periods with materially different tracking uptime without stating the limitation.

Baseline window: first complete measurement period after [OWNER INPUT REQUIRED — analytics platform] and Search Console are verified. No market benchmark is substituted for the missing baseline.

## Launch scorecard

| Metric | Definition / formula | Baseline | Target | Measurement source | Cadence | Decision use |
|---|---|---|---|---|---|---|
| Published launch inventory | Count of approved public product pages and complete launch guides | Release record | TARGET: five product pages and three launch guides at release | Route/build manifest | Release | Block launch if counts differ |
| Commercial disclosure compliance | Pages with disclosure before first retailer CTA ÷ pages with retailer CTAs | Prelaunch audit | TARGET: 100% | Page audit / automated content check | Release and weekly | Roll back non-compliant page |
| Retail-link freshness | Enabled retailer destinations checked within the last 14 days ÷ enabled retailer destinations | Launch-day audit | TARGET: 100% | Provider/link registry | Every 14 days | Recheck or disable stale links |
| Failed-link containment time | Time from observed failure to prominent CTA removal | Not enough data | TARGET: within one business day | Incident/correction log | Per incident | Escalate unresolved failure |
| Affiliate link status coverage | Count by direct, verified-affiliate, and disabled state | Launch registry | TARGET: 100% of retailer links have one valid recorded state | Provider/link registry | Every 14 days | Prevent unknown tracking state |
| Amazon activation readiness | Required owner inputs and application/site checks completed | Owner inputs pending | TARGET: application-ready after public launch; no approval-time forecast | Owner activation checklist | Weekly until resolved | Submit or resolve blocker |
| Noon Egypt eligibility | Written program confirmation applicable to Egypt retained | Public terms do not establish eligibility | TARGET: written owner verification before any Noon Egypt monetization claim | Owner program record | Monthly until resolved | Keep direct/non-monetized or activate verified link |
| Organic search entrances | Search-origin sessions landing on a guide or product page | Not configured | TARGET: establish a complete observed baseline before setting a growth target | Search Console + approved analytics | Weekly / monthly close | Prioritize intent and indexing fixes |
| Search query coverage | Distinct relevant queries with valid impressions/clicks, reported without invented volume | Not configured | TARGET: establish a complete observed baseline; owner sets next-period target after review | Search Console | Weekly / monthly close | Find missing or mismatched intent |
| Guide-to-product click rate | Unique internal product clicks from guides ÷ eligible guide sessions | Not configured | TARGET: owner-set only after the first complete baseline | Approved analytics events | Monthly | Improve section relevance and CTA context |
| Product-to-retailer click rate | Unique retailer outbound clicks ÷ eligible product-page sessions | Not configured | TARGET: owner-set only after the first complete baseline | Approved analytics events | Monthly | Diagnose fit, trust, or CTA friction |
| Retailer outbound clicks | Unique outbound actions to Amazon Egypt or Noon Egypt, split by provider and link state | Not configured | TARGET: establish an observed baseline; do not treat clicks as sales | Approved analytics events | Weekly / monthly close | Compare problem paths and provider use |
| Qualified correction rate | Reader corrections that produce a verified record change ÷ reviewed corrections | Not configured | TARGET: acknowledge and triage every correction; no volume target before baseline | Correction log | Weekly | Improve trust and source quality |
| Email consented subscribers | Confirmed opt-ins captured through an approved consent flow | Email disabled | TARGET: remain disabled until [OWNER INPUT REQUIRED — email platform] and consent path are approved | Email platform | Monthly after activation | Decide whether return loop is viable |
| Affiliate-reported orders | Orders attributed by an approved retailer program | No verified affiliate links | TARGET: report observed program values only; no order forecast | Approved affiliate dashboard | Monthly after activation | Validate tracking and content fit |
| Affiliate-reported commission | Commission reported by an approved program, split by retailer and reconciled period | No verified affiliate links | TARGET: report observed values only; no commission or revenue forecast | Approved affiliate dashboard | Monthly after activation | Reconcile program reporting |

## Funnel views

### Discovery

Track index coverage, relevant search impressions/clicks, organic entrances, and landing-page engagement. A low or incomplete baseline calls for technical and intent diagnosis; it does not prove the category lacks demand.

### Education

Track guide-to-product navigation, compatibility-section engagement when available, and FAQ/query alignment. Use these observations to improve the reader's decision path, not to inflate page length.

### Commercial navigation

Track product-to-retailer outbound actions by product, provider, link state, and disclosure version. Never present this as checkout conversion because the transaction occurs on the retailer site.

### Monetization

Use only retailer-program reporting from verified affiliate links. Direct Amazon or Noon clicks have no claimed commission attribution. Noon Egypt remains direct/non-monetized until written eligibility confirmation.

### Trust and operations

Track disclosure coverage, link freshness, disabled links, time-to-containment, corrections, evidence age, and 90-day content refresh completion.

## Decision rules

- If tracking is incomplete, fix measurement before setting a performance target.
- If a page receives relevant search exposure but weak internal navigation over a complete window, inspect intent match, compatibility clarity, and link context before changing the product.
- If a product page has visits but few retailer actions, inspect fit, price-snapshot wording, provider status, trust, and CTA visibility; do not infer that the product is unwanted from a small sample.
- If a retailer link fails or reaches a different model, disable it immediately regardless of traffic.
- If a verified affiliate dashboard and outbound analytics materially disagree, audit tag implementation and period definitions; do not estimate the missing value.
- After the first complete baseline, the owner may set next-period acquisition or conversion targets. Each new numeric goal must be stored with the `TARGET:` label, owner, date, baseline, rationale, and review window.

## Reporting template

For each monthly close, record:

- measurement window and tracking uptime;
- Observed value, prior comparable value, and absolute/relative change when valid;
- internal `TARGET` and whether it was met;
- explanation grounded in observable data, with alternative explanations where uncertain;
- one keep/improve/investigate decision, owner, due date, and evidence needed;
- affiliate state by retailer and any correction/disabled-link incidents.

Do not fill empty cells with estimates. “Not configured” and “Not enough data” are valid launch findings.

## Owner inputs

- [OWNER INPUT REQUIRED — domain]
- [OWNER INPUT REQUIRED — analytics platform]
- [OWNER INPUT REQUIRED — email platform]
- [OWNER INPUT REQUIRED — Amazon Associates ID/tag]
- [OWNER INPUT REQUIRED — Noon Egypt eligibility confirmation]
- [OWNER INPUT REQUIRED — legal and tax review]
- [OWNER INPUT REQUIRED — Search Console owner account]
- [OWNER INPUT REQUIRED — reporting owner and monthly close date]

