# Setup Sahla Vault Protocol

The Vault Protocol protects the four things this business cannot afford to get wrong: its **secrets**, the **integrity of its verified data**, the **boundaries between its agents**, and the **compliance gates** that decide what may ship. It pairs a written contract (this document) with working enforcement (`scripts/vault.mjs`, `.vault/`, the git pre-commit hook, and the Claude Code guard hook).

It sits under the [operating system](OPERATING_SYSTEM.md) and [evidence & compliance policy](EVIDENCE_AND_COMPLIANCE.md): those define *what is correct*; the Vault Protocol makes correctness *hard to break by accident*.

---

## 1. Secrets vault

**Rule:** No affiliate ID, API key, account credential, or token ever lives in a tracked file. Secrets live only in `.vault/secrets.local.json`, which is gitignored.

- Template: `.vault/secrets.example.json` (committed, placeholders only).
- Real values: `.vault/secrets.local.json` (gitignored — you create and fill it).
- **Claude and the agents never read secret values.** The vault defines *where* secrets live and *how* the business references them; supplying the value is always an owner action, per the account-security boundary.
- Enforcement: `node scripts/vault.mjs secrets-scan` fails if a secret file is tracked or a high-confidence key pattern (AWS/OpenAI/Anthropic/Google/Slack keys, private-key blocks, Amazon associate tags) appears in a scanned file. It runs on every commit via the pre-commit hook (`--staged`).

Flipping a provider to `AFFILIATE_LINK — VERIFIED` (with a real `affiliateUrl`) is an **owner** action taken after the deep link is checked — never an agent's, and never inferred.

## 2. Canonical data integrity

**Rule:** The crown-jewel files — everything under `data/` and every `research/**/*.csv` — carry a checksum. Any change is either sealed deliberately or flagged as tampering.

- `node scripts/vault.mjs seal` computes SHA-256 for each sealed file into `.vault/integrity.manifest.json` (committed, so git history is the tamper log).
- `node scripts/vault.mjs verify` recomputes and reports `CHANGED`, `MISSING`, or `NEW (unsealed)` files.
- Workflow: after a **verified** canonical change (e.g. the product-manager agent updates `products.json` from passed evidence), run `seal` and commit the refreshed manifest alongside the change. An unsealed change blocks commits.
- **Last-verified rollback:** tag a known-good state with `git tag verified/YYYY-MM-DD` after a green `gate`. Rollback restores that tag, matching the operating system's "restore the last verified build" rule.

## 3. Agent boundary enforcement

**Rule:** Each agent writes only its own lane (as defined in [the agent README](../../.claude/agents/README.md)). The soft, instruction-level boundary is backed by a hard guard.

- Lane map: `.vault/agent-lanes.json` mirrors the ownership table.
- Guard: `.claude/settings.json` registers a `PreToolUse` hook (`node scripts/vault.mjs guard`) on `Edit|Write|MultiEdit|NotebookEdit`.
- The guard **always** blocks edits to sealed governance files (`integrity.manifest.json`, `vault.config.json`, `agent-lanes.json`, `secrets.local.json`) unless `VAULT_UNLOCK=1` is set for that action.
- The guard enforces **per-agent lanes only when `SAHLA_AGENT` names the running agent.** Set it when you invoke an agent for real enforcement:

  ```bash
  SAHLA_AGENT=sahla-research   claude   # research agent is now locked to research/*
  ```

  With no `SAHLA_AGENT`, lane enforcement is off (normal maintainer sessions are unaffected); only the sealed-file protection stays on.
- The guard **fails open**: any unexpected/unparseable input allows the call, so the vault can never brick a session. It fails *closed* only on a confirmed violation.

> Honest limit: a Claude Code hook cannot always independently prove which subagent is running, so lane enforcement is keyed on the `SAHLA_AGENT` variable you set. It is a strong guard, not a cryptographic sandbox. The always-on sealed-file protection needs no variable.

## 4. Compliance gate lock

**Rule:** Nothing publishes while the load-bearing invariants are broken. `node scripts/vault.mjs gate` checks, and the pre-commit hook enforces:

1. Exactly **5** products in `data/products.json`.
2. Exactly **3** guides in `content/editorial-map.json`.
3. Every provider `affiliateStatus` is one of the three allowed enum values.
4. Every provider `imageRights` is one of the four allowed values.
5. A provider marked `AFFILIATE_LINK — VERIFIED` has a real `affiliateUrl`.
6. Every provider price has a dated `capturedAt` snapshot.
7. Integrity `verify` passes.

A failure names the exact product/provider so the owning agent can fix it at the earliest responsible gate.

---

## Installation (one time)

```bash
git config core.hooksPath .githooks     # activate the pre-commit gate
node scripts/vault.mjs seal             # create the first integrity manifest
cp .vault/secrets.example.json .vault/secrets.local.json   # then fill real values
```

The Claude Code guard hook (`.claude/settings.json`) activates automatically at the next session start.

## Daily use

| Situation | Command |
|-----------|---------|
| Changed canonical data on purpose | `npm run vault:seal`, then commit the manifest |
| Check nothing was tampered | `npm run vault:verify` |
| Before a publish/refresh | `npm run vault:gate` |
| Run an agent under lane lock | `SAHLA_AGENT=<agent-name> claude` |
| Deliberately edit a sealed file | prefix the action with `VAULT_UNLOCK=1` |
| Emergency commit, skip the gate | `git commit --no-verify` (records the bypass in your own discipline) |

## What the vault does not do

It does not store or transmit secret values, encrypt files at rest, or replace the operating system's human gate sign-offs. It reduces accidental leaks, silent data tampering, cross-lane edits, and non-compliant publishes — it does not defeat a determined insider with shell access.
