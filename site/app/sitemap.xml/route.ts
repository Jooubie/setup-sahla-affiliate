import { guides } from "@/app/lib/guides";
import { products } from "@/app/lib/products";
import { originFromHeaders } from "@/app/lib/site";

const staticRoutes = ["/", "/products/", "/guides/", "/research/", "/about/", "/methodology/", "/disclosure/", "/privacy/"];

export function GET(request: Request) {
  const origin = originFromHeaders(request.headers);
  const routes = [...staticRoutes, ...products.map((product) => product.route), ...guides.map((guide) => guide.route)];
  const entries = routes.map((route) => `<url><loc>${origin}${route}</loc><lastmod>2026-07-15</lastmod></url>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`, {
    headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
