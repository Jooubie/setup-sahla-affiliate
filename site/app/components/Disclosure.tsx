import { DIRECT_LINK_STATUS } from "@/app/lib/site";

export function DirectLinkDisclosure({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={`disclosure-note${compact ? " disclosure-note--compact" : ""}`} aria-label="Retail link disclosure">
      <span className="eyebrow">Link status</span>
      <strong>{DIRECT_LINK_STATUS}</strong>
      <p>
        Retailer buttons currently open exact product pages directly. Setup Sahla does not claim a commission on these links.
        Amazon Egypt needs an approved owner tag; Noon Egypt affiliate eligibility is not yet confirmed.
        Prices, stock, seller, fulfillment and returns are dated observations—recheck before buying.
      </p>
    </aside>
  );
}
