# Setup Sahla product and provider research

Research window: **2026-07-14 to 2026-07-15 UTC**. This is an upstream candidate universe; Research Integration makes the scored final-five decision.

## Method and launch gate

A launch-eligible candidate needs a traceable brand/model, a manufacturer or official-brand specification source, a current exact product-detail page on both Amazon Egypt and Noon Egypt, explicit compatibility gates, and no unresolved counterfeit, electrical-safety, or model-identity risk. Search-result URLs are discovery aids only and are never stored as provider evidence. Retailer pages control dated price, seller, fulfillment, stock, warranty, returns, and ratings; manufacturer pages control specifications and compatibility.

All linked product images, descriptions, and reviews remain `SOURCE_LINK_ONLY`. They are evidence, not reusable creative. Setup Sahla uses original artwork until an approved affiliate program supplies permitted program content; the relevant retailer program rules are recorded separately in `affiliate-program-evidence.csv`.

## Repair outcome after independent review

The first pass was Noon-only and therefore failed the design's provider-dependence gate. A live catalog pass then verified true Amazon Egypt product-detail pages for five cross-retailer candidates:

- Anker 332 hub: [Amazon Egypt exact page](https://www.amazon.eg/-/en/dp/B0BQLLB61B), [Noon exact A8355H11 page](https://www.noon.com/egypt-en/anker-332-usb-c-hub-5-in-1-usb-c-connector-with-4k-hdmi-100w-power-charger-black-a8355h11/N70086896V/p/), and [Anker model page](https://www.anker.com/products/a8355).
- UGREEN foldable stand: [Amazon Egypt exact page](https://www.amazon.eg/-/en/dp/B08TLVKBMJ), [Noon exact 40289 page](https://www.noon.com/egypt-en/laptop-stand-aluminum-alloy-adjustable-eye-level-ergonomic-height-laptop-riser-holder-compatible-for-macbook-pro-2021-air-chromebook-and-more-storage-bag-included/N53340883A/p/), and [UGREEN 40289 specification](https://www.ugreen.com/tr-tr/products/tr-40289).
- Havit F2069 cooling pad: [Amazon Egypt exact page](https://www.amazon.eg/-/en/dp/B0CP198X1G), [Noon exact F2069 page](https://www.noon.com/egypt-en/f2069-rgb-light-10-clock-mode-cooling-pad-cool-for-laptop-low-noise-fan-cooler-with-cell-phone-holder/N70023962V/p/), and [Havit HV-F2069 model page](https://www.prohavit.com/zh-hans-jp/products/hv-f2069-laptop-cooling-pad-for-up-to-17-inch-laptop).
- JOYROOM JR-ZS368 six-piece organizer: [Amazon Egypt exact page](https://www.amazon.eg/-/en/dp/B0DJH1W2N4), [Noon exact six-piece page](https://www.noon.com/egypt-en/joyroom-cable-organiser-jr-zs368-magnetic-black-6-pcs/ZDB64AB2F8DE78C016649Z/p/?o=zdb64ab2f8de78c016649z-1), and [JOYROOM variant page](https://www.joyroom.com/products/joyroom-jr-zs368-magnetic-cable-organizer-9pcs-b2c).
- Logitech Signature M650 small/medium graphite: [Amazon Egypt named-variant page](https://www.amazon.eg/-/en/dp/B09QWY7JYK), [Noon 910-006253 page](https://www.noon.com/egypt-en/signature-m650-wireless-mouse-for-small-to-medium-sized-hands-silent-clicks-5-buttons-bluetooth-multi-device-compatibility-400-dpi-nominal-value-10m-range-black/N53285882A/p/), and [Logitech M650 specification](https://www.logitech.com/en-us/products/mice/m650-signature-wireless-mouse.html).

## Candidate disposition

| ID | Cluster | Product | Status | Rationale |
|---|---|---|---|---|
| PP-C01 | Ports/connectivity | Anker 332 A8355/A8355H11 | Eligible | Dual exact retailer pages plus manufacturer identity; compatibility and PD gates are explicit. |
| PP-C02 | Ports/connectivity | UGREEN Revodok 105 15495 | Quarantine | Noon-only; retailer port wording is ambiguous. |
| PP-C03 | Ports/connectivity | Baseus UltraJoy BS-OH150 | Quarantine | Noon-only. |
| PP-C04 | Posture | UGREEN Foldable Stand 40289 | Eligible | Dual exact retailer pages plus manufacturer model mapping. |
| PP-C05 | Posture | UGREEN LP230 80348 | Rejected | Distributor-only specification source, no Amazon exact page, and seller was not retained. |
| PP-C06 | Posture | UGREEN vertical stand 20471 | Rejected | Conflicting fit wording, no Amazon exact page, and seller was not retained. |
| PP-C07 | Thermal | DeepCool U PAL | Rejected | Noon-only and seller was not retained. |
| PP-C08 | Thermal | Redragon GCP512 | Rejected | Noon-only, 52–58 dB manufacturer range, and no captured warranty. |
| PP-C09 | Cable control | JOYROOM JR-ZS368 6-piece | Eligible with price/stock caution | Dual exact pages; the Amazon capture was EGP 279/one left while the Noon capture was EGP 950.81/two left. |
| PP-C10 | Input comfort | Logitech M650 small/medium graphite | Eligible with part-number mapping caution | Dual named-variant pages; Amazon does not print the Noon regional part number in its title. |
| PP-C11 | Input comfort | Logitech K380s Arabic 920-011867 | Rejected | Noon-only and captured as non-returnable. |
| PP-C12 | Input comfort | Logitech Lift 910-006473 | Rejected | Noon page co-mingles multiple part numbers; exact retailer variant remains unresolved. |
| PP-C13 | Cable control | UGREEN-branded CB-54259 clips | Rejected | No manufacturer model match. |
| PP-C14 | Cable control | Generic 3m cable kit | Rejected | No stable manufacturer or model. |
| PP-C15 | Thermal | Havit HV-F2069 | Eligible with refresh caution | Dual exact retailer pages and official-brand identity; manufacturer store marks the model no longer sold there. |

Detailed dates, prices, seller/fulfillment observations, and source URLs are one-row-per-observation in `product-evidence.csv`.

## Cross-provider observations for the eligible five

### PP-C01 — Anker 332 hub

- Amazon Egypt showed EGP 1,539, in stock, Amazon.eg seller/shipper, and free returns on the [exact product page](https://www.amazon.eg/-/en/dp/B0BQLLB61B).
- Noon showed EGP 1,999, only five left, Dokkan Tech, and noon-express on the [exact A8355H11 page](https://www.noon.com/egypt-en/anker-332-usb-c-hub-5-in-1-usb-c-connector-with-4k-hdmi-100w-power-charger-black-a8355h11/N70086896V/p/).
- Anker states the hub takes up to 100W PD input, passes up to 85W to the laptop, and does not include the charger on the [A8355 page](https://www.anker.com/products/a8355). A buyer must confirm USB-C video/DisplayPort Alt Mode and use a compliant PD charger and cable.

The capture supports two providers but not a permanent “best provider” claim. Amazon had the lower dated price; both price and stock can change.

### PP-C04 — UGREEN 40289 stand

- Amazon Egypt showed EGP 666, in stock, Amazon.eg seller/shipper, and free returns on the [exact stand page](https://www.amazon.eg/-/en/dp/B08TLVKBMJ).
- Noon showed EGP 945.60, add-to-cart availability, wusool, and noon-express on the [exact 40289 page](https://www.noon.com/egypt-en/laptop-stand-aluminum-alloy-adjustable-eye-level-ergonomic-height-laptop-riser-holder-compatible-for-macbook-pro-2021-air-chromebook-and-more-storage-bag-included/N53340883A/p/).
- UGREEN lists 8–17.3-inch fit, five height levels, an open ventilation area, and up to 5 kg load on the [model page](https://www.ugreen.com/tr-tr/products/tr-40289).

The stand should be paired with an external keyboard and mouse when raised; Setup Sahla must not promise a medical posture outcome.

### PP-C15 — Havit F2069 cooling pad

- Amazon Egypt showed EGP 1,035, in stock, Amazon.eg seller/shipper, and free returns on the [exact F2069 page](https://www.amazon.eg/-/en/dp/B0CP198X1G).
- Noon showed EGP 1,040, 4.5 from 13 visible ratings, free delivery, and noon-express on the [exact F2069 page](https://www.noon.com/egypt-en/f2069-rgb-light-10-clock-mode-cooling-pad-cool-for-laptop-low-noise-fan-cooler-with-cell-phone-holder/N70023962V/p/); the seller was not retained and must be rechecked.
- Havit identifies four fans, 15.6–17.3-inch fit, dual USB, speed control, two height settings, and the need for a Type-C-to-USB adapter when applicable on the [HV-F2069 page](https://www.prohavit.com/zh-hans-jp/products/hv-f2069-laptop-cooling-pad-for-up-to-17-inch-laptop).

The manufacturer store marks the model no longer available there, so this candidate needs a tighter refresh cadence. It is USB-powered rather than mains-powered, but it is not a repair for blocked vents, dried thermal compound, or a failing internal fan.

### PP-C09 — JOYROOM JR-ZS368 organizer

- Amazon Egypt showed EGP 279, one left, seller Basics EG, and free returns on the [exact six-piece page](https://www.amazon.eg/-/en/dp/B0DJH1W2N4); shipping/fulfillment party was not exposed.
- Noon showed EGP 950.81, two left, attention store, and noon-express on the [exact six-piece page](https://www.noon.com/egypt-en/joyroom-cable-organiser-jr-zs368-magnetic-black-6-pcs/ZDB64AB2F8DE78C016649Z/p/?o=zdb64ab2f8de78c016649z-1).
- JOYROOM documents a six-piece variant and cables under 7.5 mm on the [JR-ZS368 page](https://www.joyroom.com/products/joyroom-jr-zs368-magnetic-cable-organizer-9pcs-b2c).

The large price spread and low stock require a launch-day recheck. Adhesion and cable diameter are fit gates; the product is not suitable where adhesive residue is unacceptable.

### PP-C10 — Logitech Signature M650

- Amazon Egypt showed the small/medium graphite M650 at EGP 1,799, four left, sold by Dokkan Tech, with free returns on the [named-variant page](https://www.amazon.eg/-/en/dp/B09QWY7JYK).
- Noon showed regional part 910-006253 at EGP 1,749, add-to-cart availability, Dokkan Tech, and noon-express on the [exact Noon page](https://www.noon.com/egypt-en/signature-m650-wireless-mouse-for-small-to-medium-sized-hands-silent-clicks-5-buttons-bluetooth-multi-device-compatibility-400-dpi-nominal-value-10m-range-black/N53285882A/p/).
- Logitech documents Bluetooth Low Energy, Logi Bolt, a 200–4000 DPI range, and small/medium right-hand sizing on the [M650 page](https://www.logitech.com/en-us/products/mice/m650-signature-wireless-mouse.html).

Amazon's title does not expose regional part 910-006253, so the provider match is by model, size, color, and orientation. The page must say this is a quiet conventional mouse, not a vertical ergonomic or medical device.

## Safety, counterfeit, and identity disposition

- Powered hubs: promote only the verified Anker model/configuration; require compatible USB-C video, note that the charger is not included, and use the [manufacturer power limits](https://www.anker.com/products/a8355). No generic or model-ambiguous hub enters the launch set.
- Cooling pads: the selected Havit unit is powered through USB according to the [brand specification](https://www.prohavit.com/zh-hans-jp/products/hv-f2069-laptop-cooling-pad-for-up-to-17-inch-laptop); content must reject damaged cables and avoid repair/temperature promises.
- Counterfeit risk: no candidate is declared “authentic” from listing copy alone. The build records exact model identity and seller/fulfillment; buyers are told to verify the received model and return eligibility.
- Model identity: Logitech Lift, CB-54259 clips, and the generic cable kit are rejected because exact variant/manufacturer identity is unresolved; see their direct [Lift](https://www.noon.com/egypt-en/lift-vertical-ergonomic-mouse-wireless-bluetooth-or-logi-bolt-usb-receiver-quiet-clicks-4-buttons-compatible-with-windows-macos-ipados-laptop-pc-black/N53341712A/p/), [clips](https://www.noon.com/egypt-en/2-pack-cable-clips-holder-desktop-cable-management-system-cable-organizer-for-power-cords/N52353977A/p/), and [generic kit](https://www.noon.com/egypt-en/3m-cable-tidy-kit-with-clips-for-cord-and-wire-organization-at-home-or-office-wrap-and-hide-cables-easily-without-tools/ZE9778DCE447C3AAE27DAZ/p/) records.

## Limitations and integration rules

1. Prices, stock, ratings, sellers, fulfillment, warranties, and returns are dated observations, not live promises. Recheck finalists immediately before launch and every 14 days.
2. The keyword package is Egypt-localized. Do not generalize demand to all MENA markets; UAE/KSA expansion is a future research phase.
3. Havit F2069's manufacturer-store discontinuation and JOYROOM's low observed stock make those two the most urgent refresh candidates.
4. The three SEO rows marked `not_returned` and the Google Trends rate-limit row cannot contribute to demand scoring.
5. Use original Setup Sahla visuals. Do not copy Amazon, Noon, or manufacturer product images from these links.
6. Do not state that Amazon or Noon is permanently the best provider. Compare only dated exact-offer observations.

## Integration recommendation

Research Integration may score **PP-C01, PP-C04, PP-C09, PP-C10, and PP-C15** as the only five candidates that currently satisfy the cross-retailer launch shape, while preserving every caution above. The closest rejected alternatives should be: Baseus UltraJoy for the hub, UGREEN 80348 for the stand, DeepCool U PAL for cooling, CB-54259 clips for cable control, and Logitech Lift for input comfort.
