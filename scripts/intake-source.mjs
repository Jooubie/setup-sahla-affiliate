// IntakeSource port + file-backed implementation.
//
// The orchestrator depends only on this interface, never on the concrete store, so a
// Supabase adapter can be swapped in later (the SaaS step) without touching orchestration.
//
// IntakeSource (the port):
//   listPending()                 -> IntakeItem[]  (status === 'new')
//   get(id)                       -> IntakeItem | null
//   setStatus(id, status)         -> void
//   setDelegation(id, agent, s)   -> void
//   dispatch(id)                  -> IntakeItem     (status 'new' -> 'dispatched', flags 'requested')
//   reconcile(id?)                -> IntakeItem[]    (fold agent signals into delegation flags)
//   promote(id, canonicalRecord)  -> IntakeItem     (gate-checked bridge into canonical data)

import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { STATUS, DELEGATION_KEYS, DELEGATION_STATE, INTAKE_FILE, INTAKE_LOG, SIGNAL_FILES } from './intake-constants.mjs';

const DEFAULT_ROOT = fileURLToPath(new URL('../', import.meta.url));

export class FileIntakeSource {
  constructor({ root = DEFAULT_ROOT, file = INTAKE_FILE, gateRunner, writeCanonical, clock } = {}) {
    this.root = root;
    this.file = path.join(root, file);
    this.clock = clock || (() => new Date().toISOString());
    // Default gate = the real vault gate; injectable so tests don't shell out.
    this.gateRunner =
      gateRunner ||
      (() => {
        try {
          execFileSync('node', ['scripts/vault.mjs', 'gate'], { cwd: root, stdio: 'pipe' });
          return true;
        } catch {
          return false;
        }
      });
    // Writing canonical data is deliberately not defaulted: promotion into products.json is
    // a considered act (it must preserve the exactly-5 invariant), so the caller supplies it.
    this.writeCanonical = writeCanonical || null;
  }

  _all() {
    return JSON.parse(readFileSync(this.file, 'utf8'));
  }

  _save(items) {
    const tmp = this.file + '.tmp';
    writeFileSync(tmp, JSON.stringify(items, null, 2) + '\n');
    renameSync(tmp, this.file); // atomic single-writer
  }

  _log(line) {
    const p = path.join(this.root, INTAKE_LOG);
    if (!existsSync(p)) {
      mkdirSync(path.dirname(p), { recursive: true });
      writeFileSync(p, '# Product intake log\n\n');
    }
    appendFileSync(p, `- ${this.clock()} ${line}\n`);
  }

  _mutate(id, fn) {
    const items = this._all();
    const it = items.find((i) => i.intakeId === id);
    if (!it) throw new Error(`intake: no item ${id}`);
    fn(it);
    this._save(items);
    return it;
  }

  async listPending() {
    return this._all().filter((i) => i.status === 'new');
  }

  async get(id) {
    return this._all().find((i) => i.intakeId === id) || null;
  }

  async setStatus(id, status) {
    if (!STATUS.includes(status)) throw new Error(`intake: bad status ${status}`);
    return this._mutate(id, (it) => {
      it.status = status;
    });
  }

  async setDelegation(id, agent, state) {
    if (!DELEGATION_KEYS.includes(agent)) throw new Error(`intake: bad agent ${agent}`);
    if (!DELEGATION_STATE.includes(state)) throw new Error(`intake: bad delegation state ${state}`);
    return this._mutate(id, (it) => {
      it.delegations = it.delegations || {};
      it.delegations[agent] = state;
    });
  }

  // status 'new' -> 'dispatched'; request every delegation not already set.
  async dispatch(id) {
    const it = this._mutate(id, (it) => {
      if (it.status !== 'new') return;
      it.status = 'dispatched';
      it.delegations = it.delegations || {};
      for (const k of DELEGATION_KEYS) if (!it.delegations[k]) it.delegations[k] = 'requested';
    });
    this._log(`dispatched ${id} -> research/creative/marketing requested`);
    return it;
  }

  _readSignal(agent) {
    const p = path.join(this.root, SIGNAL_FILES[agent]);
    if (!existsSync(p)) return {};
    try {
      return JSON.parse(readFileSync(p, 'utf8'));
    } catch {
      return {};
    }
  }

  // Fold each agent's own-lane signal file into the intake delegation flags. When all
  // delegations are 'done'/'skipped' and the item is past dispatch, advance it to 'ready'.
  async reconcile(id) {
    const items = this._all();
    const targets = id ? items.filter((i) => i.intakeId === id) : items;
    const advanced = [];
    for (const it of targets) {
      if (['promoted', 'rejected', 'new'].includes(it.status)) continue;
      it.delegations = it.delegations || {};
      for (const agent of DELEGATION_KEYS) {
        const sig = this._readSignal(agent)[it.intakeId];
        if (sig && DELEGATION_STATE.includes(sig)) it.delegations[agent] = sig;
      }
      const settled = DELEGATION_KEYS.every((k) => ['done', 'skipped'].includes(it.delegations[k]));
      if (settled && it.status !== 'ready') {
        it.status = 'ready';
        advanced.push(it.intakeId);
      }
    }
    this._save(items);
    if (advanced.length) this._log(`reconciled -> ready: ${advanced.join(', ')}`);
    return targets;
  }

  // The one gate-checked bridge into canonical data.
  async promote(id, canonicalRecord) {
    if (!this.writeCanonical) throw new Error('intake: promote requires a writeCanonical function');
    if (!this.gateRunner()) throw new Error(`intake: promote refused for ${id} — vault gate failed`);
    this.writeCanonical(canonicalRecord);
    const it = this._mutate(id, (it) => {
      it.status = 'promoted';
      it.promotedProductId = canonicalRecord?.candidateId || canonicalRecord?.slug || null;
    });
    this._log(`promoted ${id} -> ${it.promotedProductId}`);
    return it;
  }
}
