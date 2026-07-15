import { readFileSync } from 'node:fs';

const files = [
  {
    path: 'docs/business/LAUNCH_PLAN.md',
    sections: ['## Launch decision', '### Publication and measurement gates', '## Value proposition', '## Audiences and jobs to be done', '## Acquisition loops', '## Launch checklist', '## Risk register'],
  },
  {
    path: 'docs/business/AFFILIATE_ACTIVATION.md',
    sections: ['## Activation states', '## Amazon Egypt Associates activation', '## Noon Egypt decision', '## Link governance', '## Owner inputs'],
  },
  {
    path: 'docs/business/90_DAY_OPERATING_PLAN.md',
    sections: ['## Publication and measurement gates', '## Days 1–30', '## Days 31–60', '## Days 61–90', '## Recurring operating rhythm', '## Owner inputs'],
  },
  {
    path: 'docs/business/METRICS_SCORECARD.md',
    sections: ['## Measurement rules', '## Launch scorecard', '## Decision rules', '## Owner inputs'],
  },
];

const errors = [];
const bodies = new Map();

for (const file of files) {
  let body;
  try {
    body = readFileSync(file.path, 'utf8');
  } catch (error) {
    errors.push(`${file.path}: cannot read (${error.code ?? error.message})`);
    continue;
  }

  bodies.set(file.path, body);
  if (body.length < 1_500) errors.push(`${file.path}: document is too short to be operational`);
  for (const section of file.sections) {
    if (!body.includes(section)) errors.push(`${file.path}: missing section ${section}`);
  }
}

const combined = [...bodies.values()].join('\n');
const requiredPhrases = [
  'Fix the friction. Keep the gear.',
  'DIRECT_LINK — AFFILIATE ID REQUIRED',
  'AFFILIATE_LINK — VERIFIED',
  'LINK DISABLED — REVIEW REQUIRED',
  'Unverified — public terms do not establish Egypt eligibility',
  'every 14 days',
  'every 90 days',
  '[OWNER INPUT REQUIRED — domain]',
  '[OWNER INPUT REQUIRED — analytics platform]',
  '[OWNER INPUT REQUIRED — email platform]',
  '[OWNER INPUT REQUIRED — Amazon Associates ID/tag]',
  '[OWNER INPUT REQUIRED — Noon Egypt eligibility confirmation]',
  '[OWNER INPUT REQUIRED — legal and tax review]',
];

for (const phrase of requiredPhrases) {
  if (!combined.includes(phrase)) errors.push(`business docs: missing required phrase ${phrase}`);
}

const requiredByDocument = new Map([
  ['docs/business/LAUNCH_PLAN.md', [
    'Publication gate:',
    'Measurement gate:',
    'Analytics and Search Console are not publication blockers.',
    'A failed link is contained immediately when detected',
    'within one business day',
  ]],
  ['docs/business/AFFILIATE_ACTIVATION.md', [
    'Policy sources reviewed: 2026-07-14 UTC',
    '### Phase A — pre-application',
    '### Phase B — enrollment',
    '### Phase C — post-enrollment tag setup',
    '#### Required Amazon Associate identification',
    'As an Amazon Associate I earn from qualifying purchases.',
    '#### Contextual commission disclosure',
    '#### Direct-link wording before activation',
    'Unverified — public terms do not establish Egypt eligibility',
    'target="_blank" rel="sponsored nofollow noopener noreferrer"',
    'Safe external-link rule: require HTTPS',
    'https://affiliate-program.amazon.eg/welcome',
    'https://affiliate-program.amazon.eg/help/operating/agreement',
    'https://affiliate-program.amazon.eg/help/operating/policies/',
    'https://affiliates.noon.com/en/terms',
  ]],
  ['docs/business/90_DAY_OPERATING_PLAN.md', [
    'Publication gate:',
    'Measurement gate: after publication',
    'Search Console is not a publication blocker.',
    'Set `LINK DISABLED — REVIEW REQUIRED` immediately',
    'Within one business day, complete incident documentation',
    'Unverified — public terms do not establish Egypt eligibility',
  ]],
  ['docs/business/METRICS_SCORECARD.md', [
    '| Failed-link CTA containment |',
    'TARGET: immediately upon detection, before further distribution',
    '| Failed-link incident documentation |',
    'TARGET: within one business day',
    'Unverified — public terms do not establish Egypt eligibility',
  ]],
]);

