import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "./Breadcrumbs";
import { DirectLinkDisclosure } from "./Disclosure";
import { formatDate, formatEgp } from "@/app/lib/site";
import { getProduct, productGuideLinks, productImages, type Product } from "@/app/lib/products";

const componentLabels: Record<string, string> = {
  problemUrgency: "Problem urgency",
  searchIntent: "Search intent",
  availability: "Egypt availability",
  value: "Value fit",
  compatibility: "Compatibility clarity",
  editorialFit: "Editorial fit",
  visual: "Visual explainability",
};

function DecisionList({ title, items, tone }: { title: string; items: string[]; tone: "go" | "stop" }) {
  return (
    <section className={`decision-panel decision-panel--${tone}`}>
      <p className="eyebrow">{tone === "go" ? "Fit signal" : "Boundary"}</p>
      <h2>{title}</h2>
      <ul className="check-list">
        {items.map((item) => <li key={item}>{item.replace(/^Editorial fit judgment:\s*/, "")}</li>)}
      </ul>
    </section>
  );
}

function ProviderSnapshot({ product }: { product: Product }) {
  return (
    <section className="section-block" aria-labelledby="providers-heading">
      <div className="section-heading">
        <div><p className="eyebrow">Dated market check</p><h2 id="providers-heading">Provider snapshot</h2></div>
        <p>Captured {formatDate(product.priceCapturedAt)}. Prices and offer details move; recheck before buying.</p>
      </div>
      <div className="provider-grid">
        {product.providers.map((provider) => (
          <article className="provider-card" key={provider.retailer}>
            <div className="provider-card__top"><h3>{provider.retailer}</h3><span>{formatEgp(provider.priceEgp)}</span></div>
            <p className="provider-date">Observed {formatDate(provider.capturedAt)}</p>
            <p>{provider.sellerNotes}</p>
            <a
              className="retailer-link"
              href={provider.directUrl}
              target="_blank"
              rel="nofollow noopener noreferrer"
              aria-label={`Open the exact ${product.name} listing at ${provider.retailer} in a new tab`}
            >
              Check exact listing <span aria-hidden="true">↗</span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ProductDetail({ route }: { route: string }) {
  const product = getProduct(route);
  const image = productImages[route];
  const mouseCaution = route === "/products/ergonomic-mouse/";
  return (
    <>
      <Breadcrumbs items={[{ label: "Product fits", href: "/products/" }, { label: product.name, href: route }]} />
      <article className="product-detail">
        <header className="product-hero">
          <div className="product-hero__copy">
            <p className="eyebrow">{product.category} · {product.candidateId}</p>
            <h1>{product.name}</h1>
            <p className="product-model">Model checked: <strong>{product.model}</strong></p>
            <p className="lead">{product.problem}</p>
            {mouseCaution && <p className="truth-label">Shape check: this is a conventional contoured mouse, not a vertical mouse.</p>}
            <div className="score-seal" aria-label={`Editorial evidence score ${product.score.total} out of 100`}>
              <strong>{product.score.total}</strong><span>/100<br />editorial score</span>
            </div>
          </div>
          <figure className="product-hero__visual">
            <Image src={image.src} alt={image.alt} width={900} height={680} priority unoptimized sizes="(max-width: 900px) 100vw, 50vw" />
            <figcaption><strong>Generic visual.</strong> An original category explanation—not a photograph of {product.name}.</figcaption>
          </figure>
        </header>

        <DirectLinkDisclosure />

        <section className="problem-verdict-grid">
          <div><p className="eyebrow">Start here</p><h2>The problem</h2><p>{product.problem}</p></div>
          <div><p className="eyebrow">Research decision</p><h2>Verdict</h2><p>{product.verdict}</p></div>
        </section>

        <div className="decision-grid">
          <DecisionList title="Best for" items={product.bestFor} tone="go" />
          <DecisionList title="Skip if" items={product.skipIf} tone="stop" />
        </div>

        <section className="compatibility-block" aria-labelledby="compatibility-heading">
          <div>
            <p className="eyebrow">Before checkout</p>
            <h2 id="compatibility-heading">Compatibility gate</h2>
            <p>A category match is not enough. Confirm each sourced condition against the exact device, desk and workflow.</p>
          </div>
          <ol>
            {product.compatibility.map((item, index) => <li key={item}><span>0{index + 1}</span>{item}</li>)}
          </ol>
        </section>

        <section className="section-block" aria-labelledby="score-heading">
          <div className="section-heading">
            <div><p className="eyebrow">Transparent selection</p><h2 id="score-heading">Score breakdown</h2></div>
            <p>A launch-set editorial score, not a lab test, customer rating or market-wide ranking.</p>
          </div>
          <div className="score-grid">
            {Object.entries(product.score.components).map(([key, value]) => (
              <div className="score-row" key={key}>
                <span>{componentLabels[key] ?? key}</span><strong>{value}</strong>
                <span className="score-bar" aria-hidden="true"><i style={{ width: `${value * 4}%` }} /></span>
              </div>
            ))}
          </div>
          <p className="rejected-note"><strong>Closest held-back option:</strong> {product.closestRejectedAlternative}</p>
        </section>

        <ProviderSnapshot product={product} />

        <section className="section-block evidence-section" aria-labelledby="evidence-heading">
          <div className="section-heading">
            <div><p className="eyebrow">Trace every fact</p><h2 id="evidence-heading">Evidence &amp; sources</h2></div>
            <p>Manufacturer specifications and Egypt retailer observations were kept separate.</p>
          </div>
          <ol className="evidence-list">
            {product.evidence.map((evidence) => (
              <li key={evidence.evidenceId}>
                <span className="evidence-id">{evidence.evidenceId}</span>
                <p>{evidence.claim}</p>
                <a href={evidence.sourceUrl} target="_blank" rel="nofollow noopener noreferrer">Open source <span className="sr-only">in a new tab</span> ↗</a>
                <time dateTime={evidence.capturedAt}>Captured {formatDate(evidence.capturedAt)}</time>
              </li>
            ))}
          </ol>
        </section>

        <section className="risk-and-next">
          <div><p className="eyebrow">Known limits</p><h2>Recheck list</h2><ul>{product.risks.map((risk) => <li key={risk}>{risk}</li>)}</ul></div>
          <div><p className="eyebrow">Keep diagnosing</p><h2>Use it in context</h2><ul className="link-list">{productGuideLinks[route].map((link) => <li key={link.href}><Link href={link.href}>{link.label} <span aria-hidden="true">→</span></Link></li>)}</ul></div>
        </section>
      </article>
    </>
  );
}
