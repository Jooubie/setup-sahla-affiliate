import type { Metadata } from "next";
import { DirectLinkDisclosure } from "@/app/components/Disclosure";
import { PageIntro } from "@/app/components/PageIntro";
import { routeMetadata } from "@/app/lib/site";

export const metadata: Metadata = routeMetadata("Retail link and editorial disclosure", "Setup Sahla's current direct-link status, affiliate activation gates and editorial independence rules.", "/disclosure/");

export default function DisclosurePage() {
  return (
    <div className="page-shell info-page">
      <PageIntro eyebrow="Commercial transparency" title="The links are direct. The gate is not hidden." description="Setup Sahla's launch pages compare exact retailer listings, but the current links are not verified affiliate links." />
      <DirectLinkDisclosure />
      <section className="info-grid">
        <div><p className="eyebrow">Amazon Egypt</p><h2>Activation required</h2><p>The owner must complete Amazon Egypt Associates enrollment, create tagged special links and verify final destinations before affiliate status is enabled on this site.</p></div>
        <div><p className="eyebrow">Noon Egypt</p><h2>Territory unconfirmed</h2><p>The public Noon affiliate terms reviewed for launch name UAE and KSA territory; they do not establish Egypt eligibility. Noon Egypt remains a provider comparison link until owner-side confirmation exists.</p></div>
      </section>
      <section className="section-block"><h2>Editorial rules</h2><ul className="large-list"><li>Commercial relationships do not change compatibility gates, risks or skip-if advice.</li><li>Retailer product content is not copied into public creative assets.</li><li>Original category visuals are labeled and never presented as model photography.</li><li>Dated listing observations are not live price, stock, seller or return promises.</li></ul></section>
    </div>
  );
}
