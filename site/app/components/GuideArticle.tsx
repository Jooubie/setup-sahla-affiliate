import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "./Breadcrumbs";
import { DirectLinkDisclosure } from "./Disclosure";
import { JsonLd } from "./JsonLd";
import { MarkdownArticle } from "./MarkdownArticle";
import { getGuide } from "@/app/lib/guides";
import { requestOrigin, SITE_NAME } from "@/app/lib/site";

export async function GuideArticle({ route }: { route: string }) {
  const guide = getGuide(route);
  const origin = await requestOrigin();
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      image: `${origin}${guide.image}`,
      datePublished: "2026-07-15",
      dateModified: "2026-07-15",
      author: { "@type": "Organization", name: `${SITE_NAME} Editorial` },
      publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: `${origin}/brand-mark.svg` } },
      mainEntityOfPage: `${origin}${guide.route}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Fix-it guides", href: "/guides/" }, { label: guide.shortTitle, href: route }]} />
      {schema.map((entry) => <JsonLd key={entry["@type"] as string} data={entry} />)}
      <article className="guide-article">
        <header className="guide-hero">
          <div className="guide-hero__copy">
            <p className="eyebrow">Launch guide · {guide.role}</p>
            <h1>{guide.title}</h1>
            <p className="lead">{guide.description}</p>
            <div className="article-meta"><span>Setup Sahla Editorial</span><time dateTime="2026-07-15">15 July 2026</time><span>Evidence-dated</span></div>
          </div>
          <figure>
            <Image src={guide.image} alt={guide.imageAlt} width={1100} height={720} priority unoptimized sizes="(max-width: 900px) 100vw, 48vw" />
            <figcaption>Original generic editorial visual. It does not depict a selected commercial model.</figcaption>
          </figure>
        </header>
        <DirectLinkDisclosure compact />
        <div className="article-layout">
          <aside className="article-rail">
            <p className="eyebrow">Decision rule</p>
            <p>One friction. One fit gate. No accessory outcome assumed.</p>
            <Link href={guide.cta.href} className="text-link">{guide.cta.label} <span aria-hidden="true">→</span></Link>
          </aside>
          <MarkdownArticle source={guide.markdown} />
        </div>
      </article>
    </>
  );
}
