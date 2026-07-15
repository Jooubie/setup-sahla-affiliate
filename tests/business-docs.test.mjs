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
  assert.doesNotMatch(body, /direct\/non-monetized|Not eligible\/unverified/i);
  assert.match(body, /Publication gate:[^\n]*public[^\n]*domain/i);
  assert.match(body, /Measurement gate:[^\n]*analytics[^\n]*Search Console/i);
  assert.match(body, /analytics and Search Console are not publication blockers/i);
  assert.match(body, /failed link[^\n]*immediately/i);
  assert.match(body, /one business day[^\n]*(documentation|follow-up)/i);
  assert.match(body, /Unverified — public terms do not establish Egypt eligibility/);
});

test('affiliate runbook keeps unverified links direct and records owner inputs', () => {
  const body = read(docs.affiliate);

  for (const phrase of [
    'DIRECT_LINK — AFFILIATE ID REQUIRED',
    'AFFILIATE_LINK — VERIFIED',
    'LINK DISABLED — REVIEW REQUIRED',
    'Amazon Egypt Associates',
    'UAE and Saudi Arabia',
    'Unverified — public terms do not establish Egypt eligibility',
    'Owner input',
    'affiliate ID',
    'legal and tax',
  ]) {
    assert.match(body, new RegExp(phrase, 'i'), `Missing affiliate phrase: ${phrase}`);
  }

  assert.doesNotMatch(body, /Noon Egypt[^\n]*(earns commission|commission-ready|(?<!non-)monetized)/i);
  assert.match(body, /As an Amazon Associate I earn from qualifying purchases\./);
  assert.match(body, /Required Amazon Associate identification/);
  assert.match(body, /Contextual commission disclosure/);
  assert.match(body, /Direct-link wording before activation/);

  const preApplication = body.indexOf('### Phase A — pre-application');
  const enrollment = body.indexOf('### Phase B — enrollment');
  const postEnrollment = body.indexOf('### Phase C — post-enrollment tag setup');
  assert.ok(preApplication >= 0 && enrollment > preApplication && postEnrollment > enrollment);
  assert.doesNotMatch(body.slice(preApplication, enrollment), /Amazon Associates ID\/tag/);
  assert.match(body.slice(postEnrollment), /\[OWNER INPUT REQUIRED — Amazon Associates ID\/tag\]/);

  assert.match(body, /Unverified — public terms do not establish Egypt eligibility/);
  assert.match(body, /rel="sponsored nofollow noopener noreferrer"/);
  assert.match(body, /target="_blank"/);
  assert.match(body, /HTTPS[^\n]*allowlist[^\n]*exact-model destination/i);
  assert.match(body, /Policy sources reviewed: 2026-07-14 UTC/);
  for (const url of [
    'https://affiliate-program.amazon.eg/welcome',
    'https://affiliate-program.amazon.eg/help/operating/agreement',
    'https://affiliate-program.amazon.eg/help/operating/policies/',
    'https://affiliates.noon.com/en/terms',
  ]) {
    assert.ok(body.includes(url), `Missing official policy URL: ${url}`);
  }
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

  assert.match(body, /Publication gate:[^\n]*public[^\n]*domain/i);
  assert.match(body, /Measurement gate:[^\n]*after publication[^\n]*analytics[^\n]*Search Console/i);
  assert.match(body, /Search Console is not a publication blocker/i);
  assert.match(body, /contain[^\n]*failed link[^\n]*immediately/i);
  assert.match(body, /one business day[^\n]*(documentation|follow-up)/i);
  assert.match(body, /Unverified — public terms do not establish Egypt eligibility/);
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
  assert.match(body, /\| Failed-link CTA containment \|[^\n]*\| TARGET: immediately/i);
  assert.match(body, /\| Failed-link incident documentation \|[^\n]*\| TARGET: within one business day/i);
  assert.match(body, /Unverified — public terms do not establish Egypt eligibility/);
});
