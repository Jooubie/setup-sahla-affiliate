import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { requestOrigin } from "@/app/lib/site";

export async function Breadcrumbs({ items }: { items: { label: string; href: string }[] }) {
  const origin = await requestOrigin();
  const allItems = [{ label: "Home", href: "/" }, ...items];
  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          {allItems.map((item, index) => (
            <li key={item.href}>
              {index === allItems.length - 1 ? <span aria-current="page">{item.label}</span> : <Link href={item.href}>{item.label}</Link>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: allItems.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            item: `${origin}${item.href}`,
          })),
        }}
      />
    </>
  );
}
