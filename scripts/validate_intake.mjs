// Validates data/product-intake.json against the intake rules. Hand-rolled to match
// the repo's dependency-free style (see validate_research.mjs). Exports helpers for tests;
// run directly to validate the queue file (optionally pass a path).
//   node scripts/validate_intake.mjs [path]

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  STATUS, PRIORITY, DELEGATION_STATE, DELEGATION_KEYS, IMAGE_RIGHTS, INTAKE_ID_RE,
} from './intake-constants.mjs';

const isIsoDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v);
const nonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;

export function validateIntakeItem(item, index = 0) {
  const e = [];
  const at = `item[${index}]${item?.intakeId ? ` ${item.intakeId}` : ''}`;
  if (typeof item !== 'object' || item === null) return [`${at}: not an object`];

  if (!INTAKE_ID_RE.test(item.intakeId || '')) e.push(`${at}: intakeId must match IN-YYYY-NNNN`);
  if (!nonEmpty(item.name)) e.push(`${at}: name is required`);
  if (!nonEmpty(item.category)) e.push(`${at}: category is required`);
  if (!PRIORITY.includes(item.priority)) e.push(`${at}: priority must be ${PRIORITY.join('|')}`);
  if (!STATUS.includes(item.status)) e.push(`${at}: status must be one of ${STATUS.join('|')}`);
  if (!isIsoDate(item.createdAt)) e.push(`${at}: createdAt must be an ISO date`);

  if (!Array.isArray(item.providers) || item.providers.length === 0) {
    e.push(`${at}: at least one provider is required`);
  } else {
    item.providers.forEach((p, i) => {
      const pa = `${at}.providers[${i}]`;
      if (!nonEmpty(p.retailer)) e.push(`${pa}: retailer is required`);
      if (!/^https?:\/\//.test(p.productUrl || '')) e.push(`${pa}: productUrl must be an http(s) URL`);
      if (!nonEmpty(p.affiliateKeyRef)) e.push(`${pa}: affiliateKeyRef is required`);
      else if (/http/i.test(p.affiliateKeyRef))
        e.push(`${pa}: affiliateKeyRef must be a vault key, not a URL (found "http")`);
    });
  }

  if (item.images !== undefined) {
    if (!Array.isArray(item.images)) e.push(`${at}: images must be an array`);
    else
      item.images.forEach((im, i) => {
        if (!['reference', 'original'].includes(im.kind)) e.push(`${at}.images[${i}]: bad kind`);
        if (!IMAGE_RIGHTS.includes(im.imageRights)) e.push(`${at}.images[${i}]: bad imageRights`);
      });
  }

  if (item.delegations !== undefined) {
    for (const k of Object.keys(item.delegations)) {
      if (!DELEGATION_KEYS.includes(k)) e.push(`${at}.delegations: unknown key "${k}"`);
      else if (!DELEGATION_STATE.includes(item.delegations[k]))
        e.push(`${at}.delegations.${k}: must be ${DELEGATION_STATE.join('|')}`);
    }
  }
  return e;
}

export function validateIntakeArray(items) {
  if (!Array.isArray(items)) return ['intake file must be a JSON array'];
  const errors = [];
  const ids = new Set();
  items.forEach((item, i) => {
    errors.push(...validateIntakeItem(item, i));
    if (item?.intakeId) {
      if (ids.has(item.intakeId)) errors.push(`item[${i}]: duplicate intakeId ${item.intakeId}`);
      ids.add(item.intakeId);
    }
  });
  return errors;
}

// ---- CLI --------------------------------------------------------------------
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const path = process.argv[2] || new URL('../data/product-intake.json', import.meta.url);
  let items;
  try {
    items = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    console.error(`intake: cannot read/parse ${path}: ${err.message}`);
    process.exit(1);
  }
  const errors = validateIntakeArray(items);
  if (errors.length) {
    console.error('intake: validation FAILED\n  ' + errors.join('\n  '));
    process.exit(1);
  }
  console.log(`intake: ${items.length} item(s) valid`);
}
