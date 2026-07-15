import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import products from '../data/products.json' with { type: 'json' };
import { isStrictIsoDate, isStrictIsoUtcTimestamp, parseCsv } from '../scripts/validate_research.mjs';

const evidenceRows = parseCsv(await readFile(new URL('../research/evidence.csv', import.meta.url), 'utf8'));

const expectedSlugs = new Set([
  'anker-332-usb-c-hub',
  'ugreen-40289-laptop-stand',
  'havit-f2069-laptop-cooling-pad',
  'joyroom-jr-zs368-cable-organizer',
  'logitech-signature-m650-mouse',
]);
const scoreKeys = [
  'problemUrgency',
  'searchIntent',
  'availability',
  'value',
  'compatibility',
  'editorialFit',
  'visual',
];
const directStatus = 'DIRECT_LINK — AFFILIATE ID REQUIRED';

assert.equal(isStrictIsoDate('2024-02-29'), true, 'leap-day date must pass in a leap year');
assert.equal(isStrictIsoDate('2025-02-29'), false, 'impossible non-leap-year date must fail');
assert.equal(isStrictIsoDate('2026-02-30'), false, 'impossible day-of-month must fail');
assert.equal(isStrictIsoDate('2026-13-01'), false, 'impossible month must fail');
assert.equal(isStrictIsoUtcTimestamp('2026-07-15T00:25:00Z'), true, 'real UTC timestamp must pass');
assert.equal(isStrictIsoUtcTimestamp('2026-02-30T00:00:00Z'), false, 'timestamp with impossible date must fail');
assert.equal(isStrictIsoUtcTimestamp('2026-07-15T24:00:00Z'), false, 'timestamp with impossible hour must fail');
assert.equal(isStrictIsoUtcTimestamp('2026-07-15T12:60:00Z'), false, 'timestamp with impossible minute must fail');

assert.equal(products.length, 5, 'launch dataset must contain exactly five products');
assert.equal(new Set(products.map((product) => product.slug)).size, 5, 'slugs must be unique');
assert.deepEqual(new Set(products.map((product) => product.slug)), expectedSlugs, 'only the approved five may launch');

for (const product of products) {
  assert.deepEqual(Object.keys(product.score.components).sort(), [...scoreKeys].sort(), `${product.slug} score shape`);
  assert.equal(
    product.score.total,
    Object.values(product.score.components).reduce((total, value) => total + value, 0),
    `${product.slug} score must sum`,
  );
  assert.ok(product.score.total <= 100, `${product.slug} score must not exceed 100`);
  assert.ok(isStrictIsoDate(product.priceCapturedAt), `${product.slug} price date must be a real calendar date`);

  const retailers = new Set(product.providers.map((provider) => provider.retailer));
  assert.deepEqual(retailers, new Set(['Amazon Egypt', 'Noon Egypt']), `${product.slug} needs both exact providers`);
  assert.ok(product.providers.some((provider) => new URL(provider.directUrl).hostname === 'www.amazon.eg'));
  assert.ok(product.providers.some((provider) => new URL(provider.directUrl).hostname === 'www.noon.com'));
  assert.ok(product.providers.every((provider) => provider.affiliateStatus === directStatus));
  assert.ok(product.providers.every((provider) => provider.affiliateUrl === null));
  assert.ok(product.providers.every((provider) => provider.imageRights === 'SOURCE_LINK_ONLY'));
  assert.ok(product.providers.every((provider) => isStrictIsoDate(provider.capturedAt)));

  assert.ok(product.evidence.length >= 3, `${product.slug} needs at least three evidence records`);
  assert.ok(product.evidence.some((item) => /amazon\.eg/.test(new URL(item.sourceUrl).hostname)));
  assert.ok(product.evidence.some((item) => /noon\.com/.test(new URL(item.sourceUrl).hostname)));
  assert.ok(product.evidence.some((item) => !/amazon\.eg|noon\.com/.test(new URL(item.sourceUrl).hostname)));

  assert.ok(product.primaryKeyword.sourceUrl && product.primaryKeyword.capturedAt);
  assert.equal(product.primaryKeyword.metricValue, 'returned', `${product.slug} must use returned keyword evidence`);
  assert.equal(product.primaryKeyword.market, 'EG', `${product.slug} keyword market must remain Egypt`);
  assert.ok(isStrictIsoUtcTimestamp(product.primaryKeyword.capturedAt));
  assert.ok(product.supportingKeywords.length >= 4, `${product.slug} needs at least four supporting terms`);
  for (const keyword of product.supportingKeywords) {
    assert.ok(
      evidenceRows.some(
        (row) =>
          row.query_or_item === keyword &&
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
  assert.ok(product.risks.length > 0, `${product.slug} must expose risks`);
  assert.ok(product.closestRejectedAlternative, `${product.slug} must name its closest rejection`);
}

for (const slug of ['anker-332-usb-c-hub', 'havit-f2069-laptop-cooling-pad']) {
  const product = products.find((item) => item.slug === slug);
  assert.ok(product.evidence.some((item) => /safety|power/i.test(item.claim)), `${slug} needs power/safety evidence`);
}

const mouse = products.find((product) => product.slug === 'logitech-signature-m650-mouse');
assert.doesNotMatch(JSON.stringify(mouse), /\bquiet(?:er)?\b|contour(?:ed)?/i, 'M650 cannot carry unsupported quiet or contour claims');
assert.match(mouse.verdict, /not the separately researched Logitech Lift vertical model/i);
assert.ok(mouse.risks.some((risk) => /part number|mapping/i.test(risk)), 'M650 must retain its part-mapping caution');

const coolingPad = products.find((product) => product.slug === 'havit-f2069-laptop-cooling-pad');
assert.match(coolingPad.verdict, /among the 15 researched candidates/i, 'Havit comparison must be bounded to the researched set');
assert.doesNotMatch(JSON.stringify(coolingPad), /blocked vent|damaged (?:power )?cable|failing internal fan/i, 'Havit cannot carry unsupported service advice');

assert.ok(
  products.every((product) => product.risks.some((risk) => /Noon Egypt.*unconfirmed|unconfirmed.*Noon Egypt/i.test(risk))),
  'every product must preserve the Noon Egypt commission limitation',
);

console.log('research-data.test: 5 canonical records passed');
