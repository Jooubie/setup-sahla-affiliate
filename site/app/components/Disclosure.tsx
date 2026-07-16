import { DIRECT_LINK_STATUS } from "@/app/lib/site";

const VERIFIED_AFFILIATE_STATUS = "AFFILIATE_LINK — VERIFIED";

export function DirectLinkDisclosure({ compact = false, hasAffiliate = false }: { compact?: boolean; hasAffiliate?: boolean }) {
  return (
    <aside className={`disclosure-note${compact ? " disclosure-note--compact" : ""}`} aria-label="Retail link disclosure">
      <span className="eyebrow">Link status</span>
      <strong>{hasAffiliate ? VERIFIED_AFFILIATE_STATUS : DIRECT_LINK_STATUS}</strong>
      {hasAffiliate ? (
        <p>
          A retailer button on this page uses an owner-verified affiliate link. Setup Sahla may earn a commission if you buy,
          at no added cost to you. Price, stock, seller, fulfillment and returns can still change—recheck before buying.
        </p>
      ) : (
        <p>
          Retailer buttons currently open exact product pages directly. Setup Sahla does not claim a commission on these links.
          Amazon Egypt needs an approved owner tag; Noon Egypt affiliate eligibility is not yet confirmed.
          Prices, stock, seller, fulfillment and returns are dated observations—recheck before buying.
        </p>
      )}
    </aside>
  );
}
