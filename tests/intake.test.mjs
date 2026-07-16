import assert from 'node:assert/strict';
import { test } from 'node:test';
import { copyFileSync, mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { validateIntakeItem, validateIntakeArray } from '../scripts/validate_intake.mjs';
import { FileIntakeSource } from '../scripts/intake-source.mjs';
import { nextIntakeId } from '../scripts/intake-admin-server.mjs';
import { SIGNAL_FILES, INTAKE_FILE } from '../scripts/intake-constants.mjs';

const validItem = () => ({
  intakeId: 'IN-2026-0001',
  name: 'Test Hub',
  category: 'Ports and connectivity',
  problemHypothesis: 'test',
  providers: [{ retailer: 'Amazon Egypt', productUrl: 'https://www.amazon.eg/dp/X', affiliateKeyRef: 'amazonEgypt.test' }],
  priority: 'high',
  status: 'new',
  createdAt: '2026-07-15',
});

// ---- A1/A2: validation ------------------------------------------------------
test('valid item passes', () => {
  assert.deepEqual(validateIntakeItem(validItem()), []);
});

test('the shipped intake queue is valid', () => {
  const items = JSON.parse(readFileSync(new URL('../' + INTAKE_FILE, import.meta.url), 'utf8'));
  assert.deepEqual(validateIntakeArray(items), []);
});

test('affiliateKeyRef containing a URL is rejected', () => {
  const bad = validItem();
  bad.providers[0].affiliateKeyRef = 'https://amazon.eg/dp/X'; // a URL where a vault key belongs
  const errors = validateIntakeItem(bad);
  assert.ok(errors.some((e) => /affiliateKeyRef/.test(e)), 'should flag URL in affiliateKeyRef');
});

test('bad status and missing name are rejected', () => {
  const bad = { ...validItem(), status: 'live', name: '' };
  const errors = validateIntakeItem(bad);
  assert.ok(errors.some((e) => /status/.test(e)));
  assert.ok(errors.some((e) => /name/.test(e)));
});

test('duplicate intakeId is rejected at array level', () => {
  const errors = validateIntakeArray([validItem(), validItem()]);
  assert.ok(errors.some((e) => /duplicate/.test(e)));
});

// ---- A3: FileIntakeSource lifecycle ----------------------------------------
function tempSource(extra = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'intake-'));
  mkdirSync(path.join(root, 'data'), { recursive: true });
  writeFileSync(path.join(root, INTAKE_FILE), JSON.stringify([validItem()], null, 2));
  mkdirSync(path.join(root, '.superpowers', 'sdd'), { recursive: true });
  return { root, src: new FileIntakeSource({ root, validationRunner: () => true, sealRunner: () => true, ...extra }) };
}

test('dispatch moves new -> dispatched and requests all delegations', async () => {
  const { root, src } = tempSource();
  const it = await src.dispatch('IN-2026-0001');
  assert.equal(it.status, 'dispatched');
  assert.deepEqual(it.delegations, { research: 'requested', creative: 'requested', marketing: 'requested' });
  rmSync(root, { recursive: true, force: true });
});

test('reconcile folds agent signals and advances to ready when all settled', async () => {
  const { root, src } = tempSource();
  await src.dispatch('IN-2026-0001');
  // each agent signals in its own-lane file
  for (const [agent, rel] of Object.entries(SIGNAL_FILES)) {
    const p = path.join(root, rel);
    mkdirSync(path.dirname(p), { recursive: true });
    writeFileSync(p, JSON.stringify({ 'IN-2026-0001': 'done' }));
  }
  const [it] = await src.reconcile('IN-2026-0001');
  assert.equal(it.status, 'ready');
  rmSync(root, { recursive: true, force: true });
});

test('reconcile does not rewrite the queue when no signal changed', async () => {
  const { root, src } = tempSource();
  await src.dispatch('IN-2026-0001');
  let saves = 0;
  const save = src._save.bind(src);
  src._save = (items) => {
    saves += 1;
    return save(items);
  };
  await src.reconcile('IN-2026-0001');
  assert.equal(saves, 0, 'a no-op reconcile must not trigger the watcher again');
  rmSync(root, { recursive: true, force: true });
});

