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
});

test('logos are self-contained, accessible, and safe', async () => {
  for (const name of ['logo.svg', 'logo-mark.svg']) {
    const svg = await readFile(resolve(root, `brand/${name}`), 'utf8');
    assert.match(svg, /<svg\b[^>]*\bviewBox="[^"]+"/i, `${name} needs a viewBox`);
    assert.match(svg, /<title\b[^>]*>/i, `${name} needs a title`);
    assert.match(svg, /<desc\b[^>]*>/i, `${name} needs a description`);
    assert.match(svg, /role="img"/i, `${name} needs image semantics`);
    assert.doesNotMatch(svg, /<script\b/i, `${name} may not run scripts`);
    assert.doesNotMatch(svg, /<image\b/i, `${name} may not embed raster images`);
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
});
