import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const [schema, products, evidenceText, productEvidenceText, seoEvidenceText, affiliateEvidenceText, candidatesText] = await Promise.all([
  readJson('data/product.schema.json'),
  readJson('data/products.json'),
  readFile(new URL('../research/evidence.csv', import.meta.url), 'utf8'),
  readFile(new URL('../research/product-evidence.csv', import.meta.url), 'utf8'),
  readFile(new URL('../research/seo-evidence.csv', import.meta.url), 'utf8'),
  readFile(new URL('../research/affiliate-program-evidence.csv', import.meta.url), 'utf8'),
  readFile(new URL('../research/product-candidates.csv', import.meta.url), 'utf8'),
]);

function readJson(relativePath) {
  return readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8').then(JSON.parse);
}

export function isStrictIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

export function isStrictIsoUtcTimestamp(value) {
  if (typeof value !== 'string') return false;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z$/);
  if (!match || !isStrictIsoDate(match[1])) return false;
  const [, date, hours, minutes, seconds, fraction = ''] = match;
  if (Number(hours) > 23 || Number(minutes) > 59 || Number(seconds) > 59) return false;
  const normalized = `${date}T${hours}:${minutes}:${seconds}.${fraction.padEnd(3, '0')}Z`;
  const parsed = new Date(normalized);
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString() === normalized;
}

export function parseCsv(text) {
  const records = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      row.push(field.replace(/\r$/, ''));
      records.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }
  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ''));
    records.push(row);
  }
  assert.equal(quoted, false, 'evidence CSV contains an unterminated quoted field');
  const [headers, ...rows] = records.filter((record) => record.some((value) => value !== ''));
  assert.ok(headers, 'evidence CSV must have a header');
  return rows.map((record, rowIndex) => {
    assert.equal(record.length, headers.length, `evidence CSV row ${rowIndex + 2} column count`);
    return Object.fromEntries(headers.map((header, columnIndex) => [header, record[columnIndex]]));
  });
}

function resolveRef(reference) {
  assert.ok(reference.startsWith('#/'), `unsupported schema reference ${reference}`);
  return reference
    .slice(2)
    .split('/')
    .reduce((value, key) => value[key.replaceAll('~1', '/').replaceAll('~0', '~')], schema);
}

function validateSchema(value, node, path = '$') {
  if (node.$ref) return validateSchema(value, resolveRef(node.$ref), path);
  if (node.const !== undefined) assert.deepEqual(value, node.const, `${path} must equal schema const`);
  if (node.enum) assert.ok(node.enum.includes(value), `${path} must match schema enum`);

  if (node.type === 'object') {
    assert.ok(value !== null && typeof value === 'object' && !Array.isArray(value), `${path} must be an object`);
    for (const key of node.required ?? []) assert.ok(Object.hasOwn(value, key), `${path}.${key} is required`);
    if (node.additionalProperties === false) {
      for (const key of Object.keys(value)) assert.ok(Object.hasOwn(node.properties, key), `${path}.${key} is not allowed`);
    }
    for (const [key, child] of Object.entries(node.properties ?? {})) {
      if (Object.hasOwn(value, key)) validateSchema(value[key], child, `${path}.${key}`);
    }
  } else if (node.type === 'array') {
    assert.ok(Array.isArray(value), `${path} must be an array`);
    if (node.minItems !== undefined) assert.ok(value.length >= node.minItems, `${path} must have at least ${node.minItems} items`);
    if (node.maxItems !== undefined) assert.ok(value.length <= node.maxItems, `${path} must have no more than ${node.maxItems} items`);
    if (node.uniqueItems) assert.equal(new Set(value.map((item) => JSON.stringify(item))).size, value.length, `${path} must be unique`);
    value.forEach((item, index) => validateSchema(item, node.items, `${path}[${index}]`));
  } else if (node.type === 'string') {
    assert.equal(typeof value, 'string', `${path} must be a string`);
    if (node.minLength !== undefined) assert.ok(value.length >= node.minLength, `${path} is too short`);
    if (node.pattern) assert.match(value, new RegExp(node.pattern, 'u'), `${path} must match ${node.pattern}`);
    if (node.format === 'uri') {
      const url = new URL(value);
      assert.equal(url.protocol, 'https:', `${path} must be an HTTPS URL`);
    }
    if (node.format === 'date') assert.ok(isStrictIsoDate(value), `${path} must be a real ISO-8601 calendar date`);
    if (node.format === 'date-time') assert.ok(isStrictIsoUtcTimestamp(value), `${path} must be a real ISO-8601 UTC timestamp`);
  } else if (node.type === 'integer') {
    assert.ok(Number.isInteger(value), `${path} must be an integer`);
  } else if (node.type === 'number') {
    assert.equal(typeof value, 'number', `${path} must be a number`);
    assert.ok(Number.isFinite(value), `${path} must be finite`);
  } else if (node.type === 'null') {
    assert.equal(value, null, `${path} must be null`);
  }

  if (typeof value === 'number') {
    if (node.minimum !== undefined) assert.ok(value >= node.minimum, `${path} must be >= ${node.minimum}`);
    if (node.maximum !== undefined) assert.ok(value <= node.maximum, `${path} must be <= ${node.maximum}`);
    if (node.exclusiveMinimum !== undefined) assert.ok(value > node.exclusiveMinimum, `${path} must be > ${node.exclusiveMinimum}`);
  }
}

