import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { AffiliateLinkStore } from '../scripts/affiliate-link-store.mjs';
import { createAdminServer } from '../scripts/intake-admin-server.mjs';
import { FileIntakeSource } from '../scripts/intake-source.mjs';

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'intake-admin-'));
  mkdirSync(path.join(root, 'data'), { recursive: true });
  mkdirSync(path.join(root, '.superpowers', 'sdd'), { recursive: true });
  const intake = [{
    intakeId: 'IN-2026-0001',
    name: 'Candidate Hub',
    category: 'Connectivity',
    problemHypothesis: 'Needs more ports.',
    providers: [{ retailer: 'Amazon Egypt', productUrl: 'https://www.amazon.eg/dp/CANDIDATE', affiliateKeyRef: 'amazonEgypt.candidate' }],
    priority: 'high',
    status: 'new',
    createdAt: '2026-07-16',
  }];
  const products = [{
    candidateId: 'PP-C01',
    name: 'Published Hub',
    category: 'Connectivity',
    route: '/products/usb-c-hub/',
    providers: [{ retailer: 'Amazon Egypt', directUrl: 'https://www.amazon.eg/dp/PUBLISHED', affiliateUrl: null, affiliateStatus: 'DIRECT_LINK — AFFILIATE ID REQUIRED' }],
  }];
  writeFileSync(path.join(root, 'data', 'product-intake.json'), JSON.stringify(intake));
  writeFileSync(path.join(root, 'data', 'products.json'), JSON.stringify(products));
  const source = new FileIntakeSource({ root, gateRunner: () => true });
  const links = new AffiliateLinkStore({ root, clock: () => '2026-07-16T12:00:00.000Z' });
  const server = createAdminServer({ source, links, root });
  return { root, server };
}

async function withServer(run) {
  const { root, server } = fixture();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`, root);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    rmSync(root, { recursive: true, force: true });
  }
}

test('catalog endpoint combines published products and future intake items', async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/catalog`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const body = await response.json();
    assert.equal(body.summary.published, 1);
    assert.equal(body.summary.pipeline, 1);
    assert.deepEqual(body.items.map((item) => [item.key, item.status]), [
      ['PP-C01', 'published'],
      ['IN-2026-0001', 'new'],
    ]);
  });
});

test('admin API adds a future product with multiple retailers and an image reference', async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/intake`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Future Keyboard',
        category: 'Input devices',
        problemHypothesis: 'A compact desk needs a smaller keyboard.',
        priority: 'medium',
        providers: [
          { retailer: 'Amazon Egypt', productUrl: 'https://www.amazon.eg/dp/KEYBOARD', affiliateKeyRef: 'amazonEgypt.future-keyboard' },
          { retailer: 'Noon Egypt', productUrl: 'https://www.noon.com/egypt-en/future-keyboard/N1/p/', affiliateKeyRef: 'noonEgypt.future-keyboard' },
        ],
        images: [{ kind: 'reference', sourceUrl: 'https://example.com/keyboard.jpg', imageRights: 'SOURCE_LINK_ONLY' }],
      }),
    });
    assert.equal(response.status, 201);
    const item = (await response.json()).item;
    assert.equal(item.providers.length, 2);
    assert.equal(item.images.length, 1);
  });
});

test('admin API rejects oversized request bodies', async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/intake`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'x'.repeat(70_000) }),
    });
    assert.equal(response.status, 413);
  });
});

test('dashboard renders safe catalog controls without innerHTML injection', async () => {
  await withServer(async (origin) => {
    const response = await fetch(origin);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /All products/i);
    assert.match(html, /Affiliate link/i);
    assert.match(html, /Edit product/i);
    assert.match(html, /button\('Reject'/);
    assert.doesNotMatch(html, /id="productStatus"/);
    assert.doesNotMatch(html, /rows\.innerHTML/);
  });
});

test('admin API edits an intake product without changing its workflow status', async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/intake/IN-2026-0001`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Edited Candidate', category: 'Desk connectivity', priority: 'medium' }),
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.item.name, 'Edited Candidate');
    assert.equal(body.item.status, 'new');
    const catalog = await (await fetch(`${origin}/api/catalog`)).json();
    assert.equal(catalog.items.find((item) => item.key === 'IN-2026-0001').name, 'Edited Candidate');
  });
});

test('admin API lets the owner place a pipeline product on hold', async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/intake/IN-2026-0001/status`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'on-hold' }),
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).item.status, 'on-hold');
  });
});

test('admin API stores a per-product affiliate link privately with pending verification', async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/affiliate-link`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        productKey: 'PP-C01',
        retailer: 'Amazon Egypt',
        url: 'https://www.amazon.eg/dp/PUBLISHED?ref=pending-test',
        status: 'pending',
      }),
    });
    assert.equal(response.status, 200);
    const catalog = await (await fetch(`${origin}/api/catalog`)).json();
    const link = catalog.items.find((item) => item.key === 'PP-C01').affiliateLinks['Amazon Egypt'];
    assert.equal(link.status, 'pending');
    assert.match(link.url, /ref=pending-test/);
  });
});

test('admin API rejects an affiliate retailer that is not configured for the product', async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/affiliate-link`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        productKey: 'PP-C01',
        retailer: 'Noon Egypt',
        url: 'https://www.noon.com/egypt-en/not-configured/N1/p/',
        status: 'pending',
      }),
    });
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /not configured/);
  });
});

test('admin API removes a saved affiliate link without removing the product', async () => {
  await withServer(async (origin) => {
    await fetch(`${origin}/api/affiliate-link`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        productKey: 'PP-C01',
        retailer: 'Amazon Egypt',
        url: 'https://www.amazon.eg/dp/PUBLISHED?ref=pending-test',
        status: 'pending',
      }),
    });
    const response = await fetch(`${origin}/api/affiliate-link?productKey=PP-C01&retailer=${encodeURIComponent('Amazon Egypt')}`, { method: 'DELETE' });
    assert.equal(response.status, 200);
    const catalog = await (await fetch(`${origin}/api/catalog`)).json();
    assert.deepEqual(catalog.items.find((item) => item.key === 'PP-C01').affiliateLinks, {});
  });
});

test('removing a pipeline product clears its private links and never reuses its intake ID', async () => {
  await withServer(async (origin, root) => {
    await fetch(`${origin}/api/affiliate-link`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        productKey: 'IN-2026-0001',
        retailer: 'Amazon Egypt',
        url: 'https://www.amazon.eg/dp/CANDIDATE?ref=private-test',
        status: 'verified',
      }),
    });
    assert.equal((await fetch(`${origin}/api/intake/IN-2026-0001`, { method: 'DELETE' })).status, 200);

    const response = await fetch(`${origin}/api/intake`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Replacement Candidate',
        category: 'Connectivity',
        problemHypothesis: 'Needs a replacement test record.',
        priority: 'medium',
        providers: [{
          retailer: 'Amazon Egypt',
          productUrl: 'https://www.amazon.eg/dp/REPLACEMENT',
          affiliateKeyRef: 'amazonEgypt.replacement',
        }],
      }),
    });
    const item = (await response.json()).item;
    assert.equal(item.intakeId, 'IN-2026-0002');
    const registry = JSON.parse(readFileSync(path.join(root, '.vault', 'affiliate-links.local.json'), 'utf8'));
    assert.equal(registry.links['IN-2026-0001'], undefined);
  });
});
