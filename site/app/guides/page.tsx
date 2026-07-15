import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/app/components/JsonLd";
import { PageIntro } from "@/app/components/PageIntro";
import { guides } from "@/app/lib/guides";
import { requestOrigin, routeMetadata } from "@/app/lib/site";

export const metadata: Metadata = routeMetadata(
  "PC and laptop setup fix-it guides",
  "Three evidence-dated launch guides for diagnosing laptop desk friction, choosing a USB-C hub and separating heat, height and cable problems.",
  "/guides/",
);

export default async function GuidesPage() {
  const origin = await requestOrigin();
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Setup Sahla launch guides",
        numberOfItems: guides.length,
        itemListElement: guides.map((guide, index) => ({ "@type": "ListItem", position: index + 1, name: guide.title, url: `${origin}${guide.route}` })),
      }} />
      <div className="page-shell">
        <PageIntro eyebrow="Three launch guides" title="Diagnose first. Then compare." description="Use the broad desk check first, then open the focused hub or three-fix workflow only when the problem calls for it." />
        <div className="guide-index">
          {guides.map((guide, index) => (
            <article className="guide-card" key={guide.route}>
              <Link href={guide.route} className="guide-card__visual">
                <Image src={guide.image} alt={guide.imageAlt} width={1000} height={660} unoptimized sizes="(max-width: 760px) 100vw, 44vw" />
                <span aria-hidden="true">0{index + 1}</span>
              </Link>
              <div><p className="eyebrow">{guide.role}</p><h2><Link href={guide.route}>{guide.title}</Link></h2><p>{guide.description}</p><Link href={guide.route} className="text-link">Read the guide →</Link></div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
