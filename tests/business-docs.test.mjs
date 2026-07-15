import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const docs = {
  launch: 'docs/business/LAUNCH_PLAN.md',
  affiliate: 'docs/business/AFFILIATE_ACTIVATION.md',
  operating: 'docs/business/90_DAY_OPERATING_PLAN.md',
  metrics: 'docs/business/METRICS_SCORECARD.md',
};

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('business documents pass the executable launch-readiness validator', () => {
  const result = spawnSync(process.execPath, ['scripts/validate_business_docs.mjs'], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /Business documents valid: 4 files/);
});

test('launch plan defines the Egypt-first campaign and commercial guardrails', () => {
  const body = read(docs.launch);

  for (const phrase of [
    'Fix the friction. Keep the gear.',
    'Egypt first',
    'Jobs to be done',
    'Acquisition loops',
    'Launch checklist',
    'Risk register',
    'Noon Egypt',
    'TARGET',
  ]) {
    assert.match(body, new RegExp(phrase, 'i'), `Missing launch-plan phrase: ${phrase}`);
  }

  assert.doesNotMatch(body, /guaranteed|best overall|live price/i);
});

test('affiliate runbook keeps unverified links direct and records owner inputs', () => {
  const body = read(docs.affiliate);

  for (const phrase of [
    'DIRECT_LINK — AFFILIATE ID REQUIRED',
    'AFFILIATE_LINK — VERIFIED',
    'LINK DISABLED — REVIEW REQUIRED',
    'Amazon Egypt Associates',
    'UAE and Saudi Arabia',
    'does not establish Egypt commission eligibility',
    'Owner input',
    'affiliate ID',
    'legal and tax',
  ]) {
    assert.match(body, new RegExp(phrase, 'i'), `Missing affiliate phrase: ${phrase}`);
  }

  assert.doesNotMatch(body, /Noon Egypt[^\n]*(earns commission|commission-ready|(?<!non-)monetized)/i);
});

test('operating plan covers a practical 30/60/90 calendar and refresh cadence', () => {
  const body = read(docs.operating);

  for (const phrase of [
    'Days 1–30',
    'Days 31–60',
    'Days 61–90',
    'every 14 days',
    'every 90 days',
    'failed link',
    'Owner input',
  ]) {
    assert.match(body, new RegExp(phrase, 'i'), `Missing operating-plan phrase: ${phrase}`);
  }
});

test('metrics scorecard separates targets from observations and avoids invented benchmarks', () => {
  const body = read(docs.metrics);

  for (const phrase of [
    'TARGET',
    'Baseline',
    'Measurement source',
    'affiliate link status',
    'No market benchmark',
    'Owner input',
  ]) {
    assert.match(body, new RegExp(phrase, 'i'), `Missing scorecard phrase: ${phrase}`);
  }

  assert.doesNotMatch(body, /industry average|expected commission|projected revenue/i);
});
