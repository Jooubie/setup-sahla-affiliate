import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const routes = [
  "/",
  "/products/",
  "/products/usb-c-hub/",
  "/products/laptop-stand/",
  "/products/laptop-cooling-pad/",
  "/products/desk-cable-management/",
  "/products/ergonomic-mouse/",
  "/guides/",
  "/guides/laptop-desk-setup-diagnostic/",
  "/guides/usb-c-hub-buying-guide-egypt/",
  "/guides/laptop-heat-screen-height-cable-management/",
  "/research/",
  "/about/",
  "/methodology/",
  "/disclosure/",
  "/privacy/",
];

const productRoutes = routes.filter((route) => route.startsWith("/products/") && route !== "/products/");
const guideRoutes = routes.filter((route) => route.startsWith("/guides/") && route !== "/guides/");
const retailerPairs = new Map([
  ["/products/usb-c-hub/", ["https://www.amazon.eg/-/en/dp/B0BQLLB61B", "https://www.noon.com/egypt-en/anker-332-usb-c-hub-5-in-1-usb-c-connector-with-4k-hdmi-100w-power-charger-black-a8355h11/N70086896V/p/"]],
  ["/products/laptop-stand/", ["https://www.amazon.eg/-/en/dp/B08TLVKBMJ", "https://www.noon.com/egypt-en/laptop-stand-aluminum-alloy-adjustable-eye-level-ergonomic-height-laptop-riser-holder-compatible-for-macbook-pro-2021-air-chromebook-and-more-storage-bag-included/N53340883A/p/"]],
  ["/products/laptop-cooling-pad/", ["https://www.amazon.eg/-/en/dp/B0CP198X1G", "https://www.noon.com/egypt-en/f2069-rgb-light-10-clock-mode-cooling-pad-cool-for-laptop-low-noise-fan-cooler-with-cell-phone-holder/N70023962V/p/"]],
  ["/products/desk-cable-management/", ["https://www.amazon.eg/-/en/dp/B0DJH1W2N4", "https://www.noon.com/egypt-en/joyroom-cable-organiser-jr-zs368-magnetic-black-6-pcs/ZDB64AB2F8DE78C016649Z/p/?o=zdb64ab2f8de78c016649z-1"]],
  ["/products/ergonomic-mouse/", ["https://www.amazon.eg/-/en/dp/B09QWY7JYK", "https://www.noon.com/egypt-en/signature-m650-wireless-mouse-for-small-to-medium-sized-hands-silent-clicks-5-buttons-bluetooth-multi-device-compatibility-400-dpi-nominal-value-10m-range-black/N53285882A/p/"]],
]);
const retailerUrls = [...retailerPairs.values()].flat();
const legacyGuideRoutes = new Map([
  ["/guides/fix-laptop-desk-setup-egypt/", "/guides/laptop-desk-setup-diagnostic/"],
  ["/guides/choose-usb-c-hub-egypt/", "/guides/usb-c-hub-buying-guide-egypt/"],
  ["/guides/laptop-heat-posture-cable-fixes/", "/guides/laptop-heat-screen-height-cable-management/"],
]);

let workerPromise;
async function getWorker() {
  workerPromise ??= import(new URL("../dist/server/index.js", import.meta.url).href);
  return (await workerPromise).default;
}

