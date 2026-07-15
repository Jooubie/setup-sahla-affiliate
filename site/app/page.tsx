import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DirectLinkDisclosure } from "./components/Disclosure";
import { JsonLd } from "./components/JsonLd";
import { ProductCard } from "./components/ProductCard";
import { products } from "./lib/products";
import { requestOrigin, routeMetadata, SITE_NAME } from "./lib/site";

export const metadata: Metadata = routeMetadata(
  "Fix the friction in your PC setup",
  "Egypt-first fit checks for five PC and laptop setup accessories—built around ports, posture, airflow, cable reach and pointer fit.",
  "/",
);

const frictionSteps = [
  ["01", "Name it", "Write the repeated desk friction in one sentence."],
  ["02", "Gate it", "Check device, port, size, power and surface fit."],
  ["03", "Compare it", "Open exact Egypt retailer pages and recheck the dated offer."],
];

export default async function Home() {
  const origin = await requestOrigin();
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "Organization", "@id": `${origin}/#organization`, name: SITE_NAME, url: origin, logo: `${origin}/brand-mark.svg`, slogan: "Fix the friction. Keep the gear." },
          { "@type": "WebSite", "@id": `${origin}/#website`, name: SITE_NAME, url: origin, publisher: { "@id": `${origin}/#organization` }, inLanguage: "en-EG" },
        ],
      }} />
      <section className="home-hero">
        <div className="home-hero__copy">
          <p className="eyebrow">Egypt-first setup diagnostics</p>
          <h1>Keep the laptop.<br /><span>Fix the friction.</span></h1>
          <p className="lead">Five researched accessories for five specific desk problems. Start with the problem—not the product.</p>
          <div className="button-row">
            <Link href="/guides/laptop-desk-setup-diagnostic/" className="button button--signal">Run the 5-minute check</Link>
            <Link href="/products/" className="button button--ink">See all five fits</Link>
          </div>
          <div className="home-proof"><span>15 candidates checked</span><span>5 exact-model fits</span><span>2 Egypt retailers</span></div>
        </div>
        <figure className="home-hero__visual">
          <Image src="/images/home-hero.webp" alt="Original Setup Sahla illustration of a laptop desk with five setup friction points" width={1200} height={900} priority unoptimized sizes="(max-width: 900px) 100vw, 52vw" />
          <figcaption>Original category artwork—never a substitute for exact model evidence.</figcaption>
        </figure>
      </section>

      <section className="friction-strip" aria-labelledby="friction-heading">
        <div><p className="eyebrow">The Setup Sahla loop</p><h2 id="friction-heading">A purchase has to earn its place.</h2></div>
        <ol>{frictionSteps.map(([number, title, description]) => <li key={number}><span>{number}</span><div><strong>{title}</strong><p>{description}</p></div></li>)}</ol>
      </section>

      <DirectLinkDisclosure compact />

      <section className="product-feature" aria-labelledby="launch-set-heading">
        <div className="section-heading section-heading--wide">
          <div><p className="eyebrow">The launch set</p><h2 id="launch-set-heading">Five pain-solving fit checks</h2></div>
          <p>Scores rank editorial fit within this researched launch set. They are not product performance tests.</p>
        </div>
        <div className="product-grid">{products.map((product, index) => <ProductCard key={product.candidateId} product={product} index={index} />)}</div>
        <div className="center-action"><Link href="/products/" className="button button--ink">Compare all five decisions</Link></div>
      </section>

      <section className="editorial-callout">
        <div className="editorial-callout__number" aria-hidden="true">5</div>
        <div><p className="eyebrow">Start without shopping</p><h2>Diagnose ports, height, heat, cables and pointer fit in one pass.</h2></div>
        <div><p>The launch diagnostic turns a vague “better setup” into a short list of fit gates. Sometimes the right answer is to move something you already own.</p><Link href="/guides/laptop-desk-setup-diagnostic/" className="text-link">Open the desk diagnostic →</Link></div>
      </section>
    </>
  );
}
