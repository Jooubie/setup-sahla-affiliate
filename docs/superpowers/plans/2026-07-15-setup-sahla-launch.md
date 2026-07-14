# Setup Sahla Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Launch an evidence-led Egypt-first PC/laptop setup affiliate business with five researched product opportunities, an auditable workbook and report, a complete brand system, three SEO articles, and a production-ready crawlable website.

**Architecture:** A research ledger is the single source of truth for product, provider, keyword, claim, and freshness data. Typed site data, the workbook, the report, and editorial product modules are derived from that ledger. The public website uses the installed Sites React/Vite/vinext starter so product and guide routes are crawlable, fast, deployable through the supported Cloudflare-compatible workflow, and safe when retailer prices or inventory change.

**Tech Stack:** The installed OpenAI Sites React/Vite/vinext starter with TypeScript, Zod data validation, typed editorial content, Vitest, modern CSS, build-time route/link/accessibility checks, the bundled `@oai/artifact-tool` runtime for `.xlsx`, bundled ReportLab/Poppler for PDF production, original generated raster creatives plus hand-authored SVG brand assets, and Cloudflare Worker-compatible Sites output.

## Global Constraints

- Market is Egypt first and MENA expansion-ready; public prices use EGP.
- Brand name is `Setup Sahla`; tagline is `Fix the friction. Keep the gear.`
- Recommendations solve concrete setup friction and exclude full computers, core components, and aesthetic-only upgrades.
- Exactly five launch product opportunities and exactly three launch guides are published.
- Every unstable retail or trend observation has a capture date and source URL.
- Keyword volumes are included only when a named source provides them; otherwise use labeled demand proxies.
- Direct retailer URLs are real; affiliate IDs are never invented. Unconverted links carry `DIRECT_LINK — AFFILIATE ID REQUIRED` in operating data.
- Retailer listing images are not scraped or redistributed; the public site uses original visuals unless a permitted program/manufacturer asset is documented.
- Price is presented as a dated snapshot or `Check current price`, never as a live promise.
- Commercial links use clear retailer names and sponsored/no-follow treatment; disclosure appears before or beside the first monetized recommendation.
- No paid ads, email sending, account creation, purchases, legal filings, cookies, or analytics are added.
- The final site must pass build, data validation, content-policy, link, responsive-browser, and accessibility checks before completion is claimed.

## File map

- `docs/business-os/OPERATING_SYSTEM.md` — roles, gates, cadence, and update procedures.
- `docs/business-os/EVIDENCE_AND_COMPLIANCE.md` — evidence hierarchy, affiliate disclosures, image rights, freshness rules.
- `docs/business-os/AGENT_BRIEFS.md` — bounded research, identity, creative, content, website, and reviewer briefs.
- `research/evidence.csv` — one row per source observation.
- `research/keywords.csv` — keyword, locale, intent, evidence metric/proxy, source, and mapped page.
- `data/products.json` — canonical five-product dataset consumed by every deliverable.
- `data/product.schema.json` — machine-readable contract for canonical records.
- `docs/research/PRODUCT_RESEARCH_REPORT.md` — evidence-backed selection and provider report.
- `brand/BRAND_SYSTEM.md` — identity, voice, visual tokens, and usage rules.
- `public/brand/` — logo SVGs, favicon, and original raster creatives.
- `content/guides/` — three source articles before Sites integration.
- `scripts/validate_research.mjs` — rejects incomplete or dishonest product/research records.
- `scripts/build_workbook.mjs` — generates the styled `.xlsx` from canonical data with the bundled `@oai/artifact-tool` runtime.
- `scripts/build_report.py` — generates the polished user-facing research report.
- `site/` — complete Sites React/Vite/vinext website.
- `outputs/Setup-Sahla-Product-Research.xlsx` — final product/provider/keyword workbook.
- `outputs/Setup-Sahla-Research-Report.pdf` — final research and launch rationale report.
- `outputs/Setup-Sahla-Brand-Guide.pdf` — final brand/voice guide.
- `outputs/setup-sahla-site/` — production build package when deployment tooling requires an archive.

---

### Task 1: Business OS and durable orchestration ledger

**Files:**

