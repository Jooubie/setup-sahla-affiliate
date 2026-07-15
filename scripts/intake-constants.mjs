// Shared constants for the Product Intake pipeline. One source of truth for the
// enums, file locations, and per-agent signal files so every intake script agrees.

export const STATUS = [
  'new', 'dispatched', 'researching', 'images', 'drafting', 'ready', 'promoted', 'rejected', 'on-hold',
];
export const PRIORITY = ['low', 'medium', 'high'];
export const DELEGATION_STATE = ['requested', 'in-progress', 'done', 'skipped'];
export const DELEGATION_KEYS = ['research', 'creative', 'marketing'];
export const IMAGE_RIGHTS = ['ORIGINAL', 'MANUFACTURER_PERMISSION_REVIEWED', 'AFFILIATE_API', 'SOURCE_LINK_ONLY'];

export const INTAKE_FILE = 'data/product-intake.json';
export const INTAKE_LOG = '.superpowers/sdd/intake-log.md';

// Each agent signals completion by writing ONLY this file, which lives inside its
// own vault lane. The orchestrator reads them to reconcile delegation flags.
export const SIGNAL_FILES = {
  research: 'research/intake-status.json',
  creative: 'assets/generated/intake-status.json',
  marketing: 'docs/editorial/intake-status.json',
};

export const INTAKE_ID_RE = /^IN-\d{4}-\d{4}$/;
