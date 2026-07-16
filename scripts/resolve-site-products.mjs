import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { AffiliateLinkStore } from './affiliate-link-store.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const DIRECT_STATUS = 'DIRECT_LINK — AFFILIATE ID REQUIRED';
const VERIFIED_STATUS = 'AFFILIATE_LINK — VERIFIED';

export function resolveProducts(products, links = {}) {
  return products.map((product) => ({
    ...product,
    providers: product.providers.map((provider) => {
      const privateLink = links[product.candidateId]?.[provider.retailer];
      if (privateLink?.status !== 'verified') {
        return { ...provider, affiliateUrl: null, affiliateStatus: DIRECT_STATUS };
      }
      return { ...provider, affiliateUrl: privateLink.url, affiliateStatus: VERIFIED_STATUS };
    }),
  }));
}

export function writeResolvedProducts({
  root = ROOT,
  source = 'data/products.json',
  output = 'site/data/products.runtime.json',
  linkStore = new AffiliateLinkStore({ root }),
} = {}) {
  const products = JSON.parse(readFileSync(path.join(root, source), 'utf8'));
  const resolved = resolveProducts(products, linkStore.list());
  writeFileSync(path.join(root, output), JSON.stringify(resolved, null, 2) + '\n');
  return resolved;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const resolved = writeResolvedProducts();
  const verifiedCount = resolved.flatMap((product) => product.providers).filter((provider) => provider.affiliateStatus === VERIFIED_STATUS).length;
  console.log(`site data: ${resolved.length} published product(s), ${verifiedCount} verified affiliate link(s)`);
}
