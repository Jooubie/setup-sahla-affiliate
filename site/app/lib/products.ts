import rawProducts from "@/data/products.runtime.json";

export type Provider = {
  retailer: "Amazon Egypt" | "Noon Egypt";
  directUrl: string;
  affiliateUrl: string | null;
  affiliateStatus: string;
  listingTitle: string;
  sellerNotes: string;
  priceEgp: number;
  capturedAt: string;
  imageSourceUrl: string;
  imageRights: string;
};

export type Evidence = {
  evidenceId: string;
  claim: string;
  sourceUrl: string;
  capturedAt: string;
};

export type Product = {
  candidateId: string;
  slug: string;
  route: string;
  name: string;
  category: string;
  problem: string;
  verdict: string;
  bestFor: string[];
  skipIf: string[];
  brand: string;
  model: string;
  compatibility: string[];
  snapshotPriceEgp: number;
  priceCapturedAt: string;
  primaryKeyword: {
    evidenceId: string;
    keyword: string;
    intent: string;
    market: string;
    metricName: string;
    metricValue: string;
    metricUnit: string;
    sourceUrl: string;
    capturedAt: string;
  };
  supportingKeywords: string[];
  score: {
    components: Record<string, number>;
    total: number;
  };
  providers: Provider[];
  evidence: Evidence[];
  risks: string[];
  closestRejectedAlternative: string;
};

export const products = rawProducts as Product[];

export const productImages: Record<string, { src: string; alt: string }> = {
  "/products/usb-c-hub/": {
    src: "/images/category-usb-c-hub.webp",
    alt: "Generic illustrated USB-C hub connection map in Setup Sahla colors",
  },
  "/products/laptop-stand/": {
    src: "/images/category-laptop-stand.webp",
    alt: "Generic illustrated laptop elevation and keyboard reach check",
  },
  "/products/laptop-cooling-pad/": {
    src: "/images/category-cooling-pad.webp",
    alt: "Generic illustrated laptop airflow-space check",
  },
  "/products/desk-cable-management/": {
    src: "/images/category-cable-management.webp",
    alt: "Generic illustrated desk-edge cable route",
  },
  "/products/ergonomic-mouse/": {
    src: "/images/category-quiet-mouse.webp",
    alt: "Generic illustrated mouse fit and hand-size check",
  },
};

export const productGuideLinks: Record<string, { href: string; label: string }[]> = {
  "/products/usb-c-hub/": [
    { href: "/guides/usb-c-hub-buying-guide-egypt/", label: "Map the ports before you buy" },
    { href: "/guides/laptop-desk-setup-diagnostic/", label: "Run the full desk diagnostic" },
    { href: "/methodology/", label: "See how the launch set was scored" },
  ],
  "/products/laptop-stand/": [
    { href: "/guides/laptop-heat-screen-height-cable-management/", label: "Separate screen height from airflow" },
    { href: "/guides/laptop-desk-setup-diagnostic/", label: "Run the full desk diagnostic" },
    { href: "/methodology/", label: "See how the launch set was scored" },
  ],
  "/products/laptop-cooling-pad/": [
    { href: "/guides/laptop-heat-screen-height-cable-management/", label: "Use the three-fix workflow" },
    { href: "/guides/laptop-desk-setup-diagnostic/", label: "Run the full desk diagnostic" },
    { href: "/methodology/", label: "See how the launch set was scored" },
  ],
  "/products/desk-cable-management/": [
    { href: "/guides/laptop-heat-screen-height-cable-management/", label: "Route cables last" },
    { href: "/guides/laptop-desk-setup-diagnostic/", label: "Run the full desk diagnostic" },
    { href: "/methodology/", label: "See how the launch set was scored" },
  ],
  "/products/ergonomic-mouse/": [
    { href: "/guides/laptop-desk-setup-diagnostic/", label: "Check pointer fit in context" },
    { href: "/methodology/", label: "See how the launch set was scored" },
  ],
};

export function getProduct(route: string) {
  const product = products.find((entry) => entry.route === route);
  if (!product) throw new Error(`Missing product for ${route}`);
  return product;
}
