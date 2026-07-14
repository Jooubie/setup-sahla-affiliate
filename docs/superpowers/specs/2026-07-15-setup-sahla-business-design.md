# Setup Sahla — Affiliate Business and Launch Website Design

Date: 2026-07-15

Market: Egypt first, MENA expansion-ready

Business model: Editorial affiliate publisher for PC and laptop setup problem-solvers

## 1. Executive decision

Build **Setup Sahla**, a fast, editorial-first affiliate site that helps people fix concrete desk, laptop, and PC setup frustrations without replacing expensive core devices. The launch promise is **“Fix the friction. Keep the gear.”**

The site will recommend five researched product opportunities available from Amazon Egypt and/or Noon Egypt, publish three search-led launch articles, and make every recommendation traceable to a problem, evidence, provider, and disclosure. It will launch in English with Arabic-aware terminology, Egypt pricing in EGP, and an information structure ready for later Arabic localization and additional MENA storefronts.

This autonomous design treats the user’s instruction to “run autonomously” as approval to resolve non-critical choices without pauses. It does not invent affiliate account IDs, prices, stock status, performance claims, or keyword volumes.

## 2. Success criteria

The first release is successful when it includes:

- Five pain-solving product opportunities chosen using current search/trend evidence, retail availability, price/value, buyer intent, and content fit.
- Real Amazon Egypt and Noon Egypt product/provider URLs, capture dates, evidence links, image-source fields, price snapshots, and a clear affiliate-link activation status in a spreadsheet.
- A launch website with a home page, product hub, five product detail/recommendation views, three complete articles, methodology, about, privacy, affiliate disclosure, and contact guidance.
- Original brand assets and category/lifestyle creatives that do not depend on copying retailer photography.
- Product cards that remain honest when prices or stock change and do not claim retailer endorsement.
- A tested production build with working navigation, responsive layouts, accessible controls, useful metadata, structured data, sitemap, and robots policy.
- A repeatable operating system for updating products, publishing content, and converting direct retailer links into affiliate deep links after the owner’s program approvals.

## 3. Audience and job to be done

### Primary audience

Egypt-based students, remote workers, early-career professionals, creators, and PC/laptop users who already own a usable computer but experience one or more daily problems: too few ports, uncomfortable posture, heat/throttling, cable clutter, poor input ergonomics, or unreliable desk connectivity.

### Core job

“Help me identify the smallest credible purchase that removes the specific friction in my setup, show me why it fits, and let me compare trustworthy local buying options.”

### Exclusions at launch

- Full PC builds, CPUs, GPUs, monitors, laptops, luxury desk décor, and aesthetic-only upgrades.
- User accounts, carts, checkout, price scraping, automatic inventory monitoring, community features, and a custom CMS.
- Unsupported superlatives such as “best overall” when evidence only supports “best fit for this use case.”

## 4. Approaches considered

### A. SEO-first static editorial publisher — selected

Use a statically generated content site with structured product data, Markdown/MDX articles, strong internal linking, and minimal client-side JavaScript.

Benefits: excellent crawlability and speed, low operating cost, reliable deployment, simple content ownership, and a clean path to programmatic product updates. Trade-off: updates require a source change and rebuild until a CMS is justified.

### B. Visual product-gallery single-page app

Use a highly interactive React storefront with filters and animated product browsing.

Benefits: rich browsing and fast in-app interactions. Trade-offs: weaker default article SEO, more JavaScript, commerce-like expectations without checkout, and unnecessary complexity for five launch products.

### C. Headless CMS plus server-rendered application

Use a CMS, database, preview workflow, and server-rendered frontend.

Benefits: non-technical editorial workflow and long-term scale. Trade-offs: authentication, hosting, schema, integration, and maintenance overhead before the business has validated traffic or conversions.

### Decision

Approach A is the best launch vehicle. The design keeps content/data boundaries clean so a CMS can be added later without redesigning the public site.

## 5. Brand system

### Name and positioning

**Setup Sahla** combines the universal category term “setup” with the Arabic word “sahla” (easy). It signals a MENA-native, approachable guide without limiting the site to gaming or expensive builds.

Positioning statement: “Setup Sahla helps MENA laptop and PC users solve everyday setup friction with evidence-led, locally available upgrades.”

Tagline: **Fix the friction. Keep the gear.**

### Voice

