# Task 3 — Setup Sahla identity system

## Outcome

Create a production-ready, original identity system for Setup Sahla that is usable by the website, editorial, workbook, PDF reports, and social launch creatives.

## Brand truth

- Name: **Setup Sahla**
- Tagline: **Fix the friction. Keep the gear.**
- Market: Egypt first; MENA-aware without claiming region-wide evidence.
- Promise: practical, evidence-backed setup fixes for real desk and laptop pain points.
- Positioning: problem-first and compatibility-aware; never luxury-for-luxury's-sake.
- Voice: calm expert, candid, useful, lightly conversational, never hype-driven.
- Launch products: Anker 332 USB-C hub, UGREEN 40289 laptop stand, Havit F2069 cooling pad, JOYROOM JR-ZS368 cable organizer, Logitech M650 small/medium graphite mouse.

## Visual direction

- Editorial utility with a warm Egyptian workshop feel, not a generic electronics catalogue.
- Core colors: ink `#101411`, warm paper `#E9DFCA`, signal lime `#C9FF4A`, cool cyan `#66D9E8`, clean cream `#FFFDF7`.
- Signature device: a continuous cable line that resolves into an **S**, connector, underline, or routing path.
- Strong hierarchy, generous whitespace, useful diagrams/labels, product pain-to-fix storytelling.
- Avoid generic gradients, neon gamer clichés, fake retailer interfaces, copied marketplace imagery, photorealistic brand logos, and misleading product renders.

## Required files

- `brand/BRAND_GUIDE.md`
- `brand/VOICE_AND_EDITORIAL.md`
- `brand/design-tokens.json`
- `brand/logo.svg`
- `brand/logo-mark.svg`
- `brand/CREATIVE_SYSTEM.md`
- `scripts/validate_brand.mjs`
- `tests/brand-assets.test.mjs`

## Requirements

1. Hand-author original accessible SVG logo files with viewBox, title/description, no external assets, no embedded raster data, and no trademarked product marks.
2. Provide primary, reverse, monochrome, small-size, and clear-space rules in the guide. The compact mark must remain legible at 24px.
3. Define typography stacks using locally safe/system fonts and a web-ready Arabic-capable stack. Do not require a paid font.
4. Define semantic tokens for color, type scale, spacing, radii, shadow, motion, and chart/report use. Token JSON must be valid and machine-consumable.
5. Define voice principles, before/after examples, approved CTA patterns, disclosure language, price/stock caveats, compatibility warnings, and words to avoid.
6. Define one coherent creative system plus exact prompts/shot directions for: home hero, five product-category visuals, three blog covers, and one 1200x630 OG/social image. All imagery must be original and must not reproduce retailer product photography or protected logos.
7. Include alt-text guidance and an image-rights checklist.
8. Tests must fail before implementation and then validate required files, SVG safety/accessibility, palette tokens, tagline, exact creative slots, and no external SVG href/script/image nodes.

## Verification

- `node --test tests/brand-assets.test.mjs`
- `node scripts/validate_brand.mjs`

## Commit

Commit only the scoped files with message: `brand: establish Setup Sahla identity system`.
