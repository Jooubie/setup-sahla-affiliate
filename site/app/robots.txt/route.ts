import { originFromHeaders } from "@/app/lib/site";

export function GET(request: Request) {
  const origin = originFromHeaders(request.headers);
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
