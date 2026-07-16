import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DEFAULT_ROOT = fileURLToPath(new URL('../', import.meta.url));
const DEFAULT_FILE = '.vault/affiliate-links.local.json';
const LINK_STATUS = ['pending', 'verified'];
const PRODUCT_KEY_RE = /^(?:PP-C\d{2,}|IN-\d{4}-\d{4})$/;
const RETAILER_HOSTS = {
  'Amazon Egypt': ['amazon.eg', 'amzn.to'],
  'Noon Egypt': ['noon.com'],
};

function emptyRegistry() {
  return { version: 1, links: {} };
}

function validateHttpsUrl(value, retailer) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('affiliate link must be a valid HTTPS URL');
  }
  if (url.protocol !== 'https:') throw new Error('affiliate link must be a valid HTTPS URL');
  const allowed = RETAILER_HOSTS[retailer];
  if (!allowed) throw new Error(`affiliate link retailer is unsupported: ${retailer}`);
  const matchesRetailer = allowed.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
  if (!matchesRetailer) throw new Error(`affiliate link must use an approved ${retailer} retailer host`);
  return url.toString();
}

export class AffiliateLinkStore {
  constructor({ root = DEFAULT_ROOT, file = DEFAULT_FILE, clock } = {}) {
    this.root = root;
    this.file = path.join(root, file);
    this.clock = clock || (() => new Date().toISOString());
  }

  _all() {
    if (!existsSync(this.file)) return emptyRegistry();
    const value = JSON.parse(readFileSync(this.file, 'utf8'));
    if (!value || value.version !== 1 || typeof value.links !== 'object') throw new Error('affiliate link registry is invalid');
    return value;
  }

  _save(registry) {
    mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.tmp`;
    writeFileSync(tmp, JSON.stringify(registry, null, 2) + '\n', { mode: 0o600 });
    renameSync(tmp, this.file);
  }

  list() {
    return this._all().links;
  }

  get(productKey, retailer) {
    return this._all().links[productKey]?.[retailer] || null;
  }

  set({ productKey, retailer, url, status = 'pending' }) {
    if (!PRODUCT_KEY_RE.test(productKey || '')) throw new Error('affiliate link product key is invalid');
    if (typeof retailer !== 'string' || !retailer.trim()) throw new Error('affiliate link retailer is required');
    if (!LINK_STATUS.includes(status)) throw new Error(`affiliate link status must be ${LINK_STATUS.join('|')}`);
    const normalizedRetailer = retailer.trim();
    const safeUrl = validateHttpsUrl(url, normalizedRetailer);
    const registry = this._all();
    registry.links[productKey] ||= {};
    registry.links[productKey][normalizedRetailer] = {
      url: safeUrl,
      status,
      updatedAt: this.clock(),
      verifiedAt: status === 'verified' ? this.clock() : null,
    };
    this._save(registry);
    return registry.links[productKey][normalizedRetailer];
  }

  remove(productKey, retailer) {
    const registry = this._all();
    if (!registry.links[productKey]?.[retailer]) return false;
    delete registry.links[productKey][retailer];
    if (!Object.keys(registry.links[productKey]).length) delete registry.links[productKey];
    this._save(registry);
    return true;
  }

  removeProduct(productKey) {
    const registry = this._all();
    if (!registry.links[productKey]) return false;
    delete registry.links[productKey];
    this._save(registry);
    return true;
  }
}

export { DEFAULT_FILE as AFFILIATE_LINK_FILE, LINK_STATUS as AFFILIATE_LINK_STATUS };
