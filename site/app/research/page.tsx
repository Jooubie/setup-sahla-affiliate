import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/app/components/PageIntro";
import { products } from "@/app/lib/products";
import { routeMetadata } from "@/app/lib/site";

export const metadata: Metadata = routeMetadata(
  "The Setup Sahla research room",
  "See why five exact-model PC setup accessories were selected from 15 candidates and where the evidence stops.",
  "/research/",
);

export default function ResearchPage() {
  return (
    <div className="page-shell">
      <PageIntro eyebrow="Open research room" title="The evidence trail, without the sales fog." description="Fifteen candidates entered. Five launch products passed identity, availability and explainability gates. The evidence is dated; the boundaries stay visible." />
      <section className="research-stats" aria-label="Research totals">
        <div><strong>15</strong><span>candidates reviewed</span></div>
        <div><strong>5</strong><span>launch fits selected</span></div>
        <div><strong>48</strong><span>qualitative keyword records across eight routes</span></div>
        <div><strong>0</strong><span>invented volume metrics</span></div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><p className="eyebrow">Selection table</p><h2>Why these five made the launch set</h2></div><p>Scores organize editorial fit inside this set. They do not claim real-world performance.</p></div>
        <div className="research-table-wrap">
          <table>
            <thead><tr><th>Problem route</th><th>Selected model</th><th>Score</th><th>Closest held-back option</th></tr></thead>
            <tbody>{products.map((product) => <tr key={product.candidateId}><td>{product.category}</td><td><Link href={product.route}>{product.name}</Link></td><td>{product.score.total}/100</td><td>{product.closestRejectedAlternative}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="research-layers">
        <div><span className="layer-number">01</span><h2>Manufacturer layer</h2><p>Model identity, fit dimensions, port roles, listed power paths and variant boundaries came from official product material where available.</p></div>
        <div><span className="layer-number">02</span><h2>Provider layer</h2><p>Exact Amazon Egypt and Noon Egypt product pages supplied dated price, stock, seller, fulfillment and return observations. Those facts require a fresh check.</p></div>
        <div><span className="layer-number">03</span><h2>Search-language layer</h2><p>Egypt-localized Google suggestions helped name problem and commercial-investigation routes. “Returned” is a qualitative presence signal—not volume, difficulty or trend direction.</p></div>
      </section>

      <section className="limit-box">
        <p className="eyebrow">Hard boundary</p>
        <h2>What the research does not establish</h2>
        <ul><li>No hands-on product testing was performed.</li><li>No search-volume, keyword-difficulty, sales or conversion dataset was available.</li><li>No current affiliate commission is claimed.</li><li>No medical, temperature, performance, adhesion, noise or warranty outcome is inferred.</li></ul>
        <Link href="/methodology/" className="button button--ink">Read the scoring method</Link>
      </section>
    </div>
  );
}
