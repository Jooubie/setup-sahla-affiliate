import type { Metadata } from "next";
import { PageIntro } from "@/app/components/PageIntro";
import { routeMetadata } from "@/app/lib/site";

export const metadata: Metadata = routeMetadata("Product research methodology", "How Setup Sahla researches exact models, checks Egypt providers, scores editorial fit and handles dated evidence.", "/methodology/");

const dimensions = [
  ["Problem urgency", "How clearly the accessory addresses a repeated setup friction."],
  ["Search intent", "Whether the observed query language supports a problem or commercial-investigation route; no volume is implied."],
  ["Availability", "Whether exact-model Egypt retailer pages were verified across both launch providers."],
  ["Value fit", "An editorial view of the problem-to-cost relationship at the dated snapshot, not a permanent price claim."],
  ["Compatibility", "How clearly the fit gate can be stated from source material."],
  ["Editorial fit", "Whether a calm, useful verdict can include both best-for and skip-if guidance."],
  ["Visual explainability", "Whether original category artwork can explain the job without impersonating the product."],
];

export default function MethodologyPage() {
  return (
    <div className="page-shell info-page">
      <PageIntro eyebrow="Version 1.0 · reviewed 15 July 2026" title="A score is a map, not a medal." description="The launch score helps prioritize useful editorial routes. It is not a lab benchmark, customer rating, bestseller list or forecast." />
      <section className="method-steps">
        <div><span>01</span><h2>Start broad</h2><p>Research at least 12 named candidates across five pain clusters. Retain exact model, variant and retailer identity.</p></div>
        <div><span>02</span><h2>Separate sources</h2><p>Keep manufacturer specifications apart from provider snapshots and qualitative search-language observations.</p></div>
        <div><span>03</span><h2>Apply gates</h2><p>Reject or quarantine unclear variants, single-retailer dependence, missing seller data or unsupported outcome claims.</p></div>
        <div><span>04</span><h2>Publish limits</h2><p>Show best-for, skip-if, compatibility, risks, dated captures and the closest held-back alternative.</p></div>
      </section>
      <section className="section-block"><div className="section-heading"><div><p className="eyebrow">Seven dimensions</p><h2>What contributes to the editorial score</h2></div><p>Component weights are visible on every product page and sum to the shown total.</p></div><dl className="dimension-list">{dimensions.map(([term, detail]) => <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>)}</dl></section>
      <section className="limit-box"><p className="eyebrow">Refresh cadence</p><h2>Facts age at different speeds.</h2><p>Price, stock, seller, fulfillment and returns should be checked before each promotion. Compatibility and model identity should be rechecked when a listing or manufacturer page changes. Affiliate status changes only after owner-side proof and final-link verification.</p></section>
    </div>
  );
}
