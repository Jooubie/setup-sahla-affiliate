import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/app/components/PageIntro";
import { routeMetadata } from "@/app/lib/site";

export const metadata: Metadata = routeMetadata("About Setup Sahla", "Why Setup Sahla publishes problem-first, Egypt-focused PC and laptop setup guidance.", "/about/");

export default function AboutPage() {
  return (
    <div className="page-shell info-page">
      <PageIntro eyebrow="About Setup Sahla" title="Useful desks beat fantasy desks." description="Setup Sahla is an Egypt-first editorial project for people who want to remove one repeated PC or laptop setup friction without replacing working gear." />
      <section className="info-grid">
        <div><p className="eyebrow">Our promise</p><h2>Fix the friction. Keep the gear.</h2><p>We start with a named job: add a port, raise a screen, create airflow space, keep a cable within reach or find a pointer shape that fits. An accessory enters only after a compatibility gate.</p></div>
        <div><p className="eyebrow">Our market</p><h2>Egypt first, MENA-aware.</h2><p>Provider observations come from Egypt storefronts. We do not stretch Egypt-localized evidence into a MENA-wide demand claim. Arabic query language may inform future coverage when the evidence is strong enough.</p></div>
      </section>
      <section className="manifesto"><blockquote>“A product is useful only when the reader can explain the problem it solves, the device it fits and the reason to skip it.”</blockquote></section>
      <div className="button-row"><Link href="/guides/laptop-desk-setup-diagnostic/" className="button button--signal">Start with the diagnostic</Link><Link href="/research/" className="button button--ink">Inspect the research</Link></div>
    </div>
  );
}
