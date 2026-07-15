import { safeJson } from "@/app/lib/site";

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson(data) }}
    />
  );
}