for (const [path, phrases] of requiredByDocument) {
  const body = bodies.get(path) ?? '';
  for (const phrase of phrases) {
    if (!body.includes(phrase)) errors.push(`${path}: missing invariant ${phrase}`);
  }
}

const forbidden = [
  /guaranteed income/i,
  /expected commission/i,
  /projected revenue/i,
  /industry average/i,
  /Noon Egypt[^\n]*(?:commission-ready|(?<!non-)monetized|earns commission)/i,
  /current public terms[^\n]*Egypt[^\n]*(?:eligible|covered)(?![^\n]*not)/i,
  /Not eligible\/unverified/i,
  /direct\/non-monetized/i,
  /Failed-link containment time/i,
  /Failed-link CTA containment[^\n]*TARGET: within one business day/i,
];

for (const pattern of forbidden) {
  if (pattern.test(combined)) errors.push(`business docs: forbidden or unsupported wording ${pattern}`);
}

const affiliate = bodies.get('docs/business/AFFILIATE_ACTIVATION.md') ?? '';
const phaseA = affiliate.indexOf('### Phase A — pre-application');
const phaseB = affiliate.indexOf('### Phase B — enrollment');
const phaseC = affiliate.indexOf('### Phase C — post-enrollment tag setup');
const amazonIdentification = affiliate.indexOf('#### Required Amazon Associate identification');
const contextualDisclosure = affiliate.indexOf('#### Contextual commission disclosure');
const directDisclosure = affiliate.indexOf('#### Direct-link wording before activation');

if (!(phaseA >= 0 && phaseB > phaseA && phaseC > phaseB)) {
  errors.push('docs/business/AFFILIATE_ACTIVATION.md: Amazon pre-application, enrollment, and post-enrollment phases are out of order');
}
if (phaseA >= 0 && phaseB > phaseA && /Amazon Associates ID\/tag/.test(affiliate.slice(phaseA, phaseB))) {
  errors.push('docs/business/AFFILIATE_ACTIVATION.md: pre-application phase must not request an Amazon Associates ID/tag');
}
if (phaseC >= 0 && !affiliate.slice(phaseC).includes('[OWNER INPUT REQUIRED — Amazon Associates ID/tag]')) {
  errors.push('docs/business/AFFILIATE_ACTIVATION.md: owner tag placeholder must occur after enrollment');
}
if (!(amazonIdentification >= 0 && contextualDisclosure > amazonIdentification && directDisclosure > contextualDisclosure)) {
  errors.push('docs/business/AFFILIATE_ACTIVATION.md: Amazon identification, contextual disclosure, and direct-link wording must be separate and ordered');
}
const amazonStatementCount = affiliate.split('As an Amazon Associate I earn from qualifying purchases.').length - 1;
if (amazonStatementCount !== 1) {
  errors.push('docs/business/AFFILIATE_ACTIVATION.md: required Amazon Associate identification must appear exactly once');
}

const scorecard = bodies.get('docs/business/METRICS_SCORECARD.md') ?? '';
for (const line of scorecard.split(/\r?\n/)) {
  if (!line.startsWith('|') || /^\|[- :|]+\|$/.test(line) || line.includes('| Metric |')) continue;
  const cells = line.split('|').map((cell) => cell.trim()).filter(Boolean);
  if (cells.length >= 5 && !cells[3].startsWith('TARGET:')) {
    errors.push(`docs/business/METRICS_SCORECARD.md: target cell must start with TARGET: (${cells[0]})`);
  }
}

if (errors.length) {
  console.error(`Business document validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Business documents valid: ${files.length} files`);