- Create: `docs/business-os/OPERATING_SYSTEM.md`
- Create: `docs/business-os/EVIDENCE_AND_COMPLIANCE.md`
- Create: `docs/business-os/AGENT_BRIEFS.md`
- Create: `.superpowers/sdd/progress.md`
- Create: `research/evidence.csv`

**Interfaces:**

- Consumes: the approved design spec and Global Constraints above.
- Produces: the workflow gates and CSV columns used by every later task.

- [ ] **Step 1: Define the evidence ledger header**

Create `research/evidence.csv` with this exact first row:

```csv
evidence_id,evidence_type,market,query_or_item,metric_name,metric_value,metric_unit,observation,source_name,source_url,captured_at_utc,rights_status,used_by,notes
```

- [ ] **Step 2: Write the operating system**

Document these exact stage gates in `OPERATING_SYSTEM.md`: `G0 Brief`, `G1 Evidence`, `G2 Selection`, `G3 Claims`, `G4 Creative`, `G5 Publish`, and `G6 Refresh`. For every gate state the owner, required inputs, pass condition, artifact, and rollback action. Set retail checks to launch-day plus every 14 days, content refresh review to every 90 days, and immediate review when a link fails.

- [ ] **Step 3: Write evidence and compliance rules**

Define a hierarchy of manufacturer/retailer primary sources, official trend/search data, and independent technical references. Include the exact affiliate status enum:

```text
DIRECT_LINK — AFFILIATE ID REQUIRED
AFFILIATE_LINK — VERIFIED
LINK DISABLED — REVIEW REQUIRED
```

Define image-rights values `ORIGINAL`, `MANUFACTURER_PERMISSION_REVIEWED`, `AFFILIATE_API`, and `SOURCE_LINK_ONLY`. Require disclosure before the first commercial CTA and prohibit copied reviews, invented testing, fake scarcity, unsupported superlatives, and undated prices.

- [ ] **Step 4: Write focused agent briefs**

Create separate briefs for Product/Provider Research, SEO/Trend Research, Research Integration, Identity/Creatives, Editorial, Website, and Final Review. Every brief must state scope, allowed files, required evidence, prohibited actions, expected report path, and completion criteria. Product and SEO researchers may edit only `research/`; Research Integration may edit `data/`, `scripts/validate_research.mjs`, `tests/research-data.test.mjs`, and `docs/research/`; Identity/Creatives may edit `brand/`, `public/brand/`, and `tests/brand-assets.test.mjs`; Website may edit only `site/` after canonical data exists.

- [ ] **Step 5: Initialize durable progress**

Create `.superpowers/sdd/progress.md` with:

```markdown
# Setup Sahla execution ledger

Plan: docs/superpowers/plans/2026-07-15-setup-sahla-launch.md
Task 1: in progress
Open account dependency: Amazon Associates and Noon affiliate IDs are not present; keep direct links until owner activation.
```

- [ ] **Step 6: Verify and commit**

Run:

```powershell
rg -n "G0 Brief|G1 Evidence|G2 Selection|G3 Claims|G4 Creative|G5 Publish|G6 Refresh" docs/business-os/OPERATING_SYSTEM.md
rg -n "DIRECT_LINK — AFFILIATE ID REQUIRED|AFFILIATE_LINK — VERIFIED|LINK DISABLED — REVIEW REQUIRED" docs/business-os/EVIDENCE_AND_COMPLIANCE.md
```

Expected: every gate and status appears. Then commit with `docs: add Setup Sahla business operating system`.

### Task 2: Real product, provider, trend, and keyword research

**Files:**

- Create: `research/product-candidates.csv`
- Modify: `research/evidence.csv`
- Create: `research/keywords.csv`
- Create: `data/product.schema.json`
- Create: `data/products.json`
- Create: `scripts/validate_research.mjs`
- Create: `tests/research-data.test.mjs`
- Create: `docs/research/PRODUCT_RESEARCH_REPORT.md`

**Interfaces:**

- Consumes: Task 1 evidence/compliance rules and ledger header.
- Produces: exactly five canonical `Product` records and page-level keyword assignments for Tasks 4–7.

- [ ] **Step 1: Write the failing canonical-data test**

Create `tests/research-data.test.mjs` that loads `data/products.json` and asserts:

