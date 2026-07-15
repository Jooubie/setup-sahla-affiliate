# `.vault/` — Setup Sahla Vault

Enforcement layer for the [Vault Protocol](../docs/business-os/VAULT_PROTOCOL.md). Full rules live in that document; this is the quick reference.

## Files

| File | Committed? | Purpose |
|------|-----------|---------|
| `vault.config.json` | yes | What to seal, what to protect, secret rules |
| `agent-lanes.json` | yes | Which paths each agent may write |
| `integrity.manifest.json` | yes | SHA-256 checksums of sealed canonical files |
| `secrets.example.json` | yes | Template showing the shape of secrets |
| `secrets.local.json` | **NO — gitignored** | Your real affiliate IDs / API keys. You create and fill this. |

## Commands (run from repo root)

```bash
npm run vault:gate     # compliance invariants + integrity (pre-publish)   [node scripts/vault.mjs gate]
npm run vault:verify   # tamper check against the sealed manifest          [node scripts/vault.mjs verify]
npm run vault:seal     # re-checksum canonical files after a verified change [node scripts/vault.mjs seal]
npm run vault:secrets  # fail if a secret file is tracked or a key leaks    [node scripts/vault.mjs secrets-scan]
```

## Secrets: how to set them up

1. `cp .vault/secrets.example.json .vault/secrets.local.json`
2. Fill your real values in `secrets.local.json` (it is gitignored — it never gets committed).
3. Claude/agents never read these values. When an affiliate link is verified, **you** — not an agent — flip the provider's `affiliateStatus` to `AFFILIATE_LINK — VERIFIED`.

## Overrides

Changing a sealed governance file (`integrity.manifest.json`, `vault.config.json`, `agent-lanes.json`, `secrets.local.json`) through Claude's edit tools is blocked by the guard hook. To change one deliberately, set `VAULT_UNLOCK=1` for that action.