test('reconcile places an item on hold when an agent lane is skipped', async () => {
  const { root, src } = tempSource();
  await src.dispatch('IN-2026-0001');
  for (const [agent, rel] of Object.entries(SIGNAL_FILES)) {
    const signalPath = path.join(root, rel);
    mkdirSync(path.dirname(signalPath), { recursive: true });
    writeFileSync(signalPath, JSON.stringify({ 'IN-2026-0001': agent === 'creative' ? 'skipped' : 'done' }));
  }
  const [item] = await src.reconcile('IN-2026-0001');
  assert.equal(item.status, 'on-hold');
  rmSync(root, { recursive: true, force: true });
});

test('reconcile preserves an owner hold even when every lane previously finished', async () => {
  const { root, src } = tempSource();
  await src.dispatch('IN-2026-0001');
  for (const rel of Object.values(SIGNAL_FILES)) {
    const signalPath = path.join(root, rel);
    mkdirSync(path.dirname(signalPath), { recursive: true });
    writeFileSync(signalPath, JSON.stringify({ 'IN-2026-0001': 'done' }));
  }
  await src.reconcile('IN-2026-0001');
  await src.setStatus('IN-2026-0001', 'on-hold');

  const [item] = await src.reconcile('IN-2026-0001');

  assert.equal(item.status, 'on-hold');
  rmSync(root, { recursive: true, force: true });
});

test('promote refuses when the gate fails and writes nothing', async () => {
  const writes = [];
  const { root, src } = tempSource({ gateRunner: () => false, writeCanonical: (r) => writes.push(r) });
  await src.dispatch('IN-2026-0001');
  await src.setStatus('IN-2026-0001', 'ready');
  await assert.rejects(() => src.promote('IN-2026-0001', { slug: 'test' }), /gate failed/);
  assert.equal(writes.length, 0, 'canonical must not be written when the gate fails');
  const it = await src.get('IN-2026-0001');
  assert.notEqual(it.status, 'promoted');
  rmSync(root, { recursive: true, force: true });
});

test('promote refuses an item that is not ready', async () => {
  const writes = [];
  const { root, src } = tempSource({ gateRunner: () => true, writeCanonical: (r) => writes.push(r) });
  await src.dispatch('IN-2026-0001');
  await assert.rejects(() => src.promote('IN-2026-0001', { slug: 'test' }), /must be ready/);
  assert.equal(writes.length, 0);
  rmSync(root, { recursive: true, force: true });
});

test('promote rolls canonical data back when post-write compliance validation fails', async () => {
  const writes = [];
  let gateRuns = 0;
  const { root, src } = tempSource({
    gateRunner: () => {
      gateRuns += 1;
      return true;
    },
    validationRunner: () => false,
    writeCanonical: (record) => {
      writes.push(record);
      return () => writes.pop();
    },
  });
  await src.dispatch('IN-2026-0001');
  await src.setStatus('IN-2026-0001', 'ready');
  await assert.rejects(() => src.promote('IN-2026-0001', { slug: 'test-hub' }), /post-write validation failed/);
  assert.equal(gateRuns, 1);
  assert.equal(writes.length, 0, 'failed canonical write must be rolled back');
  assert.equal((await src.get('IN-2026-0001')).status, 'ready');
  rmSync(root, { recursive: true, force: true });
});

test('promote rolls back canonical and queue state when vault resealing fails', async () => {
  const writes = [];
  const { root, src } = tempSource({
    gateRunner: () => true,
    sealRunner: () => false,
    writeCanonical: (record) => {
      writes.push(record);
      return () => writes.pop();
    },
  });
  await src.setStatus('IN-2026-0001', 'ready');
  await assert.rejects(() => src.promote('IN-2026-0001', { candidateId: 'PP-C99', slug: 'test-hub' }), /reseal failed/);
  assert.equal(writes.length, 0);
  const item = await src.get('IN-2026-0001');
  assert.equal(item.status, 'ready');
  assert.equal(item.promotedProductId, undefined);
  rmSync(root, { recursive: true, force: true });
});