```js
import assert from 'node:assert/strict';
import products from '../data/products.json' with { type: 'json' };

assert.equal(products.length, 5, 'launch dataset must contain exactly five products');
assert.equal(new Set(products.map((p) => p.slug)).size, 5, 'slugs must be unique');
for (const product of products) {
  assert.equal(product.score.total, Object.values(product.score.components).reduce((a, b) => a + b, 0));
  assert.ok(product.providers.some((p) => /amazon\.eg|noon\.com/.test(new URL(p.directUrl).hostname)));
  assert.ok(product.evidence.length >= 3, `${product.slug} needs at least three evidence records`);
  assert.ok(product.primaryKeyword.sourceUrl && product.primaryKeyword.capturedAt);
  assert.ok(product.providers.every((p) => p.affiliateStatus === 'DIRECT_LINK — AFFILIATE ID REQUIRED'));
}
```

- [ ] **Step 2: Run the test to prove the dataset is absent**

Run: `node tests/research-data.test.mjs`

Expected: failure because `data/products.json` does not exist.

- [ ] **Step 3: Research candidates and evidence**

Research at least twelve candidates across ports/connectivity, posture, thermal management, cable control, and input comfort. For each candidate capture current Egypt/MENA search demand evidence, retailer availability, exact model/provider links, manufacturer compatibility/specifications, snapshot price, visible seller/fulfillment notes, and content-competition observations. Add one evidence-led row per observation; do not synthesize multiple URLs into one row.

- [ ] **Step 4: Build the keyword map**

Create `research/keywords.csv` with this exact header:

```csv
keyword,locale,language,intent,problem_cluster,metric_name,metric_value,metric_unit,trend_direction,source_name,source_url,captured_at_utc,assigned_route,notes
```

Map one primary keyword and at least four supporting variants to each product page and each of the three guide routes. Include relevant Arabic and transliterated variants as research rows, even though launch articles are English.

- [ ] **Step 5: Score and select five opportunities**

Apply the 25/20/15/15/10/10/5 score from the design spec. Select exactly five products; every selection needs a clear problem, a buyer-intent path, a local provider, broad-enough compatibility, a rejection note for the closest alternative, and a risk note. Reject any candidate with unresolved counterfeit, electrical safety, or model-identity risk.

- [ ] **Step 6: Implement canonical schema and records**

Use these required top-level properties in `product.schema.json` and every product record:

```json
{
  "slug": "string",
  "name": "string",
  "category": "string",
  "problem": "string",
  "verdict": "string",
  "bestFor": ["string"],
  "skipIf": ["string"],
  "brand": "string",
  "model": "string",
  "compatibility": ["string"],
  "snapshotPriceEgp": 0,
  "priceCapturedAt": "YYYY-MM-DD",
  "primaryKeyword": { "keyword": "string", "intent": "string", "sourceUrl": "https://…", "capturedAt": "ISO-8601" },
  "supportingKeywords": ["string"],
  "score": { "components": { "problemUrgency": 0, "searchIntent": 0, "availability": 0, "value": 0, "compatibility": 0, "editorialFit": 0, "visual": 0 }, "total": 0 },
  "providers": [{ "retailer": "Amazon Egypt or Noon Egypt", "directUrl": "https://…", "affiliateUrl": null, "affiliateStatus": "DIRECT_LINK — AFFILIATE ID REQUIRED", "listingTitle": "string", "sellerNotes": "string", "priceEgp": 0, "capturedAt": "YYYY-MM-DD", "imageSourceUrl": "https://…", "imageRights": "SOURCE_LINK_ONLY" }],
  "evidence": [{ "evidenceId": "string", "claim": "string", "sourceUrl": "https://…", "capturedAt": "ISO-8601" }],
  "risks": ["string"],
  "closestRejectedAlternative": "string"
}
```

- [ ] **Step 7: Implement and run validation**

Create `scripts/validate_research.mjs` to validate the JSON Schema, reject empty strings, require `score.total <= 100`, require ISO dates, verify all `evidenceId` values exist in `research/evidence.csv`, and reject affiliate URLs while status is direct-link. Run both `node scripts/validate_research.mjs` and `node tests/research-data.test.mjs`.

Expected: both exit `0` and report five valid records.

- [ ] **Step 8: Write the evidence-backed report and commit**

