import type { Metadata } from "next";
import { PageIntro } from "@/app/components/PageIntro";
import { routeMetadata } from "@/app/lib/site";

export const metadata: Metadata = routeMetadata("Privacy notice", "The launch privacy notice for the Setup Sahla editorial website.", "/privacy/");

export default function PrivacyPage() {
  return (
    <div className="page-shell info-page">
      <PageIntro eyebrow="Effective 15 July 2026" title="Privacy, in plain language." description="This launch publication has no reader accounts, checkout, newsletter form or embedded retailer widgets." />
      <section className="privacy-sections">
        <div><h2>What this site collects</h2><p>Setup Sahla does not ask for your name, email address, payment information or account credentials on the current launch site. Hosting infrastructure may process ordinary request information such as IP address, browser details, requested page and security logs.</p></div>
        <div><h2>Retailer and source links</h2><p>External links open third-party sites in a new tab. Amazon, Noon, manufacturers and other sources apply their own privacy and cookie practices after you leave Setup Sahla.</p></div>
        <div><h2>Cookies and analytics</h2><p>No first-party analytics or advertising cookies are intentionally installed in this launch build. If analytics or a consent-managed service is added later, this notice must be updated before activation.</p></div>
        <div><h2>Retention and changes</h2><p>Infrastructure logs, if produced by the hosting provider, follow that provider’s operational retention controls. Material privacy changes will be dated on this page.</p></div>
        <div><h2>Contact readiness</h2><p>A public privacy-contact channel has not yet been supplied by the owner. It must be added before any contact form, newsletter or account feature is activated.</p></div>
      </section>
    </div>
  );
}
