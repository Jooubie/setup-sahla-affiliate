import { readFileSync } from 'node:fs';

const files = [
  {
    path: 'docs/business/LAUNCH_PLAN.md',
    sections: ['## Launch decision', '## Value proposition', '## Audiences and jobs to be done', '## Acquisition loops', '## Launch checklist', '## Risk register'],
  },
  {
    path: 'docs/business/AFFILIATE_ACTIVATION.md',
    sections: ['## Activation states', '## Amazon Egypt Associates activation', '## Noon Egypt decision', '## Link governance', '## Owner inputs'],
  },
  {
    path: 'docs/business/90_DAY_OPERATING_PLAN.md',
    sections: ['## Days 1–30', '## Days 31–60', '## Days 61–90', '## Recurring operating rhythm', '## Owner inputs'],
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
  'does not establish Egypt commission eligibility',
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

const forbidden = [
  /guaranteed income/i,
  /expected commission/i,
  /projected revenue/i,
  /industry average/i,
  /Noon Egypt[^\n]*(?:commission-ready|(?<!non-)monetized|earns commission)/i,
  /current public terms[^\n]*Egypt[^\n]*(?:eligible|covered)(?![^\n]*not)/i,
];

for (const pattern of forbidden) {
  if (pattern.test(combined)) errors.push(`business docs: forbidden or unsupported wording ${pattern}`);
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
