import type { Metadata } from "next";
import { DirectLinkDisclosure } from "@/app/components/Disclosure";
import { JsonLd } from "@/app/components/JsonLd";
import { PageIntro } from "@/app/components/PageIntro";
import { ProductCard } from "@/app/components/ProductCard";
import { products } from "@/app/lib/products";
import { requestOrigin, routeMetadata } from "@/app/lib/site";

export const metadata: Metadata = routeMetadata(
  "Five PC setup product fit checks",
  "Compare five researched, exact-model PC and laptop setup accessories available from Amazon Egypt and Noon Egypt.",
  "/products/",
);

export default async function ProductsPage() {
  const origin = await requestOrigin();
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Setup Sahla launch product fit checks",
        numberOfItems: products.length,
        itemListElement: products.map((product, index) => ({ "@type": "ListItem", position: index + 1, name: product.name, url: `${origin}${product.route}` })),
      }} />
      <div className="page-shell">
        <PageIntro eyebrow="Exact-model launch set" title="Five products. Five named frictions." description="Every pick passed a manufacturer identity check and had exact pages at Amazon Egypt and Noon Egypt. The fit gate matters more than the score." />
        <DirectLinkDisclosure />
        <div className="product-grid product-grid--index">{products.map((product, index) => <ProductCard key={product.candidateId} product={product} index={index} />)}</div>
        <aside className="snapshot-caution"><strong>Snapshot rule:</strong> captured prices, stock, sellers, fulfillment and returns can change. Recheck before buying; never treat a low-stock observation as urgency.</aside>
      </div>
    </>
  );
}
