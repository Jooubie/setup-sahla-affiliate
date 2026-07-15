#!/usr/bin/env node
// Setup Sahla Vault Protocol engine.
// One dependency-free tool with five modes:
//   seal          recompute checksums of canonical files -> .vault/integrity.manifest.json
//   verify        recompute and compare against the sealed manifest (tamper check)
//   secrets-scan  fail if a secret file is tracked or a secret pattern appears (--staged for pre-commit)
//   gate          compliance invariants (5 products / 3 guides / affiliate + image enums / dated prices) + verify
//   guard         PreToolUse hook mode: read a tool call on stdin, block writes outside an agent's lane
//
// Exit codes: 0 = pass/allow, 1 = check failed, 2 = guard blocked the tool call.

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const abs = (r) => path.join(ROOT, r);
const read = (r) => readFileSync(abs(r), 'utf8');
const readJson = (r) => JSON.parse(read(r));

const IGNORED_DIRS = new Set([
  '.git', 'node_modules', 'dist', 'build', '.wrangler', '.vinext', '.next', '.cache', '.worktrees', '.astro', 'work',
]);

const AFFILIATE_ENUM = [
  'DIRECT_LINK — AFFILIATE ID REQUIRED',
  'AFFILIATE_LINK — VERIFIED',
  'LINK DISABLED — REVIEW REQUIRED',
];
const IMAGE_RIGHTS_ENUM = ['ORIGINAL', 'MANUFACTURER_PERMISSION_REVIEWED', 'AFFILIATE_API', 'SOURCE_LINK_ONLY'];

const config = existsSync(abs('.vault/vault.config.json'))
  ? readJson('.vault/vault.config.json')
  : {
      sealGlobs: ['data/**/*.json', 'research/**/*.csv'],
      protectedFromAgents: [
        '.vault/integrity.manifest.json',
        '.vault/secrets.local.json',
        '.vault/vault.config.json',
        '.vault/agent-lanes.json',
      ],
      secretFilesNeverTracked: ['.vault/secrets.local.json', '.env', '.env.local'],
      secretScanExempt: [
        'scripts/vault.mjs',
        'docs/business-os/VAULT_PROTOCOL.md',
        '.vault/secrets.example.json',
        '.vault/README.md',
      ],
    };

// ---- tiny glob (supports ** and *) -----------------------------------------
function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        re += '.*';
        i++;
        if (glob[i + 1] === '/') i++;
      } else {
        re += '[^/]*';
      }
    } else if ('/.+^${}()|[]\\'.includes(c)) {
      re += '\\' + c;
    } else {
      re += c;
    }
  }
  return new RegExp('^' + re + '$');
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), out);
    } else if (entry.isFile()) {
      out.push(rel(path.join(dir, entry.name)));
    }
  }
  return out;
}

function filesMatching(globs) {
  const res = globs.map(globToRegExp);
  return walk(ROOT).filter((f) => res.some((r) => r.test(f))).sort();
}

function sha256(r) {
  return createHash('sha256').update(readFileSync(abs(r))).digest('hex');
}