For each selection document problem, demand evidence, provider comparison, price snapshot, compatibility, why it won, why the closest alternative lost, risks, related content, and every source link. Add a methodology, limitations, keyword cluster, 30-day launch, and 90-day refresh section. Commit with `research: select five Setup Sahla launch products`.

### Task 3: Brand identity and original creative system

**Files:**

- Create: `brand/BRAND_SYSTEM.md`
- Create: `brand/VOICE_AND_COPY.md`
- Create: `public/brand/setup-sahla-logo.svg`
- Create: `public/brand/setup-sahla-mark.svg`
- Create: `public/brand/favicon.svg`
- Create: `public/brand/og-default.png`
- Create: `public/brand/hero-desk.webp`
- Create: `public/brand/problem-connectivity.webp`
- Create: `public/brand/problem-posture.webp`
- Create: `public/brand/problem-thermal.webp`
- Create: `public/brand/problem-cables.webp`
- Create: `public/brand/problem-input.webp`
- Create: `tests/brand-assets.test.mjs`

**Interfaces:**

- Consumes: the brand direction and compliance rules from Tasks 1–2.
- Produces: exact visual tokens, logo assets, voice rules, and safe image assets used by Tasks 4 and 7.

- [ ] **Step 1: Write the brand-asset test**

Create a test that asserts every named file exists, SVGs contain an accessible `<title>`, raster assets are non-empty, and `BRAND_SYSTEM.md` defines `--ink`, `--sand`, `--lime`, `--cyan`, `--paper`, display/body font stacks, spacing scale, radius scale, and reduced-motion policy.

- [ ] **Step 2: Define the identity system**

Use these core colors exactly unless contrast validation requires a darker accessible variant:

```css
--ink: #101411;
--sand: #e9dfca;
--lime: #c9ff4a;
--cyan: #66d9e8;
--paper: #fffdf7;
--muted: #626a61;
```

Document logo clear space, minimum sizes, light/dark usage, forbidden treatments, type hierarchy, modular card geometry, cable-line motif, icon style, photography/illustration direction, and accessibility rules.

- [ ] **Step 3: Define voice and copy patterns**

Write approved formulas for verdicts, `Best for`, `Skip if`, compatibility warnings, dated prices, provider CTAs, disclosures, article intros, social captions, and corrections. Include at least five bad/good rewrites that remove hype and unsupported claims.

- [ ] **Step 4: Create vector identity assets**

Build a cable-line `S` mark ending in a plug, a horizontal wordmark, and an SVG favicon. Keep paths simple, use the exact brand colors, include `<title>` elements, and ensure the mark reads at 32px.

- [ ] **Step 5: Generate original creatives**

Create one editorial hero and five problem-category images. Style: warm editorial product photography, Egyptian/MENA apartment workspace cues, realistic midrange laptop setup, practical fixes, no visible retailer logos, no text baked into images, no impossible ports/cables, and consistent warm sand/lime/cyan art direction. Export site-optimized WebP plus a 1200×630 default Open Graph image.

- [ ] **Step 6: Verify and commit**

Run `node tests/brand-assets.test.mjs` and an image-dimension/size audit. Expected: all files exist, are readable, and no site image exceeds 500 KB without a documented quality reason. Commit with `brand: create Setup Sahla identity and original assets`.

### Task 4: Workbook and polished research report

**Files:**

- Create: `scripts/build_workbook.mjs`
- Create: `scripts/build_report.py`
- Create: `outputs/Setup-Sahla-Product-Research.xlsx`
- Create: `outputs/Setup-Sahla-Research-Report.pdf`
- Create: `outputs/Setup-Sahla-Brand-Guide.pdf`
- Create: `tests/deliverables.test.mjs`

**Interfaces:**

- Consumes: `data/products.json`, research CSVs, research report Markdown, brand Markdown, and brand assets.
- Produces: three user-facing business artifacts whose values match canonical data.

- [ ] **Step 1: Write the deliverable test**

Assert the workbook and both PDFs exist and are non-empty. Open the workbook through the bundled spreadsheet library and assert sheets named `Launch Dashboard`, `Products`, `Providers`, `Keywords`, `Evidence`, `Content Map`, and `Owner Actions`. Assert exactly five product rows and hyperlinks for every provider/source URL.

