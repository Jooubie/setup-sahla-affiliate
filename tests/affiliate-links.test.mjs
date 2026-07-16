import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { AffiliateLinkStore } from '../scripts/affiliate-link-store.mjs';
import { resolveProducts } from '../scripts/resolve-site-products.mjs';

function tempStore() {
  const root = mkdtempSync(path.join(tmpdir(), 'affiliate-links-'));
  mkdirSync(path.join(root, '.vault'), { recursive: true });
  return {
    root,
    store: new AffiliateLinkStore({ root, clock: () => '2026-07-16T12:00:00.000Z' }),
  };
}

test('affiliate link store keeps pending and verified links in the private vault file', () => {
  const { root, store } = tempStore();
  store.set({ productKey: 'PP-C01', retailer: 'Amazon Egypt', url: 'https://www.amazon.eg/dp/EXAMPLE?ref=verified-test', status: 'pending' });
  assert.equal(store.get('PP-C01', 'Amazon Egypt').status, 'pending');
  assert.equal(store.get('PP-C01', 'Amazon Egypt').verifiedAt, null);

  store.set({ productKey: 'PP-C01', retailer: 'Amazon Egypt', url: 'https://www.amazon.eg/dp/EXAMPLE?ref=verified-test', status: 'verified' });
  assert.equal(store.get('PP-C01', 'Amazon Egypt').status, 'verified');
  assert.equal(store.get('PP-C01', 'Amazon Egypt').verifiedAt, '2026-07-16T12:00:00.000Z');
  rmSync(root, { recursive: true, force: true });
});

test('affiliate link store rejects unsafe URLs and unknown statuses', () => {
  const { root, store } = tempStore();
  assert.throws(() => store.set({ productKey: 'PP-C01', retailer: 'Amazon Egypt', url: 'javascript:alert(1)', status: 'pending' }), /HTTPS/);
  assert.throws(() => store.set({ productKey: 'PP-C01', retailer: 'Amazon Egypt', url: 'https://www.noon.com/egypt-en/wrong-retailer', status: 'pending' }), /retailer host/);
  assert.throws(() => store.set({ productKey: 'PP-C01', retailer: 'Amazon Egypt', url: 'https://example.com/link', status: 'live' }), /status/);
  rmSync(root, { recursive: true, force: true });
});

test('site product resolver publishes only owner-verified affiliate links', () => {
  const products = [{
    candidateId: 'PP-C01',
    providers: [{
      retailer: 'Amazon Egypt',
      directUrl: 'https://www.amazon.eg/dp/EXAMPLE',
      affiliateUrl: null,
      affiliateStatus: 'DIRECT_LINK — AFFILIATE ID REQUIRED',
    }],
  }];
  const pending = { 'PP-C01': { 'Amazon Egypt': { url: 'https://www.amazon.eg/dp/EXAMPLE?ref=verified-test', status: 'pending' } } };
  assert.equal(resolveProducts(products, pending)[0].providers[0].affiliateUrl, null);

  const verified = { 'PP-C01': { 'Amazon Egypt': { url: 'https://www.amazon.eg/dp/EXAMPLE?ref=verified-test', status: 'verified' } } };
  const resolved = resolveProducts(products, verified);
  assert.equal(resolved[0].providers[0].affiliateUrl, 'https://www.amazon.eg/dp/EXAMPLE?ref=verified-test');
  assert.equal(resolved[0].providers[0].affiliateStatus, 'AFFILIATE_LINK — VERIFIED');
});
