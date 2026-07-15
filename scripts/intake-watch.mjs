// Intake watcher — the automation. Watches the intake file (and the agent signal files)
// and runs the deterministic orchestrator steps so adding a product auto-dispatches and
// completed agent work auto-advances, with no manual command.
//
//   node scripts/intake-watch.mjs            (or: npm run intake:watch)
//
// On any change it runs `dispatch` (new -> dispatched) then `reconcile` (fold signals -> ready).
// Optionally, if INTAKE_AGENT_CMD is set, it runs that command after dispatch to kick off the
// real LLM agents (e.g. a headless `claude -p` invocation) — opt-in, so the core automation
// stays dependency-free and testable.

import { watch, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { INTAKE_FILE, SIGNAL_FILES } from './intake-constants.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const runNode = (args) => {
  try {
    const out = execFileSync('node', args, { cwd: ROOT, encoding: 'utf8' });
    if (out.trim()) console.log(out.trim());
  } catch (e) {
    console.error(e.stdout?.toString() || e.message);
  }
};

let timer = null;
function tick(reason) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    console.log(`\nintake-watch: ${reason} -> orchestrate`);
    runNode(['scripts/intake-orchestrate.mjs', 'dispatch', '--all']);
    if (process.env.INTAKE_AGENT_CMD) {
      try {
        execFileSync(process.env.INTAKE_AGENT_CMD, { cwd: ROOT, stdio: 'inherit', shell: true });
      } catch (e) {
        console.error('intake-watch: INTAKE_AGENT_CMD failed:', e.message);
      }
    }
    runNode(['scripts/intake-orchestrate.mjs', 'reconcile', '--all']);
  }, 300); // debounce rapid successive writes
}

const targets = [INTAKE_FILE, ...Object.values(SIGNAL_FILES)];
for (const rel of targets) {
  const p = path.join(ROOT, rel);
  const dir = path.dirname(p);
  if (!existsSync(dir)) continue;
  watch(dir, (_evt, filename) => {
    if (filename && p.endsWith(filename)) tick(`${rel} changed`);
  });
}

console.log('intake-watch: watching the intake queue + agent signals. Ctrl-C to stop.');
tick('startup sweep');
