import assert from 'node:assert/strict';
import products from '../data/products.json' with { type: 'json' };

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

  const retailers = new Set(product.providers.map((provider) => provider.retailer));
  assert.deepEqual(retailers, new Set(['Amazon Egypt', 'Noon Egypt']), `${product.slug} needs both exact providers`);
  assert.ok(product.providers.some((provider) => new URL(provider.directUrl).hostname === 'www.amazon.eg'));
  assert.ok(product.providers.some((provider) => new URL(provider.directUrl).hostname === 'www.noon.com'));
  assert.ok(product.providers.every((provider) => provider.affiliateStatus === directStatus));
  assert.ok(product.providers.every((provider) => provider.affiliateUrl === null));
  assert.ok(product.providers.every((provider) => provider.imageRights === 'SOURCE_LINK_ONLY'));

  assert.ok(product.evidence.length >= 3, `${product.slug} needs at least three evidence records`);
  assert.ok(product.evidence.some((item) => /amazon\.eg/.test(new URL(item.sourceUrl).hostname)));
  assert.ok(product.evidence.some((item) => /noon\.com/.test(new URL(item.sourceUrl).hostname)));
  assert.ok(product.evidence.some((item) => !/amazon\.eg|noon\.com/.test(new URL(item.sourceUrl).hostname)));

  assert.ok(product.primaryKeyword.sourceUrl && product.primaryKeyword.capturedAt);
  assert.equal(product.primaryKeyword.metricValue, 'returned', `${product.slug} must use returned keyword evidence`);
  assert.equal(product.primaryKeyword.market, 'EG', `${product.slug} keyword market must remain Egypt`);
  assert.ok(product.supportingKeywords.length >= 4, `${product.slug} needs at least four supporting terms`);
  assert.ok(product.risks.length > 0, `${product.slug} must expose risks`);
  assert.ok(product.closestRejectedAlternative, `${product.slug} must name its closest rejection`);
}

for (const slug of ['anker-332-usb-c-hub', 'havit-f2069-laptop-cooling-pad']) {
  const product = products.find((item) => item.slug === slug);
  assert.ok(product.evidence.some((item) => /safety|power/i.test(item.claim)), `${slug} needs power/safety evidence`);
}

const mouse = products.find((product) => product.slug === 'logitech-signature-m650-mouse');
assert.match(mouse.verdict, /conventional/i, 'M650 verdict must state that it is conventional');
assert.match(mouse.verdict, /not (a )?vertical/i, 'M650 verdict must state that it is not vertical');
assert.ok(mouse.risks.some((risk) => /part number|mapping/i.test(risk)), 'M650 must retain its part-mapping caution');

assert.ok(
  products.every((product) => product.risks.some((risk) => /Noon Egypt.*unconfirmed|unconfirmed.*Noon Egypt/i.test(risk))),
  'every product must preserve the Noon Egypt commission limitation',
);

console.log('research-data.test: 5 canonical records passed');
