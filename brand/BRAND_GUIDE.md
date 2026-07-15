# Setup Sahla brand guide

Version 1.0 — 15 July 2026

## Brand core

**Setup Sahla** is a practical guide for people in Egypt who already own usable PC or laptop gear and want to remove one daily setup problem at a time. The name pairs the familiar category word “setup” with *sahla* — easy — without pretending every technical choice is effortless.

**Tagline:** **Fix the friction. Keep the gear.**

**Positioning:** evidence-led, locally available setup fixes for ports, posture, heat, cable clutter, and input comfort. Egypt is the launch market. “MENA-aware” describes design readiness and cultural fluency, not region-wide demand evidence.

### Promise

Start with the symptom. Check compatibility. Show the trade-off. Offer the smallest credible fix. A recommendation is useful only when the reader can also see who should skip it.

### Personality

- Calm expert: decisive after the evidence, candid before it.
- Workshop host: warm, organized, and specific about what connects where.
- Friction hunter: notices the irritating five-minute problems that compound every day.
- Budget-respectful: keeps working gear in service instead of glorifying replacement.
- Locally grounded: writes naturally for Egypt and makes EGP, availability, and retailer context explicit.

## Visual idea: one line, one solved path

The signature device is a continuous cable line that resolves into an **S**, connector, underline, route, or diagram path. It turns “setup friction” into something visible: a tangled input becomes a clear route. The line should always connect meaningful information. It is not confetti.

The system combines editorial whitespace with the material feeling of a careful repair bench: warm paper, equipment labels, sturdy panels, direct annotations, and flashes of signal lime or data cyan. Avoid a generic gadget catalogue, luxury desk mood board, or neon gamer room.

## Logo system

The identity is original, hand-authored SVG. It uses no retailer mark, product mark, raster image, or external asset. `logo.svg` has a 560×128 viewBox; `logo-mark.svg` has a 96×96 viewBox. Both include an accessible title and description.

### Primary

Use `logo.svg` on cream or warm paper. The near-black cable and wordmark carry the identity; signal lime marks the routed cable; cyan identifies the connector/data detail. Keep the tagline attached at large and medium sizes.

Minimum rendered width: **220px**. Below that, use the compact mark plus a live-text brand name rather than shrinking the full lockup.

### Reverse

On ink backgrounds, use the same geometry with the wordmark, underline, and tagline recolored to cream. Keep lime and cyan unchanged. Do not place the primary dark wordmark on photography or a dark panel.

### Monochrome

For one-color print, stamps, invoices, and low-fidelity export, use one of these two deterministic constructions. Never flatten every source shape to one solid color; that would hide the cable inside the tile.

1. **Substrate knockout:** print the rounded tile in the single ink, then knock the complete S cable, circular routing node, connector body, and pins out to the unprinted substrate. Outside the tile, print the wordmark, underline, and tagline in the same ink. The knockout openings keep the source stroke widths; do not add gray or a second tint.
2. **Tile-free one-ink:** remove the rounded tile and circular node. Draw the S cable, joined connector body and pins, wordmark, underline, and tagline in one ink on a plain contrasting substrate. Preserve the source geometry and stroke widths. This is the default for stamps smaller than 32mm wide.

For a dark substrate, use one opaque light spot color with the tile-free construction. Do not simulate monochrome by lowering opacity, converting the primary palette to grayscale, or placing same-color cable geometry inside a same-color tile.

### Small-size

Use `logo-mark.svg` alone from **24px to 47px**. At 24px, keep its square viewBox, rounded ink field, 8-unit S cable, and 4-unit connector strokes intact. Do not add the tagline, shadows, or fine labels. From 48px upward, the mark may sit beside the live-text name.

### Clear space

Define **x** as the diameter of the lime cable stroke in the source mark (8 viewBox units). Keep at least **2x** clear space on every side of the mark and **3x** around the full lockup. Page edges, text, cards, retailer names, and other logos may not enter this zone.

### Incorrect use

- Do not rotate, stretch, outline, bevel, glow, or add gradients.
- Do not redraw the S as a generic lightning bolt or replace the connector with a retailer/product symbol.
- Do not put the logo inside a fake marketplace button or next to wording that implies retailer endorsement.
- Do not place the lime cable on cream or paper without its ink field; those pairs lack text-level contrast.
- Do not animate the line as an endless loading state. If motion is used, reveal it once as a route and stop.

## Color system

| Token | Hex | Role |
|---|---:|---|
| Ink | `#101411` | Primary text, inverse surface, diagram line |
| Warm paper | `#E9DFCA` | Workshop panels, evidence bands, report sections |
| Signal lime | `#C9FF4A` | Primary action field, solved-state route, selected label |
| Cool cyan | `#66D9E8` | Data/compatibility accent, connector detail |
| Clean cream | `#FFFDF7` | Main canvas, article and report background |