- Calm expert, not a hype merchant.
- Specific about the problem, trade-offs, and who should skip a product.
- Short sentences, useful labels, transparent evidence, and locally meaningful prices.
- Uses “we recommend” only after explaining the decision; never presents an ad as an independent test.
- Arabic-aware without decorative Arabization: common local terms can appear in keyword notes and future Arabic pages, while launch copy stays natural English.

### Visual direction

- Warm near-black and sand foundation with a high-energy lime signal color and cool cyan data accent.
- Rounded but sturdy shapes: practical equipment labels, modular cards, visible rails, and cable-path motifs.
- Bold condensed display type paired with a highly readable sans serif body.
- Logo concept: a continuous cable line forms an “S,” terminates in a small plug, and sits beside the Setup Sahla wordmark.
- Original visuals show realistic desk problems being resolved. Product-specific photography is used only when permitted by the relevant affiliate program or manufacturer license.

## 6. Product research and selection system

### Candidate universe

Start with problem-led categories rather than products: ports/connectivity, posture, thermal management, cable control, and input comfort. Research adjacent candidates, then choose one opportunity per problem unless evidence strongly favors a different mix.

### Evidence sources

- Google Trends or comparable search-interest evidence for Egypt and relevant MENA terms.
- Search-result demand signals and keyword variations in English and Arabic/transliteration.
- Current Amazon Egypt and Noon Egypt listing/provider availability.
- Manufacturer documentation for specifications and compatibility.
- Independent primary/technical references when a product claim needs validation.
- Search-result competition, content quality gaps, price/value, review-count/rating signals when visible, and provider redundancy.

Every unstable observation records a capture date. Keyword volumes are labeled by source and never fabricated. If a commercial tool is unavailable, the report uses indexed demand proxies and clearly says so.

### Selection score

Each candidate receives a 100-point score:

- 25: problem urgency and frequency
- 20: search/buyer intent and trend direction
- 15: Egypt retail availability across providers
- 15: value and accessible price band
- 10: compatibility breadth and low return-risk
- 10: editorial differentiation and content-cluster fit
- 5: visual demonstrability

Candidates with serious safety concerns, unclear specifications, single-listing dependence, counterfeit risk, or purely decorative value are rejected regardless of score.

### Provider decision

For each chosen opportunity, compare Amazon Egypt and Noon Egypt on exact model match, seller/fulfillment clarity, warranty/returns, price snapshot, rating/review visibility, stock status, and link stability. The site may present both providers. It does not call one “best provider” unless the evidence supports that claim on the capture date.

## 7. Product and affiliate data model

The canonical product dataset stores:

- Stable slug, product/category name, precise problem solved, verdict, ideal user, and “skip if” guidance.
- Brand/model/SKU, compatibility requirements, key specifications, evidence URLs, and evidence capture dates.
- Retailer, exact listing title, seller/fulfillment notes, direct product URL, affiliate-ready URL field, image/source URL, snapshot price, currency, visible rating/review count, stock observation, and last checked date.
- Primary keyword, supporting keywords, Arabic/transliterated variants, intent, demand evidence, trend direction, competition notes, and article assignment.
- Selection score with component scores, provider rationale, risk notes, disclosure status, and owner action.

The source repository exports the same records into a polished spreadsheet. Site pages read local structured data and do not scrape retailers at runtime.

## 8. Affiliate-link and image compliance

The owner’s Amazon Associates and Noon affiliate identifiers are not assumed. Launch records use real direct retailer links with a visible status of `DIRECT_LINK — AFFILIATE ID REQUIRED`. A central configuration layer will make approved deep links easy to substitute without editing article copy.

All commercial pages include a clear affiliate disclosure near the first monetized link. Price is a dated snapshot, not a live promise. Calls to action use honest wording such as “Check current price on Amazon Egypt.” External commercial links use sponsored/no-follow treatment where appropriate.

Amazon or Noon listing images are not scraped and redistributed. The sheet records retailer/manufacturer image-source links and rights status. The public site uses original generated category visuals by default; retailer program content can replace them only after account/API or explicit program permission is available.

## 9. Information architecture

### Public routes