test('promote succeeds with the real vault gate and leaves the new seal valid', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'intake-real-vault-'));
  for (const directory of ['data', 'content', 'scripts', '.vault', '.superpowers/sdd']) {
    mkdirSync(path.join(root, directory), { recursive: true });
  }
  copyFileSync(new URL('../scripts/vault.mjs', import.meta.url), path.join(root, 'scripts', 'vault.mjs'));
  writeFileSync(path.join(root, '.vault', 'vault.config.json'), JSON.stringify({
    sealGlobs: ['data/products.json'],
    sealExclude: [],
    protectedFromAgents: [],
    secretFilesNeverTracked: [],
    secretScanExempt: [],
  }));
  const products = Array.from({ length: 5 }, (_, index) => ({
    candidateId: `PP-C0${index + 1}`,
    slug: `product-${index + 1}`,
    providers: [],
  }));
  const productsPath = path.join(root, 'data', 'products.json');
  writeFileSync(productsPath, JSON.stringify(products, null, 2));
  writeFileSync(path.join(root, 'content', 'editorial-map.json'), JSON.stringify({ articles: [{}, {}, {}] }));
  writeFileSync(path.join(root, INTAKE_FILE), JSON.stringify([{ ...validItem(), status: 'ready' }], null, 2));
  execFileSync('node', ['scripts/vault.mjs', 'seal'], { cwd: root });

  const src = new FileIntakeSource({
    root,
    writeCanonical: (record) => {
      const before = readFileSync(productsPath, 'utf8');
      const current = JSON.parse(before);
      writeFileSync(productsPath, JSON.stringify([record, ...current.slice(1)], null, 2));
      return () => writeFileSync(productsPath, before);
    },
  });
  const promoted = await src.promote('IN-2026-0001', { candidateId: 'PP-C99', slug: 'promoted-product', providers: [] });

  assert.equal(promoted.status, 'promoted');
  execFileSync('node', ['scripts/vault.mjs', 'gate'], { cwd: root });
  rmSync(root, { recursive: true, force: true });
});

test('promote succeeds when the gate passes', async () => {
  const writes = [];
  const { root, src } = tempSource({ gateRunner: () => true, writeCanonical: (r) => writes.push(r) });
  await src.dispatch('IN-2026-0001');
  await src.setStatus('IN-2026-0001', 'ready');
  const it = await src.promote('IN-2026-0001', { slug: 'test-hub' });
  assert.equal(it.status, 'promoted');
  assert.equal(it.promotedProductId, 'test-hub');
  assert.equal(writes.length, 1);
  rmSync(root, { recursive: true, force: true });
});

// ---- A7: admin add/list/remove + id generation ------------------------------
test('add() appends a valid item and rejects invalid + duplicate', async () => {
  const { root, src } = tempSource();
  const item2 = { ...validItem(), intakeId: 'IN-2026-0002', name: 'Second' };
  await src.add(item2);
  assert.equal((await src.list()).length, 2);
  await assert.rejects(() => src.add({ intakeId: 'IN-2026-0003' }), /invalid intake item/);
  await assert.rejects(() => src.add(validItem()), /duplicate/);
  rmSync(root, { recursive: true, force: true });
});

test('update() edits owner fields without overwriting workflow state', async () => {
  const { root, src } = tempSource();
  await src.dispatch('IN-2026-0001');
  const updated = await src.update('IN-2026-0001', {
    name: 'Updated Hub',
    category: 'Connectivity',
    problemHypothesis: 'Needs one-cable desk connectivity.',
    priority: 'medium',
    ownerNotes: 'Recheck the exact model.',
  });
  assert.equal(updated.name, 'Updated Hub');
  assert.equal(updated.priority, 'medium');
  assert.equal(updated.status, 'dispatched');
  assert.deepEqual(updated.delegations, { research: 'requested', creative: 'requested', marketing: 'requested' });
  await assert.rejects(() => src.update('IN-2026-0001', { name: '' }), /invalid intake item/);
  rmSync(root, { recursive: true, force: true });
});

test('remove() deletes an item', async () => {
  const { root, src } = tempSource();
  await src.remove('IN-2026-0001');
  assert.equal((await src.list()).length, 0);
  await assert.rejects(() => src.remove('IN-2026-9999'), /no item/);
  rmSync(root, { recursive: true, force: true });
});

test('nextIntakeId increments the highest suffix', () => {
  const id = nextIntakeId([{ intakeId: 'IN-2026-0007' }, { intakeId: 'IN-2025-0003' }]);
  assert.match(id, /^IN-\d{4}-0008$/);
  assert.match(nextIntakeId([]), /^IN-\d{4}-0001$/);
});