### Accessible pairings

Ratios use WCAG relative luminance calculations and are documented in `design-tokens.json`.

| Foreground on background | Ratio | Approved use |
|---|---:|---|
| Ink on cream | 18.27:1 | All text and icons |
| Ink on warm paper | 14.04:1 | All text and icons |
| Ink on signal lime | 15.83:1 | Buttons, status labels, small text |
| Cyan on ink | 11.20:1 | Data labels, connector details, links on inverse panels |

Lime, cyan, paper, and cream are not interchangeable foreground/background pairs. Lime on cream, cyan on cream, and cyan on paper fail for text. Use ink text on those surfaces. Never communicate status by color alone; pair it with a label, icon, line pattern, or shape.

## Typography

No paid font is required.

- **Display:** `Arial Narrow, Roboto Condensed, Bahnschrift Condensed, Arial, sans-serif`. Use tight, forceful headings. The site may self-host an open licensed condensed font later, but it must retain this safe fallback.
- **Body/UI:** `Inter, Segoe UI, Arial, sans-serif`. Use natural sentence case and a 1.58 line height.
- **Arabic:** `Noto Sans Arabic, Tahoma, Arial, sans-serif`. Use a 1.75 line height. Preserve Arabic shaping; never letter-space Arabic.
- **Data/IDs:** `Cascadia Mono, Consolas, monospace`. Reserve for evidence IDs, dates, ports, dimensions, and compact table values.

Arabic may appear inline when it is a natural search or usage term. If a full Arabic component is added, set `lang="ar"` and `dir="rtl"`, mirror route arrows that convey sequence, and keep USB/HDMI/model strings left-to-right inside isolated spans. Never force Arabic words into Latin uppercase styling.

### Type hierarchy

Use the token scale, not arbitrary sizes. H1 and H2 can be condensed and uppercase only when short. Article headings stay sentence case. Body text should remain at least 16px on the web. Labels may use 12–14px only with strong contrast and comfortable line height.

## Layout and components

### Friction ticket

A compact label names a symptom: `SOLVES / TOO FEW PORTS`, `CHECK / LAPTOP SIZE`, or `SKIP IF / ...`. Use ink on lime for the strongest action and ink on paper for neutral metadata. Tickets describe content; they do not invent urgency.

### Cable route

A 2–8px line can connect symptom → compatibility gate → fix → retailer choice. Every stop gets a text label. Routes are allowed to bend but not tangle. On mobile, stack the stops and preserve reading order in the document structure.

### Evidence label

Use mono type for evidence IDs, checked dates, and source status. A price is always paired with its currency and snapshot date. An unknown value is written as “Check current price,” never as zero or a blank dash without explanation.

### Cards and panels

Cards are sturdy, not pill-shaped collections. Use 16px card radii, 2px ink borders for key decisions, 1px neutral borders for supporting content, and a hard-edged resting shadow. Keep at least 16px between interactive controls and a minimum 44px tap target.

## Motion

Motion clarifies routing: a cable draws to the next evidence stop, a connector settles, or a compatibility panel expands. Standard transitions last 120–420ms and end decisively. Avoid perpetual floating devices, parallax that competes with reading, or bouncing purchase buttons.

Honor `prefers-reduced-motion: reduce`: remove travel, use a 1ms state change, and keep all meaning visible without animation.

## Photography and illustration behavior

Public launch imagery is `ORIGINAL`. Show recognizable *categories* and setup symptoms through editorial still life, labeled diagrams, paper-cut forms, or carefully generated unbranded scenes. Do not download or recreate Amazon/Noon listing photography. Do not show protected logos, exact packaging, copied review text, false performance readouts, impossible ports, or cables connecting incompatible interfaces.

Images carry no price, promotional claim, badge, CTA, or retailer mark. Website copy provides those facts outside the image and only when supported by evidence.

## Reports and charts

Reports use cream pages, warm-paper section bands, ink text, lime callouts, and cyan data annotations. Charts use the chart tokens plus direct labels, marker shapes, and line styles. Never rely on color alone. Include source, market, period, capture date, and limitation near every research chart.

## Asset handoff

| Asset | Origin | Rights | Intended use | Replacement condition |
|---|---|---|---|---|
| `logo.svg` | Hand-authored for Setup Sahla | `ORIGINAL` | Primary lockup | Replace only through an approved identity revision |
| `logo-mark.svg` | Hand-authored for Setup Sahla | `ORIGINAL` | Favicon, avatar, compact UI | Replace only through an approved identity revision |
| Creative prompts in `CREATIVE_SYSTEM.md` | Written for Setup Sahla | `ORIGINAL` output required | Site, guide, and social generation | Regenerate if output contains a logo, copied composition, unreadable port, or rights doubt |

Keep source SVG and generation records with the business files. If an asset's origin or permission cannot be verified, withdraw it and use the original cable-line fallback.
