# Setup Sahla site build context

## Mission

Build a production-ready, multi-route affiliate editorial site for **Setup Sahla**, an Egypt-first guide to pain-solving PC and laptop setup accessories. The public promise is **“Fix the friction. Keep the gear.”**

Use the existing Sites/Vinext starter exactly as initialized. Preserve Vite, the `sites()` plugin, Cloudflare Worker-compatible ESM output, the lockfile, and `.openai/hosting.json`. Remove the starter skeleton and `react-loading-skeleton` once replaced.

## Source of truth inside this repository

- `data/products.json`: five canonical selected products, scores, evidence IDs, compatibility, retailer links and image paths.
- `data/editorial-map.json`: the three launch guide roles, FAQs, internal links and CTAs.
- `content/blogs/*.md`: publication-ready launch articles.
- `public/images/*`: original, category-generic Setup Sahla visuals; never present them as photographs of the selected commercial models.
- `public/brand-logo.svg`, `public/brand-mark.svg`, `public/favicon.svg`: original brand assets.

If any local copy conflicts with the parent project, defer to the parent project’s canonical `data/products.json`, brand voice, and evidence/compliance documents.

## Required routes

- `/`
- `/products/`
- `/products/usb-c-hub/`
- `/products/laptop-stand/`
- `/products/laptop-cooling-pad/`
- `/products/desk-cable-management/`
- `/products/ergonomic-mouse/` — explain honestly that the selected M650 is a conventional contoured mouse, not a vertical mouse.
- `/guides/`
- `/guides/laptop-desk-setup-diagnostic/`
- `/guides/usb-c-hub-buying-guide-egypt/`
- `/guides/laptop-heat-screen-height-cable-management/`
- `/research/`
- `/about/`
- `/methodology/`
- `/disclosure/`
- `/privacy/`

## Visual and interaction system

- Palette: ink `#101411`, warm paper `#E9DFCA`, signal lime `#C9FF4A`, cool cyan `#66D9E8`, cream `#FFFDF7`.
- A continuous cable-line S is the signature device. Use CSS borders/lines and the existing logo; do not author decorative inline SVG illustrations.
- Editorial workshop utility, strong condensed headings, generous whitespace, tactile image cards, visible evidence chips, calm motion.
- Avoid generic SaaS panels, luxury-desk fantasy, RGB gamer styling, excessive gradients, glassmorphism, carousels, and fake retailer UI.
- Mobile-first, keyboard accessible, high contrast, visible focus, reduced-motion support, skip link, semantic landmarks, minimum 44px touch targets.

## Commercial and evidence rules

- Current provider links are direct exact-product links only. `affiliateUrl` is `null` and status is `DIRECT_LINK — AFFILIATE ID REQUIRED`.
- Never claim current commission. Amazon Egypt activation requires owner enrollment/tag and verified final links. Noon Egypt eligibility remains unconfirmed because public terms do not establish Egypt territory.
- Before the first retailer CTA on every commercial page, explain the current direct-link state. Do not use the Amazon Associate statement until verified Amazon affiliate links are active.
- Mark external retailer links safely; use clear retailer names, `target="_blank"`, and `rel="nofollow noopener noreferrer"` for current direct links. Add `sponsored` only when links become verified affiliate links.
- Prices, stock, seller, fulfillment, ratings, and return observations are dated snapshots. Show capture dates and a “recheck before buying” note.
- Every product page needs: problem, verdict, best-for, skip-if, compatibility gate, score breakdown, evidence/source panel, provider comparison, image disclaimer, and internal guide links.
- Do not invent demand volume, difficulty, popularity, sales, conversion, commission, performance, temperature, medical, adhesion, or warranty outcomes.
- Treat generated images as generic visual explanations; model/retailer facts must remain in live text.

## SEO and structured data

- Unique metadata and canonical path per route.
- JSON-LD: `Organization`/`WebSite` on the home route; `ItemList` on product and guide indexes; `Article` plus `FAQPage` when the rendered FAQ is visible; `Product` only when every included field is sourced and no fabricated offers/reviews are emitted; `BreadcrumbList` on detail routes.
- Do not add aggregate rating, price-valid-until, availability, or merchant offer schema from unstable snapshots.
- Build meaningful cross-links between problem guides and product pages.

## Verification

- Extend tests for route rendering, disclosures before retailer CTAs, exact provider URLs/status, metadata, structured-data safety, unsupported-claim patterns, no starter remnants, and accessible external links.
- Run `npm test` and `npm run build` using the environment-variable-compatible Windows invocation when necessary.
- Do not perform browser screenshots or UI automation; the user did not request browser QA.