assert.ok(Array.isArray(products), 'data/products.json must be an array');
assert.equal(products.length, 5, 'launch dataset must contain exactly five products');
products.forEach((product, index) => validateSchema(product, schema, `$[${index}]`));

const evidenceRows = parseCsv(evidenceText);
const evidenceById = new Map();
for (const row of evidenceRows) {
  assert.ok(row.evidence_id.trim(), 'every evidence row needs an evidence_id');
  assert.ok(!evidenceById.has(row.evidence_id), `duplicate evidence ID ${row.evidence_id}`);
  assert.ok(isStrictIsoUtcTimestamp(row.captured_at_utc), `${row.evidence_id} must have a real ISO-8601 UTC capture timestamp`);
  assert.equal(row.rights_status, 'SOURCE_LINK_ONLY', `${row.evidence_id} rights status`);
  new URL(row.source_url);
  evidenceById.set(row.evidence_id, row);
}

const stagedRows = [productEvidenceText, seoEvidenceText, affiliateEvidenceText].flatMap(parseCsv);
const stagedIds = new Set(stagedRows.map((row) => row.staged_id));
assert.equal(stagedIds.size, stagedRows.length, 'staging evidence IDs must be unique across research streams');
assert.equal(evidenceById.size, stagedIds.size, 'canonical ledger must contain every staged row and no untracked rows');
for (const evidenceId of stagedIds) assert.ok(evidenceById.has(evidenceId), `canonical ledger is missing staged evidence ${evidenceId}`);
const candidateRows = parseCsv(candidatesText);
assert.equal(candidateRows.length, 15, 'the researched comparison universe must contain 15 candidates');

const expectedCandidateIds = new Set(['PP-C01', 'PP-C04', 'PP-C09', 'PP-C10', 'PP-C15']);
assert.deepEqual(new Set(products.map((product) => product.candidateId)), expectedCandidateIds, 'canonical data must contain only the approved five candidates');
assert.equal(new Set(products.map((product) => product.slug)).size, 5, 'product slugs must be unique');
assert.equal(new Set(products.map((product) => product.route)).size, 5, 'product routes must be unique');