- [ ] **Step 2: Generate the workbook**

Use only the loader-provided `@oai/artifact-tool` runtime. Use frozen headers, filters, readable column widths, alternating rows, wrapped notes, hyperlink styling, conditional formatting for selection score and stale dates, a legend for affiliate/image status, and formulas for provider count, days since check, and owner-action count. Add a visible note that prices are dated snapshots and links remain direct until affiliate IDs are inserted.

- [ ] **Step 3: Generate the research PDF**

Convert the Markdown report into a branded PDF with cover, executive summary, methodology, score table, one section per selected product, provider/keyword analysis, limitations, launch roadmap, citations, and owner activation checklist. Ensure no table or URL is clipped.

- [ ] **Step 4: Generate the brand PDF**

Create a concise brand guide covering logo, palette, typography, voice, CTA/disclosure patterns, image direction, and usage examples. Include logo and at least three creative samples.

- [ ] **Step 5: Render and inspect**

Render every PDF page to images and inspect for overlap, clipping, missing glyphs, broken links, and empty pages. Open the workbook and verify formulas, filters, hyperlinks, sheet order, and visible notes. Fix any defect before continuing.

- [ ] **Step 6: Run tests and commit**

Run `node tests/deliverables.test.mjs`. Expected: `3 deliverables valid; 5 products; 7 workbook sheets`. Commit with `docs: publish Setup Sahla research and brand deliverables`.

### Task 5: Sites foundation, canonical data adapter, and test harness

**Files:**

- Create through the installed Sites initializer, then preserve: `site/package.json`
- Create through the installed Sites initializer, then preserve: `site/vite.config.ts`
- Create through the installed Sites initializer, then preserve: `site/tsconfig.json`
- Create through the installed Sites initializer, then preserve: `site/.openai/hosting.json`
- Modify after initialization: `site/app/globals.css`
- Create: `site/app/lib/products.ts`
- Create: `site/app/lib/site.ts`
- Modify after initialization: `site/app/layout.tsx`
- Modify after initialization: `site/app/page.tsx`
- Create: `site/app/components/AffiliateDisclosure.tsx`
- Create: `site/app/components/ProviderLink.tsx`
- Create: `site/app/components/ProductCard.tsx`
- Create: `site/app/data/guides.ts`
- Create: `site/tests/product-adapter.test.ts`
- Create: `site/tests/provider-link.test.ts`

**Interfaces:**

- Consumes: canonical product JSON, brand tokens/assets, and affiliate status enum.
- Produces: `getProducts(): Product[]`, `getProduct(slug: string): Product`, shared app layout, and safe provider/product components.

- [ ] **Step 1: Initialize the supported Sites project exactly once**

Make site setup the first task action. Run the installed Sites root `scripts/init-site.sh` with the new `site/` directory as its target, retain the installation session until it completes, and never run a second initializer. In this delegated/background implementation, do not open a browser-only preview. Preserve the generated package manager, lockfile, vinext structure, `sites()` Vite plugin, and `.openai/hosting.json`. Add only `test`, `check`, and `validate:links` scripts that the generated build does not already provide.

- [ ] **Step 2: Write failing data-adapter tests**

Test that `getProducts()` returns five score-sorted products, `getProduct()` throws a useful error for unknown slugs, direct links remain unmodified without an affiliate configuration, and provider links expose the retailer name plus checked-date copy.

- [ ] **Step 3: Implement typed product adapter**

Define the `Product`, `Provider`, `Score`, and `Evidence` types using the canonical property names from Task 2. Copy `data/products.json` into the site build through an explicit sync command or import path and fail the build if validation fails.

- [ ] **Step 4: Implement layout and commercial components**

`app/layout.tsx` must set unique title/description/canonical/Open Graph data, skip link, header, footer, disclosure link, and reduced-motion-safe global styles. `ProviderLink` must use `target="_blank" rel="sponsored nofollow noopener"`, retailer-specific accessible text, and `Check current price` language. `AffiliateDisclosure` must use plain language and not imply existing commissions when links are still direct. Replace the starter loading skeleton completely, remove `app/_sites-preview` and its imports, remove unused `react-loading-skeleton`, and replace all starter metadata before the final build.

- [ ] **Step 5: Apply the visual system**

