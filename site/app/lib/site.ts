import type { Metadata } from "next";
import { headers } from "next/headers";

export const SITE_NAME = "Setup Sahla";
export const DIRECT_LINK_STATUS = "DIRECT_LINK — AFFILIATE ID REQUIRED";

function firstForwarded(value: string | null) {
  return value?.split(",", 1)[0]?.trim() || null;
}

export function originFromHeaders(headerBag: Pick<Headers, "get">) {
  const host = firstForwarded(headerBag.get("x-forwarded-host")) ?? firstForwarded(headerBag.get("host"));
  if (!host || !/^(?:\[[0-9a-f:.]+\]|[a-z0-9.-]+)(?::\d{1,5})?$/i.test(host)) {
    throw new Error("A valid request host is required to build absolute publication URLs.");
  }
  const requestedProtocol = firstForwarded(headerBag.get("x-forwarded-proto"))?.toLowerCase();
  const localHost = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host);
  const protocol = requestedProtocol === "http" || requestedProtocol === "https"
    ? requestedProtocol
    : localHost ? "http" : "https";
  return new URL(`${protocol}://${host}`).origin;
}

export async function requestOrigin() {
  return originFromHeaders(await headers());
}

export function routeMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: path,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "Setup Sahla — Fix the friction. Keep the gear." }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function formatEgp(value: number) {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export const guideRouteAliases: Record<string, string> = {
  "/guides/fix-laptop-desk-setup-egypt/": "/guides/laptop-desk-setup-diagnostic/",
  "/guides/choose-usb-c-hub-egypt/": "/guides/usb-c-hub-buying-guide-egypt/",
  "/guides/laptop-heat-posture-cable-fixes/": "/guides/laptop-heat-screen-height-cable-management/",
};

export function safeJson(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
