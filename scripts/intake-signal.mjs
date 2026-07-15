// Agent completion signal — how sahla-research / sahla-creative / marketing report progress
// on an intake item WITHOUT writing the orchestrator-owned intake file.
//
//   node scripts/intake-signal.mjs <research|creative|marketing> <IN-xxxx> <requested|in-progress|done|skipped>
//
// It writes ONLY the calling agent's own-lane signal file (see SIGNAL_FILES). The orchestrator's
// reconcile step folds these into the intake delegation flags. This keeps every agent inside its
// vault lane while still driving the shared queue.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SIGNAL_FILES, DELEGATION_STATE, DELEGATION_KEYS, INTAKE_ID_RE } from './intake-constants.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const [, , agent, intakeId, state] = process.argv;

if (!DELEGATION_KEYS.includes(agent)) fail(`agent must be one of ${DELEGATION_KEYS.join('|')}`);
if (!INTAKE_ID_RE.test(intakeId || '')) fail('intakeId must match IN-YYYY-NNNN');
if (!DELEGATION_STATE.includes(state)) fail(`state must be ${DELEGATION_STATE.join('|')}`);

const file = path.join(ROOT, SIGNAL_FILES[agent]);
let map = {};
if (existsSync(file)) {
  try {
    map = JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    map = {};
  }
}
map[intakeId] = state;
mkdirSync(path.dirname(file), { recursive: true });
writeFileSync(file, JSON.stringify(map, null, 2) + '\n');
console.log(`intake: ${agent} signalled ${intakeId} = ${state} -> ${SIGNAL_FILES[agent]}`);

function fail(msg) {
  console.error('intake-signal: ' + msg);
  process.exit(1);
}
