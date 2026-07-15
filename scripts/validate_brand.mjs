import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const errors = [];
const required = [
  'brand/BRAND_GUIDE.md',
  'brand/VOICE_AND_EDITORIAL.md',
  'brand/design-tokens.json',
  'brand/logo.svg',
  'brand/logo-mark.svg',
  'brand/CREATIVE_SYSTEM.md',
  'tests/brand-assets.test.mjs',
];
const corePalette = {
  ink: '#101411',
  paper: '#E9DFCA',
  lime: '#C9FF4A',
  cyan: '#66D9E8',
  cream: '#FFFDF7',
};
const requiredSlots = [
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

function fail(message) {
  errors.push(message);
}

for (const file of required) {
  if (!existsSync(resolve(root, file))) fail(`Missing required file: ${file}`);
}

if (errors.length === 0) {
  let tokens;
  try {
    tokens = JSON.parse(await readFile(resolve(root, 'brand/design-tokens.json'), 'utf8'));
  } catch (error) {
    fail(`design-tokens.json is not valid JSON: ${error.message}`);
  }

  if (tokens) {
    for (const [name, expected] of Object.entries(corePalette)) {
      const actual = tokens?.color?.brand?.[name]?.value;
      if (actual !== expected) fail(`Palette token ${name} must be ${expected}; found ${actual ?? 'missing'}`);
    }
    for (const group of ['typography', 'spacing', 'radius', 'shadow', 'motion', 'chart', 'report']) {
      if (!tokens[group] || Object.keys(tokens[group]).length === 0) fail(`Token group is missing or empty: ${group}`);
    }
    if (!/Noto Sans Arabic/i.test(tokens?.typography?.fontFamily?.arabic?.value ?? '')) {
      fail('Arabic font stack must include Noto Sans Arabic');
    }
    if ((tokens?.layout?.tapTarget?.value ?? '') !== '44px') fail('Minimum tap-target token must be 44px');
    for (const pair of Object.values(tokens?.color?.contrastPairs ?? {})) {
      if (typeof pair.ratio !== 'number' || pair.ratio < 4.5) fail('Every documented contrast pair must meet 4.5:1');
    }
  }

  for (const file of ['brand/logo.svg', 'brand/logo-mark.svg']) {
    const svg = await readFile(resolve(root, file), 'utf8');
    if (!/<svg\b[^>]*\bviewBox="[^"]+"/i.test(svg)) fail(`${file} lacks viewBox`);
    if (!/<title\b[^>]*>/i.test(svg) || !/<desc\b[^>]*>/i.test(svg)) fail(`${file} lacks title/description`);
    if (!/role="img"/i.test(svg) || !/aria-labelledby="[^"]+"/i.test(svg)) fail(`${file} lacks accessible image semantics`);
    if (/<(?:script|image)\b/i.test(svg)) fail(`${file} contains a prohibited script/image element`);
    if (/\b(?:href|xlink:href)\s*=/i.test(svg)) fail(`${file} contains an external reference`);
    if (/data:image/i.test(svg)) fail(`${file} contains embedded raster data`);
    if (/amazon|noon|logitech|anker|ugreen|havit|joyroom/i.test(svg)) fail(`${file} contains a third-party mark/name`);
  }

  const guide = await readFile(resolve(root, 'brand/BRAND_GUIDE.md'), 'utf8');
  if (!guide.includes('Fix the friction. Keep the gear.')) fail('Brand guide is missing the exact tagline');
  for (const term of ['Primary', 'Reverse', 'Monochrome', 'Small-size', 'Clear space', '24px']) {
    if (!guide.toLowerCase().includes(term.toLowerCase())) fail(`Brand guide is missing required rule: ${term}`);
  }

  const voice = await readFile(resolve(root, 'brand/VOICE_AND_EDITORIAL.md'), 'utf8');
  for (const pattern of [
    /affiliate disclosure/i,
    /DIRECT_LINK — AFFILIATE ID REQUIRED/,
    /AFFILIATE_LINK — VERIFIED/,
    /LINK DISABLED — REVIEW REQUIRED/,
    /Check current price on \[retailer\]/i,
    /compatibility warning/i,
    /words to avoid/i,
  ]) {
    if (!pattern.test(voice)) fail(`Voice guide failed required pattern ${pattern}`);
  }

  const creative = await readFile(resolve(root, 'brand/CREATIVE_SYSTEM.md'), 'utf8');
  const actualSlots = [...creative.matchAll(/^### Slot: `([^`]+)`$/gm)].map((match) => match[1]);
  if (JSON.stringify(actualSlots) !== JSON.stringify(requiredSlots)) {
    fail(`Creative slots must match the exact approved set; found ${actualSlots.join(', ')}`);
  }
  for (const slot of requiredSlots) {
    const block = creative.split(`### Slot: \`${slot}\``)[1]?.split('\n### Slot: `')[0] ?? '';
    if (!/\*\*Exact generation prompt:\*\*/.test(block)) fail(`${slot} lacks an exact generation prompt`);
    if (!/\*\*Shot direction:\*\*/.test(block)) fail(`${slot} lacks shot direction`);
    if (!/\*\*Alt-text direction:\*\*/.test(block)) fail(`${slot} lacks alt-text direction`);
    if (!/\*\*Rights status:\*\* `ORIGINAL`/.test(block)) fail(`${slot} must be ORIGINAL`);
  }
  if (!/image-rights checklist/i.test(creative)) fail('Creative system lacks image-rights checklist');
  if (!/no (?:brand|retailer) logos?/i.test(creative)) fail('Creative system lacks explicit logo exclusion');
  if (!/no (?:prices?|price)/i.test(creative)) fail('Creative system lacks embedded-price exclusion');
}

if (errors.length > 0) {
  console.error('Brand validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('Brand validation passed: 7 required artifacts, 2 safe accessible SVGs, 10 original creative slots, and complete token/voice safeguards.');
}