const directStatus = 'DIRECT_LINK — AFFILIATE ID REQUIRED';
for (const product of products) {
  const componentTotal = Object.values(product.score.components).reduce((sum, value) => sum + value, 0);
  assert.equal(product.score.total, componentTotal, `${product.slug} score total must equal its components`);
  assert.ok(product.score.total <= 100, `${product.slug} score must not exceed 100`);

  const providerNames = new Set(product.providers.map((provider) => provider.retailer));
  assert.deepEqual(providerNames, new Set(['Amazon Egypt', 'Noon Egypt']), `${product.slug} requires Amazon Egypt and Noon Egypt`);
  for (const provider of product.providers) {
    assert.equal(provider.affiliateStatus, directStatus, `${product.slug} provider status`);
    assert.equal(provider.affiliateUrl, null, `${product.slug} direct link cannot contain an affiliate URL`);
    assert.equal(provider.imageRights, 'SOURCE_LINK_ONLY', `${product.slug} provider imagery must remain source-link-only`);
    assert.equal(provider.imageSourceUrl, provider.directUrl, `${product.slug} image source must remain a research-page link`);
    const url = new URL(provider.directUrl);
    if (provider.retailer === 'Amazon Egypt') {
      assert.equal(url.hostname, 'www.amazon.eg', `${product.slug} Amazon hostname`);
      assert.match(url.pathname, /\/dp\/[A-Z0-9]{10}\/?$/, `${product.slug} Amazon URL must be a product-detail page`);
    } else {
      assert.equal(url.hostname, 'www.noon.com', `${product.slug} Noon hostname`);
      assert.match(url.pathname, /\/[A-Z0-9]+\/p\/$/, `${product.slug} Noon URL must be a product-detail page`);
    }
  }

  const referencedRows = product.evidence.map((item) => {
    const row = evidenceById.get(item.evidenceId);
    assert.ok(row, `${product.slug} references missing evidence ${item.evidenceId}`);
    assert.equal(item.sourceUrl, row.source_url, `${product.slug} ${item.evidenceId} source URL must match ledger`);
    assert.equal(item.capturedAt, row.captured_at_utc, `${product.slug} ${item.evidenceId} capture time must match ledger`);
    return row;
  });
  assert.ok(referencedRows.some((row) => row.evidence_type === 'manufacturer_spec'), `${product.slug} needs manufacturer evidence`);
  assert.ok(referencedRows.some((row) => row.source_name === 'Amazon Egypt'), `${product.slug} needs Amazon evidence`);
  assert.ok(referencedRows.some((row) => row.source_name === 'Noon Egypt'), `${product.slug} needs Noon evidence`);

  const keywordRow = evidenceById.get(product.primaryKeyword.evidenceId);
  assert.ok(keywordRow, `${product.slug} primary keyword evidence is missing`);
  assert.equal(keywordRow.metric_value, 'returned', `${product.slug} cannot score a not_returned keyword`);
  assert.notEqual(keywordRow.metric_value, 'rate_limited', `${product.slug} cannot score rate-limited evidence`);
  assert.equal(keywordRow.market, 'EG', `${product.slug} primary keyword must remain Egypt-specific`);
  assert.equal(keywordRow.query_or_item, product.primaryKeyword.keyword, `${product.slug} primary keyword must match its evidence row`);
  assert.equal(keywordRow.source_url, product.primaryKeyword.sourceUrl, `${product.slug} keyword URL must match its evidence row`);
  assert.equal(keywordRow.captured_at_utc, product.primaryKeyword.capturedAt, `${product.slug} keyword date must match its evidence row`);
  assert.equal(keywordRow.used_by, product.route, `${product.slug} keyword route must match the canonical route`);

  for (const keyword of product.supportingKeywords) {
    const rows = evidenceRows.filter((row) => row.query_or_item === keyword);
    assert.ok(rows.length > 0, `${product.slug} supporting keyword ${keyword} needs evidence`);
    assert.ok(
      rows.some(
        (row) =>
          row.market === 'EG' &&
          row.metric_unit === 'qualitative' &&
          row.used_by === product.route &&
          row.source_name.trim().length > 0 &&
          row.source_url.startsWith('https://') &&
          isStrictIsoUtcTimestamp(row.captured_at_utc) &&
          !['not_returned', 'rate_limited'].includes(row.metric_value),
      ),
      `${product.slug} supporting keyword ${keyword} needs same-route positive EG qualitative source/date evidence`,
    );
  }
}

for (const candidateId of ['PP-C01', 'PP-C15']) {
  const product = products.find((item) => item.candidateId === candidateId);
  assert.ok(product.evidence.some((item) => evidenceById.get(item.evidenceId)?.evidence_type === 'manufacturer_safety'), `${candidateId} needs explicit safety evidence`);
}

const mouse = products.find((product) => product.candidateId === 'PP-C10');
assert.doesNotMatch(JSON.stringify(mouse), /\bquiet(?:er)?\b|contour(?:ed)?/i, 'M650 cannot carry unsupported quiet or contour claims');
assert.match(mouse.verdict, /not the separately researched Logitech Lift vertical model/i, 'M650 must remain distinct from the vertical Lift model');
assert.ok(mouse.risks.some((risk) => /part number|mapping/i.test(risk)), 'M650 part-number mapping caution must remain explicit');

const coolingPad = products.find((product) => product.candidateId === 'PP-C15');
assert.match(coolingPad.verdict, /among the 15 researched candidates/i, 'Havit comparison must be bounded to the verified candidate universe');
assert.doesNotMatch(JSON.stringify(coolingPad), /blocked vent|damaged (?:power )?cable|failing internal fan/i, 'Havit cannot carry unsupported service advice');

assert.ok(evidenceById.has('AFF-004'), 'Noon territory limitation evidence must be integrated');
assert.ok(products.every((product) => product.risks.some((risk) => /Noon Egypt affiliate commission eligibility is unconfirmed/.test(risk))), 'every product must preserve the Noon Egypt commission limitation');

console.log(`validate_research: ${products.length} products, ${evidenceRows.length} canonical evidence records passed (${root})`);
