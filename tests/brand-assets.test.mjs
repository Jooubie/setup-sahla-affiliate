import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const requiredFiles = [
  'brand/BRAND_GUIDE.md',
  'brand/VOICE_AND_EDITORIAL.md',
  'brand/design-tokens.json',
  'brand/logo.svg',
  'brand/logo-mark.svg',
  'brand/CREATIVE_SYSTEM.md',
  'scripts/validate_brand.mjs',
];

const palette = {
  ink: '#101411',
  paper: '#E9DFCA',
  lime: '#C9FF4A',
  cyan: '#66D9E8',
  cream: '#FFFDF7',
};

const creativeSlots = [
  'home-hero',
  'category-usb-c-hub',
  'category-laptop-stand',
  'category-cooling-pad',
  'category-cable-management',
  'category-quiet-mouse',
  'blog-desk-setup-diagnostic',
  'blog-usb-c-hub-guide',
  'blog-thermal-posture-cable-workflow',
  'og-social-1200x630',
];

function relativeLuminance(hex) {
  const channels = hex.match(/[0-9a-f]{2}/gi).map((value) => Number.parseInt(value, 16) / 255);
  const linear = channels.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrastRatio(foreground, background) {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

test('all required brand artifacts exist', () => {
  for (const relativePath of requiredFiles) {
    assert.ok(existsSync(resolve(root, relativePath)), `missing ${relativePath}`);
  }
});

test('design tokens expose the approved palette and Arabic-capable typography', async () => {
  const tokens = JSON.parse(await readFile(resolve(root, 'brand/design-tokens.json'), 'utf8'));
  for (const [name, value] of Object.entries(palette)) {
    assert.equal(tokens.color.brand[name].value, value, `${name} token drifted`);
  }
  assert.match(tokens.typography.fontFamily.arabic.value, /Noto Sans Arabic/i);
  assert.ok(tokens.spacing && tokens.radius && tokens.shadow && tokens.motion && tokens.chart);

  const computedPairs = {
    inkOnCream: ['ink', 'cream'],
    inkOnPaper: ['ink', 'paper'],
    inkOnLime: ['ink', 'lime'],
    cyanOnInk: ['cyan', 'ink'],
  };
  for (const [pairName, [foregroundName, backgroundName]] of Object.entries(computedPairs)) {
    const computed = contrastRatio(
      tokens.color.brand[foregroundName].value,
      tokens.color.brand[backgroundName].value,
    );
    assert.ok(computed >= 4.5, `${pairName} computes below WCAG AA: ${computed.toFixed(2)}:1`);
    assert.ok(
      Math.abs(computed - tokens.color.contrastPairs[pairName].ratio) <= 0.02,
      `${pairName} declared ratio must match computed value`,
    );
  }
});

test('logos are self-contained, accessible, and safe', async () => {
  for (const name of ['logo.svg', 'logo-mark.svg']) {
    const svg = await readFile(resolve(root, `brand/${name}`), 'utf8');
    assert.match(svg, /<svg\b[^>]*\bviewBox="[^"]+"/i, `${name} needs a viewBox`);
    assert.match(svg, /<title\b[^>]*>/i, `${name} needs a title`);
    assert.match(svg, /<desc\b[^>]*>/i, `${name} needs a description`);
    assert.match(svg, /role="img"/i, `${name} needs image semantics`);
    const labelledBy = svg.match(/aria-labelledby="([^"]+)"/i)?.[1].trim().split(/\s+/) ?? [];
    const allIds = [...svg.matchAll(/\bid="([^"]+)"/gi)].map((match) => match[1]);
    const titleId = svg.match(/<title\b[^>]*\bid="([^"]+)"/i)?.[1];
    const descId = svg.match(/<desc\b[^>]*\bid="([^"]+)"/i)?.[1];
    assert.equal(new Set(allIds).size, allIds.length, `${name} IDs must be unique`);
    assert.deepEqual(labelledBy, [titleId, descId], `${name} aria-labelledby must resolve title then description`);
    assert.match(svg, /id="cable-line"/i, `${name} needs an identifiable cable line`);
    assert.match(svg, /id="connector-body"/i, `${name} needs a clear connector body`);
    assert.doesNotMatch(svg, /<script\b/i, `${name} may not run scripts`);
    assert.doesNotMatch(svg, /<image\b/i, `${name} may not embed raster images`);
    assert.doesNotMatch(svg, /<foreignObject\b/i, `${name} may not embed foreign HTML`);
    assert.doesNotMatch(svg, /\son[a-z][a-z0-9:_-]*\s*=/i, `${name} may not contain event handlers`);
    assert.doesNotMatch(svg, /\b(?:href|xlink:href)\s*=/i, `${name} may not reference external assets`);
    assert.doesNotMatch(svg, /data:image/i, `${name} may not embed data URLs`);
  }
});

test('brand guide contains identity variants and the launch tagline', async () => {
  const guide = await readFile(resolve(root, 'brand/BRAND_GUIDE.md'), 'utf8');
  assert.match(guide, /Fix the friction\. Keep the gear\./);
  for (const rule of ['Primary', 'Reverse', 'Monochrome', 'Small-size', 'Clear space']) {
    assert.match(guide, new RegExp(rule, 'i'), `brand guide missing ${rule} rule`);
  }
  assert.match(guide, /24\s*px/i);
  assert.match(guide, /substrate knockout/i);
  assert.match(guide, /tile-free one-ink/i);
});

test('creative system defines exactly the ten approved original-image slots', async () => {
  const system = await readFile(resolve(root, 'brand/CREATIVE_SYSTEM.md'), 'utf8');
  const found = [...system.matchAll(/^### Slot: `([^`]+)`$/gm)].map((match) => match[1]);
  assert.deepEqual(found, creativeSlots);
  for (const slot of creativeSlots) {
    const block = system.split(`### Slot: \`${slot}\``)[1]?.split('\n### Slot: `')[0] ?? '';
    assert.match(block, /\*\*Exact generation prompt:\*\*/);
    assert.match(block, /\*\*Alt-text direction:\*\*/);
    assert.match(block, /\*\*Rights status:\*\* `ORIGINAL`/);
  }
  assert.match(system, /image-rights checklist/i);
  assert.match(system, /do not (?:copy|reproduce).*retailer/i);
});

test('voice guide contains commercial, price, and compatibility safeguards', async () => {
  const voice = await readFile(resolve(root, 'brand/VOICE_AND_EDITORIAL.md'), 'utf8');
  assert.match(voice, /affiliate disclosure/i);
  assert.match(voice, /Check current price on \[retailer\]/i);
  assert.match(voice, /snapshot/i);
  assert.match(voice, /compatibility/i);
  assert.match(voice, /words to avoid/i);
  assert.match(voice, /specific program and territory/i);
  assert.match(voice, /Noon Egypt[^\n]*(?:uncertain|unconfirmed)/i);
});