async function render(pathname, options = {}) {
  const worker = await getWorker();
  const origin = options.origin ?? "http://localhost";
  const requestUrl = new URL(pathname, origin);
  const response = await worker.fetch(
    new Request(requestUrl, { headers: { accept: "text/html", host: requestUrl.host, "x-forwarded-proto": requestUrl.protocol.slice(0, -1), ...options.headers } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  return { response, html: await response.text() };
}

test("server-renders every required route with unique metadata and canonical URLs", async () => {
  const titles = new Set();
  for (const route of routes) {
    const { response, html } = await render(route);
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i, route);
    assert.match(html, /<html[^>]*lang="en"/i, route);
    assert.match(html, /<meta[^>]+name="description"[^>]+content="[^"]+"/i, route);
    assert.match(html, new RegExp(`<link[^>]+rel="canonical"[^>]+href="http://localhost${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "i"), route);
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
    assert.ok(title, `missing title: ${route}`);
    assert.ok(!titles.has(title), `duplicate title: ${title}`);
    titles.add(title);
    assert.match(html, /href="#main-content"[^>]*>Skip to content</i, route);
    assert.match(html, /<main[^>]+id="main-content"/i, route);
  }
});

test("commercial pages disclose direct-link status before any retailer CTA", async () => {
  for (const route of ["/products/", ...productRoutes]) {
    const { html } = await render(route);
    const disclosureIndex = html.indexOf("DIRECT_LINK — AFFILIATE ID REQUIRED");
    const retailerIndex = Math.min(
      ...[html.indexOf("amazon.eg"), html.indexOf("noon.com")].filter((index) => index >= 0),
    );
    assert.ok(disclosureIndex >= 0, `missing disclosure: ${route}`);
    assert.ok(retailerIndex > disclosureIndex, `retailer link precedes disclosure: ${route}`);
    assert.match(html, /recheck before buying/i, route);
  }
});

test("product pages render the decision gates, evidence and safe exact provider links", async () => {
  const allProductHtml = [];
  for (const route of productRoutes) {
    const { html } = await render(route);
    allProductHtml.push(html);
    for (const section of ["The problem", "Verdict", "Best for", "Skip if", "Compatibility gate", "Score breakdown", "Evidence (?:&|&amp;) sources", "Provider snapshot", "Generic visual"])
      assert.match(html, new RegExp(section, "i"), `${route}: ${section}`);
    assert.match(html, /target="_blank"/i, route);
    assert.match(html, /rel="nofollow noopener noreferrer"/i, route);
    assert.doesNotMatch(html, /rel="[^"]*sponsored/i, route);
    assert.match(html, /href="\/methodology\/"/i, `${route}: methodology link`);
    for (const expected of retailerPairs.get(route)) assert.ok(html.includes(expected.replaceAll("&", "&amp;")) || html.includes(expected), `${route}: ${expected}`);
    for (const [otherRoute, otherPair] of retailerPairs) {
      if (otherRoute === route) continue;
      for (const otherUrl of otherPair) assert.ok(!html.includes(otherUrl.replaceAll("&", "&amp;")) && !html.includes(otherUrl), `${route} leaks ${otherRoute} provider`);
    }
  }
  const combined = allProductHtml.join("\n");
  for (const url of retailerUrls) assert.ok(combined.includes(url.replaceAll("&", "&amp;")) || combined.includes(url), url);
  assert.match(combined, /conventional contoured mouse/i);
  assert.match(combined, /not a vertical mouse/i);
});

test("guides preserve long-form structure, visible FAQs, sources and safe Article schema", async () => {
  for (const route of guideRoutes) {
    const { html } = await render(route);
    assert.match(html, /<article/i, route);
    assert.ok((html.match(/<h2/g) ?? []).length >= 4, `too few sections: ${route}`);
    assert.match(html, /<h2[^>]*>FAQ<\/h2>/i, route);
    assert.match(html, /Evidence notes/i, route);
    assert.match(html, /"@type":"Article"/i, route);
    assert.match(html, /"@type":"FAQPage"/i, route);
    assert.match(html, /"@type":"BreadcrumbList"/i, route);
  }
});

test("controlled Markdown renders both source tables and Arabic direction semantics", async () => {
  for (const route of ["/guides/laptop-desk-setup-diagnostic/", "/guides/usb-c-hub-buying-guide-egypt/"]) {
    const { html } = await render(route);
    assert.match(html, /<div class="article-table-wrap"[^>]*><table>/i, route);
    assert.match(html, /<thead><tr><th scope="col">/i, route);
    assert.match(html, /<tbody><tr><td>/i, route);
  }
  const combined = (await Promise.all(guideRoutes.map(async (route) => (await render(route)).html))).join("\n");
  assert.match(combined, /<span lang="ar" dir="rtl">[^<]+<\/span>/u);
});

test("legacy guide URLs permanently redirect to one canonical published route", async () => {
  for (const [source, destination] of legacyGuideRoutes) {
    const { response } = await render(source);
    assert.equal(response.status, 308, source);
    assert.equal(new URL(response.headers.get("location"), "http://localhost").pathname, destination);
  }
});

test("request headers control canonical, social and structured-data origins", async () => {
  const route = "/guides/usb-c-hub-buying-guide-egypt/";
  const { html } = await render(route, {
    origin: "http://internal.invalid",
    headers: { "x-forwarded-host": "preview.sites.example:8443, internal.invalid", "x-forwarded-proto": "https, http" },
  });
  const origin = "https://preview.sites.example:8443";
  assert.match(html, new RegExp(`rel="canonical" href="${origin}${route}"`, "i"));
  assert.match(html, new RegExp(`property="og:url" content="${origin}${route}"`, "i"));
  assert.match(html, new RegExp(`property="og:image" content="${origin}/og\\.png"`, "i"));
  assert.ok(html.includes(`${origin}${route}`), "JSON-LD uses forwarded origin");
  assert.doesNotMatch(html, /internal\.invalid|setupsahla\.com/i);
});

test("structured data stays within the sourced safe set", async () => {
  for (const route of routes) {
    const { html } = await render(route);
    const structuredData = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]).join("\n");
    assert.doesNotMatch(structuredData, /aggregateRating|priceValidUntil|priceCurrency|availability|"offers"/i, route);
  }
  const { html: home } = await render("/");
  assert.match(home, /"@type":"Organization"/i);
  assert.match(home, /"@type":"WebSite"/i);
  const { html: products } = await render("/products/");
  const { html: guides } = await render("/guides/");
  assert.match(products, /"@type":"ItemList"/i);
  assert.match(guides, /"@type":"ItemList"/i);
});

test("publication avoids unsupported commercial and outcome claims", async () => {
  const html = (await Promise.all(routes.map(async (route) => (await render(route)).html))).join("\n");
  assert.doesNotMatch(html, /best[- ]selling|guaranteed results|guaranteed commission|we earn a commission|drops temperature by|cures? pain|prevents? carpal tunnel/i);
  assert.doesNotMatch(html, /â|Ã|Â/u, "rendered copy contains mojibake");
  assert.doesNotMatch(html, /C:\\Users|C:\/Users/i, "rendered output leaks a local build path");
  assert.doesNotMatch(html, /_vinext\/image/i, "local WebP assets should render without a runtime optimizer");
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton|SkeletonPreview/i);
});

test("research page states the qualitative keyword record count precisely", async () => {
  const { html } = await render("/research/");
  assert.match(html, /48<\/strong><span>qualitative keyword records across eight routes<\/span>/i);
  assert.doesNotMatch(html, /48<\/strong><span>qualitative keyword routes<\/span>/i);
});

test("all rendered external links are explicit and legacy guide paths are absent", async () => {
  for (const route of routes) {
    const { html } = await render(route);
    for (const match of html.matchAll(/<a\s+([^>]*href="https?:\/\/[^>]+)>/gi)) {
      assert.match(match[1], /target="_blank"/i, `${route}: external link must open explicitly`);
      assert.match(match[1], /rel="nofollow noopener noreferrer"/i, `${route}: external link must carry safe relation values`);
    }
    assert.doesNotMatch(html, /href="\/guides\/(?:fix-laptop-desk-setup-egypt|choose-usb-c-hub-egypt|laptop-heat-posture-cable-fixes)\/?"/i, route);
  }
});

test("product data keeps exact direct-link state and provider pairings", async () => {
  const products = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"));
  for (const product of products) {
    const expected = retailerPairs.get(product.route);
    assert.ok(expected, product.route);
    assert.deepEqual(product.providers.map((provider) => provider.directUrl), expected, product.route);
    for (const provider of product.providers) {
      assert.equal(provider.affiliateUrl, null, `${product.route}: affiliateUrl`);
      assert.equal(provider.affiliateStatus, "DIRECT_LINK — AFFILIATE ID REQUIRED", `${product.route}: affiliateStatus`);
    }
  }
});

test("unknown routes use the branded 404 and discovery routes use the request origin", async () => {
  const missing = await render("/nothing-is-plugged-in-here/");
  assert.equal(missing.response.status, 404);
  assert.match(missing.html, /Page unplugged/i);
  assert.match(missing.html, /Setup Sahla/i);

  const headers = { "x-forwarded-host": "workspace.example", "x-forwarded-proto": "https" };
  const sitemap = await render("/sitemap.xml", { origin: "http://internal.invalid", headers });
  assert.equal(sitemap.response.status, 200);
  assert.match(sitemap.response.headers.get("content-type") ?? "", /xml/i);
  assert.match(sitemap.html, /https:\/\/workspace\.example\/products\/usb-c-hub\//i);
  assert.doesNotMatch(sitemap.html, /internal\.invalid|setupsahla\.com/i);

  const robots = await render("/robots.txt", { origin: "http://internal.invalid", headers });
  assert.equal(robots.response.status, 200);
  assert.match(robots.html, /Sitemap: https:\/\/workspace\.example\/sitemap\.xml/i);
});

test("focus, touch targets, unoptimized images and removed artifacts stay hardened", async () => {
  const [css, nextConfig, packageJson, packageLock, sitesPlugin] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../package-lock.json", import.meta.url), "utf8"),
    readFile(new URL("../build/sites-vite-plugin.ts", import.meta.url), "utf8"),
  ]);
  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--ink\)[^}]*box-shadow:\s*0 0 0 6px var\(--cyan\)/s);
  assert.match(css, /\.site-footer__grid a\s*\{[^}]*min-height:\s*44px/s);
  assert.match(nextConfig, /images:\s*\{\s*unoptimized:\s*true\s*\}/s);
  assert.doesNotMatch(packageJson, /drizzle/);
  assert.doesNotMatch(packageLock, /drizzle/);
  assert.doesNotMatch(sitesPlugin, /drizzle/);
  for (const relative of ["../public/file.svg", "../public/globe.svg", "../public/window.svg", "../db", "../drizzle", "../examples/d1", "../drizzle.config.ts", "../app/chatgpt-auth.ts"])
    await assert.rejects(access(new URL(relative, import.meta.url)), relative);
});

test("starter preview and dependency are removed while Sites hosting remains intact", async () => {
  const [packageJson, viteConfig, hosting] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../vite.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(viteConfig, /sites\(\)/);
  assert.deepEqual(JSON.parse(hosting), { d1: null, r2: null });
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