Translate Task 3 tokens into `global.css`; include fluid typography, 44px minimum tap targets, visible focus, container/grid utilities, modular cards, cable-line accent, light/dark contrast-safe sections, and `prefers-reduced-motion` rules.

- [ ] **Step 6: Verify and commit**

Run `npm test`, `npm run check`, and `npm run build` from `site/`. Expected: all tests pass, zero TypeScript/build errors, the Sites `sites()` plugin remains configured, and a Cloudflare Worker-compatible `dist/` is generated. Commit with `feat: establish Setup Sahla site foundation`.

### Task 6: Three SEO launch guides and content-policy tests

**Files:**

- Create: `content/guides/fix-laptop-desk-setup-egypt.mdx`
- Create: `content/guides/choose-usb-c-hub-egypt.mdx`
- Create: `content/guides/laptop-heat-posture-cable-fixes.mdx`
- Create: `site/app/data/guides.ts` typed integration of those files
- Create: `site/tests/content-policy.test.ts`

**Interfaces:**

- Consumes: exact route assignments in `research/keywords.csv`, five canonical products, evidence records, voice rules, and shared commercial components.
- Produces: exactly three indexable guide entries and internal links to all five product pages.

- [ ] **Step 1: Lock titles and routes from evidence**

Validate the non-overlap and demand fit of these launch titles against the keyword map: `How to Fix Your Laptop Desk Setup Without Buying a New Laptop`, `How to Choose a USB-C Hub in Egypt: Ports, Power and Compatibility`, and `Laptop Running Hot? A Practical Cooling, Posture and Cable Fix Guide`. Record exact title, slug, primary query, audience, search intent, featured products, and internal links at the top of each source file. Do not use a volume number unless its source is recorded.

- [ ] **Step 2: Write the content-policy test**

Assert there are exactly three guides, every guide has title/description/published/updated/primaryKeyword/disclosure fields, each has at least two source URLs, no banned terms (`guaranteed`, `cheapest ever`, `must buy`, `perfect for everyone`), each links to at least one product, and all five products receive at least one contextual guide link.

- [ ] **Step 3: Write each complete guide**

Each article must include a direct-answer opening, diagnostic checklist, compatibility/safety section, evidence-led recommendations, who should skip each purchase, dated retailer CTA module, FAQ, sources, disclosure, and related links. Target usefulness and completeness rather than a fixed word count; remove filler and repeated definitions.

- [ ] **Step 4: Add structured editorial metadata**

Use valid dates, unique title/description, one primary intent, supporting terms used naturally, descriptive headings, image alt text that explains function, and FAQ entries only when answered in visible page content.

- [ ] **Step 5: Verify and commit**

Run the content-policy test, build the site, and inspect generated article HTML for title, canonical, Article schema, disclosure, sources, and internal links. Commit with `content: publish three Setup Sahla launch guides`.

### Task 7: Public pages, product experience, and responsive interactions

**Files:**

- Modify: `site/app/page.tsx`
- Create: `site/app/products/page.tsx`
- Create: `site/app/products/[slug]/page.tsx`
- Create: `site/app/guides/page.tsx`
- Create: `site/app/guides/[slug]/page.tsx`
- Create: `site/app/methodology/page.tsx`
- Create: `site/app/about/page.tsx`
- Create: `site/app/affiliate-disclosure/page.tsx`
- Create: `site/app/privacy/page.tsx`
- Create: `site/app/not-found.tsx`
- Create: `site/app/components/FrictionFinder.tsx`
- Create: `site/app/components/ScoreBreakdown.tsx`
- Create: `site/app/components/ProviderPanel.tsx`
- Create: `site/app/components/GuideCard.tsx`
- Create: `site/tests/routes.test.ts`

**Interfaces:**

- Consumes: all site foundation interfaces, five product records, three guide entries, and brand assets.
- Produces: every public route in the design spec, ItemList/Product/Article/Breadcrumb structured data where truthful, and complete internal navigation.

- [ ] **Step 1: Write failing route tests**

Assert home, products, five product routes, guides, three guide routes, methodology, about, disclosure, privacy, and 404 templates generate successfully. Assert exactly five product cards on the home page, no `#` CTA hrefs, and all provider links use the safe component.

