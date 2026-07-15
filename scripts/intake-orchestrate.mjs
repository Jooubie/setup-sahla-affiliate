// Orchestrator CLI — the deterministic dispatch/reconcile the Product Manager owns.
//
//   node scripts/intake-orchestrate.mjs dispatch [IN-xxxx|--all]   mark new items dispatched + request delegations
//   node scripts/intake-orchestrate.mjs reconcile [IN-xxxx|--all]  fold agent signals into flags; advance to ready
//   node scripts/intake-orchestrate.mjs status                     print the queue
//
// Dispatch and reconcile are pure logic (no LLM), so they are safe to automate. The
// substantive agent work (research, images, marketing) is done by the sahla-* agents,
// which read the queue and signal completion in their own lanes. Promotion into canonical
// data stays a Product Manager decision (see FileIntakeSource.promote) and is not automated here.

import { readFileSync } from 'node:fs';
import { FileIntakeSource } from './intake-source.mjs';
import { DELEGATION_KEYS, INTAKE_FILE } from './intake-constants.mjs';

const [, , cmd, arg] = process.argv;
const src = new FileIntakeSource();

async function run() {
  switch (cmd) {
    case 'dispatch': {
      const pending = arg && arg !== '--all' ? [await src.get(arg)].filter(Boolean) : await src.listPending();
      if (!pending.length) return console.log('intake: nothing to dispatch');
      for (const it of pending) {
        const r = await src.dispatch(it.intakeId);
        console.log(`dispatched ${r.intakeId} (${r.name})`);
      }
      return;
    }
    case 'reconcile': {
      const targets = await src.reconcile(arg && arg !== '--all' ? arg : undefined);
      for (const it of targets) {
        console.log(`${it.intakeId} ${it.status}  [${DELEGATION_KEYS.map((k) => `${k}:${it.delegations?.[k] || '-'}`).join(' ')}]`);
      }
      return;
    }
    case 'status': {
      const items = JSON.parse(readFileSync(new URL('../' + INTAKE_FILE, import.meta.url), 'utf8'));
      if (!items.length) return console.log('intake: queue empty');
      for (const it of items) console.log(`${it.intakeId} ${it.status.padEnd(11)} ${it.name}`);
      return;
    }
    default:
      console.error('usage: intake-orchestrate.mjs <dispatch|reconcile|status> [IN-xxxx|--all]');
      process.exit(1);
  }
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