// ---- modes ------------------------------------------------------------------
function seal() {
  const files = filesMatching(config.sealGlobs);
  const entries = {};
  for (const f of files) entries[f] = sha256(f);
  const manifest = { sealedFiles: files.length, globs: config.sealGlobs, checksums: entries };
  writeFileSync(abs('.vault/integrity.manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`vault: sealed ${files.length} canonical file(s) -> .vault/integrity.manifest.json`);
  return 0;
}

function verify() {
  if (!existsSync(abs('.vault/integrity.manifest.json'))) {
    console.error('vault: no integrity manifest. Run "node scripts/vault.mjs seal" first.');
    return 1;
  }
  const manifest = readJson('.vault/integrity.manifest.json');
  const current = filesMatching(manifest.globs || config.sealGlobs);
  const problems = [];
  for (const [f, expected] of Object.entries(manifest.checksums)) {
    if (!existsSync(abs(f))) problems.push(`MISSING  ${f}`);
    else if (sha256(f) !== expected) problems.push(`CHANGED  ${f}`);
  }
  for (const f of current) if (!(f in manifest.checksums)) problems.push(`NEW      ${f} (unsealed)`);
  if (problems.length) {
    console.error('vault: integrity check FAILED\n  ' + problems.join('\n  '));
    console.error('\nIf the change is intentional and verified, re-seal: node scripts/vault.mjs seal');
    return 1;
  }
  console.log(`vault: integrity OK (${Object.keys(manifest.checksums).length} files match)`);
  return 0;
}

function gitTracked() {
  try {
    return execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch {
    return null;
  }
}

function secretsScan(staged) {
  const problems = [];
  const tracked = gitTracked();

  // 1. secret files must never be tracked
  if (tracked) {
    for (const secretFile of config.secretFilesNeverTracked) {
      if (tracked.includes(secretFile)) problems.push(`TRACKED SECRET FILE: ${secretFile} must never be committed`);
    }
  }

  // 2. high-confidence secret patterns
  // Boundaries + tight char classes so ordinary slug text (e.g. "desk-setup") never matches a key.
  const patterns = [
    [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key id'],
    [/(?<![A-Za-z0-9])sk-proj-[A-Za-z0-9]{32,}/, 'OpenAI project key'],
    [/(?<![A-Za-z0-9])sk-ant-[A-Za-z0-9-]{24,}/, 'Anthropic API key'],
    [/(?<![A-Za-z0-9])sk-[A-Za-z0-9]{48,}/, 'OpenAI secret key'],
    [/\bAIza[0-9A-Za-z_-]{35}\b/, 'Google API key'],
    [/\bxox[baprs]-[0-9A-Za-z-]{10,}\b/, 'Slack token'],
    [/-----BEGIN (?:RSA |EC |OPENSSH |DSA |)PRIVATE KEY-----/, 'private key block'],
    [/\btag=[a-z0-9]+-2[0-9]\b/, 'Amazon associate tag (belongs in the vault, not source)'],
  ];

  let scanList;
  if (staged && tracked !== null) {
    try {
      scanList = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACM'], {
        cwd: ROOT,
        encoding: 'utf8',
      })
        .split('\n')
        .filter(Boolean);
    } catch {
      scanList = [];
    }
  } else {
    scanList = tracked || walk(ROOT);
  }

  for (const f of scanList) {
    if (config.secretScanExempt.includes(f)) continue;
    if (!existsSync(abs(f))) continue;
    if (statSync(abs(f)).size > 2_000_000) continue; // skip large binaries
    let text;
    try {
      text = readFileSync(abs(f), 'utf8');
    } catch {
      continue;
    }
    if (/[\u0000-\u0008]/.test(text)) continue; // control byte -> binary, skip
    for (const [re, label] of patterns) {
      if (re.test(text)) problems.push(`SECRET PATTERN (${label}) in ${f}`);
    }
  }

  if (problems.length) {
    console.error('vault: secret scan FAILED\n  ' + problems.join('\n  '));
    return 1;
  }
  console.log(`vault: secret scan OK (${scanList.length} file(s) checked)`);
  return 0;
}

function gate() {
  const problems = [];
  const products = readJson('data/products.json');
  if (!Array.isArray(products) || products.length !== 5)
    problems.push(`products.json must hold exactly 5 products (found ${products.length})`);

  const map = readJson('content/editorial-map.json');
  if (!Array.isArray(map.articles) || map.articles.length !== 3)
    problems.push(`editorial-map.json must hold exactly 3 guides (found ${map.articles?.length})`);

  for (const p of products) {
    for (const pr of p.providers || []) {
      const where = `${p.slug} / ${pr.retailer}`;
      if (!AFFILIATE_ENUM.includes(pr.affiliateStatus))
        problems.push(`invalid affiliateStatus at ${where}: ${JSON.stringify(pr.affiliateStatus)}`);
      if (!IMAGE_RIGHTS_ENUM.includes(pr.imageRights))
        problems.push(`invalid imageRights at ${where}: ${JSON.stringify(pr.imageRights)}`);
      if (pr.affiliateStatus === 'AFFILIATE_LINK — VERIFIED' && !pr.affiliateUrl)
        problems.push(`${where}: status VERIFIED but affiliateUrl is empty`);
      if (pr.priceEgp != null && !/^\d{4}-\d{2}-\d{2}/.test(String(pr.capturedAt || '')))
        problems.push(`${where}: price present without a dated capturedAt snapshot`);
    }
  }

  if (problems.length) {
    console.error('vault: compliance gate FAILED\n  ' + problems.join('\n  '));
    return 1;
  }
  const integrity = verify();
  if (integrity !== 0) return 1;
  console.log('vault: compliance gate OK (5 products, 3 guides, enums + dated prices valid)');
  return 0;
}

async function guard() {
  // fail-open: any unexpected input allows the call so the vault never bricks a session
  let payload;
  try {
    const chunks = [];
    for await (const c of process.stdin) chunks.push(c);
    payload = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    return 0;
  }
  try {
    const ti = payload.tool_input || {};
    const target = ti.file_path || ti.notebook_path || ti.path;
    if (!target) return 0;
    const targetRel = path.relative(ROOT, path.resolve(ROOT, target)).split(path.sep).join('/');
    if (targetRel.startsWith('..')) return 0; // outside repo, not our concern

    const unlocked = process.env.VAULT_UNLOCK === '1';

    // (a) sealed governance files: blocked for everyone unless explicitly unlocked
    if (!unlocked && config.protectedFromAgents.includes(targetRel)) {
      block(`Vault: ${targetRel} is a sealed governance file. Set VAULT_UNLOCK=1 to change it deliberately.`);
      return 2;
    }

    // (b) per-agent lane enforcement, active only when SAHLA_AGENT identifies the running agent
    const agent = process.env.SAHLA_AGENT;
    if (agent) {
      const lanes = existsSync(abs('.vault/agent-lanes.json')) ? readJson('.vault/agent-lanes.json') : {};
      const lane = lanes[agent];
      if (!lane) {
        block(`Vault: unknown agent "${agent}" (no lane defined in .vault/agent-lanes.json).`);
        return 2;
      }
      if ((lane.deny || []).includes(targetRel)) {
        block(`Vault: ${agent} may not write ${targetRel} (owned by another agent).`);
        return 2;
      }
      const allowed =
        (lane.files || []).includes(targetRel) ||
        (lane.prefixes || []).some((pre) => targetRel === pre.replace(/\/$/, '') || targetRel.startsWith(pre));
      if (!allowed) {
        block(
          `Vault: ${agent} is out of its lane writing ${targetRel}.\n` +
            `Allowed: ${[...(lane.prefixes || []), ...(lane.files || [])].join(', ')}\n` +
            `Return the change to the owning agent instead of editing across lanes.`
        );
        return 2;
      }
    }
    return 0;
  } catch {
    return 0; // fail-open on any internal error
  }
}

function block(reason) {
  process.stderr.write(reason + '\n');
}

// ---- dispatch ---------------------------------------------------------------
const mode = process.argv[2];
const flag = process.argv[3];
let code = 0;
switch (mode) {
  case 'seal':
    code = seal();
    break;
  case 'verify':
    code = verify();
    break;
  case 'secrets-scan':
    code = secretsScan(flag === '--staged');
    break;
  case 'gate':
    code = gate();
    break;
  case 'guard':
    code = await guard();
    break;
  default:
    console.error('usage: node scripts/vault.mjs <seal|verify|secrets-scan [--staged]|gate|guard>');
    code = 1;
}
process.exit(code);
