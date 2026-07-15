import type { Metadata, Viewport } from "next";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";
import { requestOrigin, SITE_NAME } from "./lib/site";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(await requestOrigin()),
    title: SITE_NAME,
    description: "Evidence-dated, Egypt-first fit checks for PC and laptop setup accessories.",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  };
}

export const viewport: Viewport = { themeColor: "#101411", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