- [ ] **Step 2: Build the home and product hub**

Implement the split hero, friction finder, five recommendation previews, methodology strip, article previews, and disclosure. Organize products by problem; keep filtering functional without JavaScript by using anchor sections, enhanced progressively if needed.

- [ ] **Step 3: Build product pages**

For each product render verdict, problem, best-for, skip-if, compatibility gate, score explanation, dated price language, provider comparison, risk notes, evidence links, methodology link, related guides, and disclosure before the first commercial link.

- [ ] **Step 4: Build content and trust pages**

Create the guide hub and guide renderer. Write complete methodology, about, affiliate disclosure, and privacy copy aligned with the Business OS; clearly state that the site does not sell products or control retailer prices/returns.

- [ ] **Step 5: Add truthful metadata and schema**

Generate canonical URLs, Open Graph/Twitter fields, BreadcrumbList, ItemList, and Article schema. Use Product/Offer schema only when required properties are truthful and dated; otherwise omit it rather than supplying inferred values.

- [ ] **Step 6: Verify responsive behavior and commit**

Run route tests, the full Sites build, generated-route checks, keyboard/focus semantics tests, minimum tap-target rules, overflow-risk checks, and reduced-motion CSS checks. Because this is a delegated/background Sites build and the user did not request browser QA, do not open or automate a browser during implementation. Commit with `feat: build Setup Sahla affiliate experience`.

### Task 8: Independent review, fixes, production deployment, and handoff

**Files:**

- Create: `site/scripts/check-links.mjs`
- Create: `docs/launch/LAUNCH_CHECKLIST.md`
- Create: `docs/launch/90_DAY_CONTENT_PLAN.md`
- Create: `docs/launch/AFFILIATE_ACTIVATION.md`
- Create: `outputs/setup-sahla-site/` or deployment metadata generated by the hosting workflow
- Modify: `.superpowers/sdd/progress.md`

**Interfaces:**

- Consumes: all prior deliverables and fresh reviewer findings.
- Produces: verified build/deployment, launch playbook, honest dependency list, and completed progress ledger.

- [ ] **Step 1: Run independent specification and quality review**

Give the reviewer the design spec, this task brief, implementer reports, commit-range review package, Global Constraints, and outstanding minor-findings ledger. Require separate verdicts for spec compliance and quality. Fix all Critical and Important findings and re-review.

- [ ] **Step 2: Run the full verification matrix**

Run from a clean checkout/source state:

```powershell
node scripts/validate_research.mjs
node tests/research-data.test.mjs
node tests/brand-assets.test.mjs
node tests/deliverables.test.mjs
Set-Location site
npm test
npm run check
npm run build
npm run validate:links
```

Expected: every command exits `0`; five products, three guides, all required routes, and no broken internal links.

- [ ] **Step 3: Perform browser and artifact inspection**

Inspect disclosure placement, outbound retailer URLs, missing images, generated route metadata, 404 behavior, sitemap, robots, structured data, and build output through automated checks. Re-open the workbook and render all PDF pages after their final regeneration. Do not add browser automation unless the user separately requests browser QA.

- [ ] **Step 4: Write launch operations**

`LAUNCH_CHECKLIST.md` must separate completed, owner-required, and recurring actions. `AFFILIATE_ACTIVATION.md` must show exactly where to insert approved Amazon/Noon IDs, how to test one link, how to change status to `AFFILIATE_LINK — VERIFIED`, and how to roll back. The 90-day plan must include the next nine evidence-led content briefs, update cadence, and KPIs for impressions, clicks, outbound CTR, affiliate conversion, EPC, stale links, and content refreshes without inventing benchmarks.

- [ ] **Step 5: Deploy through the available Sites workflow**

Read the hosting configuration first, reuse an existing project ID if present, push the exact verified source state, save a version from that commit, deploy only the saved version, and inspect terminal deployment status. Do not invent project IDs or claim production availability without a live URL and terminal success state.

- [ ] **Step 6: Finalize the durable ledger and commit**

Record every task’s commit range and clean review in `.superpowers/sdd/progress.md`. Record the remaining owner dependency exactly as: `Activate approved Amazon Associates and Noon affiliate IDs; current production links are direct retailer links.` Commit with `release: prepare Setup Sahla affiliate launch`.
