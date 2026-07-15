# Setup Sahla

Production Vinext publication for **Setup Sahla**, an Egypt-first guide to pain-solving PC and laptop setup accessories.

## Run locally

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

## Verify

```bash
npm run lint
npx tsc --noEmit
npm test
```

`npm test` creates the Cloudflare-compatible production build, renders all 16 required routes through the Worker entry point, and checks disclosures, provider URLs, metadata, structured data, claim boundaries, external-link safety, article structure and removal of preview remnants.

## Publication structure

- `app/`: route pages, reusable editorial components, metadata and design system
- `content/blogs/`: the three reviewed launch articles
- `data/products.json`: canonical five-product research data
- `data/editorial-map.json`: guide roles, FAQs and internal-link intent
- `public/images/`: original generic Setup Sahla visuals
- `tests/rendered-html.test.mjs`: production-render publication checks
- `.openai/hosting.json`: Sites hosting binding declaration

Retailer links remain in `DIRECT_LINK — AFFILIATE ID REQUIRED` status. Do not enable affiliate language or add `sponsored` until owner enrollment and final-link verification are complete.

Canonical, Open Graph, sitemap, robots and JSON-LD origins are derived from the Sites request host and forwarded protocol. No unverified production domain is embedded in the build.