- `/` — brand promise, friction finder, five recommendation previews, methodology, article previews, disclosure.
- `/products/` — filterable problem-solution hub.
- `/products/<slug>/` — evidence-led recommendation with fit, trade-offs, compatibility, provider links, methodology, and related reading.
- `/guides/` — launch content hub.
- `/guides/<slug>/` — three complete SEO articles with table of contents, evidence, product modules, FAQs, disclosure, and related links.
- `/methodology/` — scoring, provider checks, updates, corrections.
- `/about/`, `/affiliate-disclosure/`, `/privacy/` — trust and compliance pages.
- `404`, sitemap, robots, RSS/feed if supported without extra infrastructure.

### Launch article cluster

The exact titles follow validated keyword evidence. The intended cluster is:

1. A broad diagnostic guide to fixing a laptop desk setup without buying a new laptop.
2. A connectivity/ports guide centered on choosing the right hub or dock and avoiding compatibility mistakes.
3. A thermal/posture/cable workflow guide that groups smaller problem-solvers and links to their product pages.

## 10. Experience design

The home page opens with a split hero: a sharp problem statement and a modular “friction scanner” showing common setup symptoms. The primary action moves to the product hub; the secondary action explains the methodology.

Product discovery is organized by pain, not brand. Cards label “solves,” “best for,” price snapshot, checked date, and provider availability. Product pages lead with a plain verdict, followed by compatibility gates and reasons to skip. Motion is restrained, respects reduced-motion settings, and reinforces cable/connection flows rather than adding decorative noise.

On mobile, the experience remains editorial: no sticky overlays that obscure content, no fake scarcity, and no oversized conversion traps. Calls to action remain visible at natural decision points.

## 11. Technical architecture

- Static-first modern web framework selected after the Sites/build skill checks the supported deployment path; preference is Astro or an equivalent pre-rendered architecture.
- Type-safe structured product data, reusable product/provider components, and Markdown/MDX content.
- CSS design tokens for brand colors, type, spacing, radii, borders, motion, and elevation.
- Local optimized original visual assets; no runtime image-generation dependency.
- Metadata, canonical URLs, Open Graph, Article and Product/ItemList/Breadcrumb structured data only where truthful.
- No backend, cookies, analytics, or forms at launch unless a configured service and consent path exist.

Data flow: research ledger → approved canonical product records → spreadsheet export and site components → product pages and article modules. This keeps claims and links synchronized.

## 12. Error and stale-data behavior

- Missing affiliate ID: render direct retailer link and mark the operating ledger; never append a fake tag.
- Missing/uncertain price: show “Check current price,” not zero or a guessed price.
- Out-of-stock observation: retain the research record, hide urgency language, and present an alternate provider if verified.
- Missing image permission: use the original branded category visual.
- External-link failure during validation: flag the record and remove it from prominent calls to action until reviewed.
- Unsupported compatibility: state the gate above the buy links and recommend no purchase.

## 13. Quality and testing

- Unit/data validation for required product fields, unique slugs, evidence dates, valid URLs, score totals, and affiliate-status labels.
- Build/type/lint tests.
- Automated route and internal-link checks.
- Browser checks at phone, tablet, and desktop widths.
- Accessibility checks for landmarks, headings, keyboard navigation, focus visibility, contrast, reduced motion, alternative text, and CTA meaning.
- SEO checks for unique titles/descriptions, canonical paths, indexability, sitemap, schema validity, and non-duplicated article intent.
- Content checks for disclosure placement, unsupported claims, unqualified superlatives, stale-price language, and consistent product/provider facts.

## 14. Deliverables

1. Business OS and operating playbook.
2. Evidence-backed product, provider, trend, and keyword research report.
3. Five-product opportunity spreadsheet with live source links and image-rights/status fields.
4. Brand identity guide, logo files, palette/type system, voice guide, and original campaign/site creatives.
5. Three publication-ready SEO articles.
6. Complete source-controlled website, validated production build, and deployment package or production URL when the available hosting workflow permits it.
7. Launch checklist that separates completed work from account-dependent actions, especially affiliate program approval and insertion of owner tracking IDs.

## 15. Autonomous assumptions and boundaries

- Egypt is the launch market; architecture and language choices keep MENA expansion practical.
- English is the launch content language; Arabic search variants are researched and the visual brand supports future Arabic pages.
- The site publishes recommendations, not hands-on lab-test claims, unless a source supports the specific statement.
- The business can be operationally launch-ready, but monetized affiliate tracking cannot be activated without the owner’s approved program credentials.
- The owner will review retailer-program terms before enabling retailer imagery or API-derived content.
- No paid ads, email sending, affiliate-account creation, purchases, or legal filings are authorized in this build.
