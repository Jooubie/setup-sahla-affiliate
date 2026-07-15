import assert from 'node:assert/strict';
import { existsSync, readFile, readFileSync } from 'node:fs';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const readFileAsync = promisify(readFile);
const rootUrl = new URL('../', import.meta.url);

export const DIRECT_LINK_DISCLOSURE = '**Link disclosure:** Buying links on this page currently go directly to the retailer.';

export const ARTICLE_CONTRACTS = {
  diagnostic: {
    file: 'content/blogs/desk-setup-diagnostic.md',
    primaryKeyword: 'laptop desk setup',
    slug: '/guides/fix-laptop-desk-setup-egypt/',
    slugTerms: ['laptop', 'desk', 'setup'],
    image: '/assets/generated/setup-sahla-blog-desk-setup-diagnostic.png',
  },
  hub: {
    file: 'content/blogs/usb-c-hub-buying-guide.md',
    primaryKeyword: 'how to choose usb c hub',
    slug: '/guides/choose-usb-c-hub-egypt/',
    slugTerms: ['choose', 'usb', 'c', 'hub'],
    image: '/assets/generated/setup-sahla-blog-usb-c-hub-guide.png',
  },
  workflow: {
    file: 'content/blogs/thermal-posture-cable-workflow.md',
    primaryKeyword: 'laptop running hot',
    slug: '/guides/laptop-heat-posture-cable-fixes/',
    slugTerms: ['laptop', 'heat'],
    image: '/assets/generated/setup-sahla-blog-thermal-posture-cable-workflow.png',
  },
};

const prohibitedPatterns = [
  /\bbest overall\b/i,
  /\b(?:number one|ultimate|perfect|flawless|fastest|coolest|cheapest|unbeatable)\b/i,
  /\bguaranteed(?: results?)?\b/i,
  /\b(?:future-proof|works with everything|must-buy|must buy|no-brainer)\b/i,
  /\b(?:lowers?|reduces?|drops?|decreases?|cuts?) (?:the )?(?:(?:laptop|device|CPU|GPU) )?(?:temperature|heat|thermals?)\b/i,
  /\bkeeps? (?:the |your )?(?:laptop|device|CPU|GPU) (?:cool|cooler)\b|\bruns? cooler\b/i,
  /\bimproves? (?:the )?(?:(?:laptop|device) )?(?:thermals?|thermal performance|cooling performance)\b/i,
  /\bimproves? (?:your )?posture\b/i,
  /\b(?:cures?|treats?|relieves?) (?:pain|carpal tunnel)\b/i,
  /\b(?:relieves?|reduces?|prevents?|treats?|eases?) (?:your )?(?:(?:wrist|hand|arm|shoulder|neck) )?(?:pain|strain|fatigue|discomfort)\b/i,
  /\bprovides? (?:(?:wrist|hand|arm|shoulder|neck) )?(?:pain )?relief\b|\b(?:protects?|supports?|aligns?) (?:your|the) wrist\b/i,
  /\b(?:clinically|medically) ergonomic\b|\btherapeutic (?:benefits?|results?|relief)\b/i,
  /\b(?:residue[- ]free|leaves? no residue|without residue|sticks? permanently|permanent(?:ly)? adheres?|guaranteed adhesion|safe for (?:all|every) desks?)\b/i,
  /\b(?:quiet|silent|noise-free) (?:clicks?|buttons?|mouse)\b|\b(?:mouse|buttons?|clicks?) (?:clicks? )?(?:quietly|silently)\b/i,
  /\bM650\s+(?:(?:has|offers|delivers)\s+|is\s+(?:an?\s+)?)?(?:quiet(?:er)? clicks?|vertical mouse)\b/i,
  /\b(?:we|Setup Sahla) (?:earn|earns|receive|receives|make|makes|collect|collects)[^\n.]{0,45}(?:commission|money|revenue)[^\n.]{0,45}Noon Egypt\b/i,
  /\bNoon Egypt[^\n.]{0,55}(?:links? (?:are|is) monetized|affiliate (?:links?|program) (?:is|are) active|commission (?:is|are) available)\b/i,
  /\bNoon Egypt[^\n.]{0,40}(?:affiliate eligible|affiliate eligibility confirmed|commission eligible)\b/i,
  /\b(?:search volume|keyword difficulty|sales volume)\s*(?:is|of|:)?\s*\d/i,
  /\b(?:we|Setup Sahla) (?:hands-on )?tested\b|\bour benchmark\b/i,
];

function unquote(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseFrontmatter(block) {
  const result = {};
  let currentList = null;
  for (const line of block.split(/\r?\n/)) {
    const item = line.match(/^\s{2}-\s+(.*)$/);
    if (item && currentList) {
      result[currentList].push(unquote(item[1]));
      continue;
    }
    const field = line.match(/^([A-Za-z][A-Za-z0-9]*):(?:\s*(.*))?$/);
    if (!field) continue;
    const [, key, raw = ''] = field;
    if (raw.trim() === '') {
      result[key] = [];
      currentList = key;
    } else {
      result[key] = unquote(raw);
      currentList = null;
    }
  }
  return result;
}

function uniqueInOrder(values) {
  return [...new Set(values)];
}

function extractLinks(body) {
  const links = [...body.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((match) => ({
    label: match[1].trim(),
    href: match[2],
  }));
  return {
    all: links,
    internal: uniqueInOrder(links.filter(({ href }) => href.startsWith('/')).map(({ href }) => href)),
    external: uniqueInOrder(links.filter(({ href }) => /^https:\/\//.test(href)).map(({ href }) => href)),
  };
}

function extractFaqs(body) {
  const section = body.match(/^## FAQ\s*$([\s\S]*?)(?=^##\s|(?![\s\S]))/m)?.[1] ?? '';
  const matches = [...section.matchAll(/^### (.+\?)\s*\n+([\s\S]*?)(?=^###\s|(?![\s\S]))/gm)];
  return matches.map((match) => ({
    question: match[1].trim(),
    answer: match[2].trim().replace(/\s+/g, ' '),
  }));
}

function countWords(body) {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .match(/[\p{L}\p{N}][\p{L}\p{N}'’@+./-]*/gu)?.length ?? 0;
}

export function parseArticle(raw, file) {
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/);
  assert.ok(match, `${file} needs YAML frontmatter`);
  const frontmatter = parseFrontmatter(match[1]);
  const body = match[2].trim();

  const retailerMatches = [...body.matchAll(/https:\/\/(?:www\.)?(?:amazon\.eg|noon\.com)\//gi)];
  if (retailerMatches.length) {
    const disclosureIndex = body.indexOf(DIRECT_LINK_DISCLOSURE);
    assert.ok(
      disclosureIndex >= 0 && disclosureIndex < retailerMatches[0].index,
      `${file}: retailer disclosure must appear before the first retailer link`,
    );
  }

  const links = extractLinks(body);
  return {
    file,
    raw,
    frontmatter,
    body,
    wordCount: countWords(body),
    h2: [...body.matchAll(/^## (.+)$/gm)].map((item) => item[1].trim()),
    links: links.all,
    internalLinks: links.internal,
    externalLinks: links.external,
    faqs: extractFaqs(body),
  };
}

export function parseCsv(text) {
  const records = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      row.push(field.replace(/\r$/, ''));
      records.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }
  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ''));
    records.push(row);
  }
  assert.equal(quoted, false, 'content research CSV contains an unterminated quoted field');
  const [headers, ...rows] = records.filter((record) => record.some((value) => value !== ''));
  assert.ok(headers, 'content research CSV needs a header');
  return rows.map((record, rowIndex) => {
    assert.equal(record.length, headers.length, `content research CSV row ${rowIndex + 2} column count`);
    return Object.fromEntries(headers.map((header, index) => [header, record[index]]));
  });
}

export function loadResearchContext() {
  return {
    keywordRows: parseCsv(readFileSync(new URL('../research/keywords.csv', import.meta.url), 'utf8')),
    evidenceRows: parseCsv(readFileSync(new URL('../research/evidence.csv', import.meta.url), 'utf8')),
  };
}

function isStrictIsoUtcTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) return false;
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.valueOf())) return false;
  const normalized = value.includes('.') ? value : value.replace('Z', '.000Z');
  return parsed.toISOString() === normalized.replace(/\.(\d)Z$/, '.$100Z').replace(/\.(\d{2})Z$/, '.$10Z');
}

function assertKeywordRouting(frontmatter, file, researchContext) {
  for (const keyword of [frontmatter.primaryKeyword, ...frontmatter.secondaryKeywords]) {
    const keywordRow = researchContext.keywordRows.find((row) => row.keyword === keyword);
    assert.ok(keywordRow, `${file}: keyword record missing for ${keyword}`);
    assert.equal(keywordRow.assigned_route, frontmatter.slug, `${file}: keyword ${keyword} must be same-route`);
    assert.equal(keywordRow.locale, 'EG', `${file}: keyword ${keyword} must use EG evidence`);
    assert.equal(keywordRow.metric_unit, 'qualitative', `${file}: keyword ${keyword} must remain qualitative`);
    assert.equal(keywordRow.metric_value, 'returned', `${file}: keyword ${keyword} must use a returned record`);
    assert.ok(keywordRow.source_name.trim(), `${file}: keyword ${keyword} needs a named source`);
    assert.match(keywordRow.source_url, /^https:\/\//, `${file}: keyword ${keyword} needs a direct HTTPS source`);
    assert.ok(isStrictIsoUtcTimestamp(keywordRow.captured_at_utc), `${file}: keyword ${keyword} needs a valid source date`);

    const evidenceId = keywordRow.notes.match(/\bevidence (SEO-KW-\d{3})\b/)?.[1];
    assert.ok(evidenceId, `${file}: keyword ${keyword} needs a stable evidence ID`);
    assert.ok(frontmatter.evidenceIds.includes(evidenceId), `${file}: keyword evidence ${evidenceId} must be declared`);
    const evidenceRow = researchContext.evidenceRows.find((row) => row.evidence_id === evidenceId);
    assert.ok(evidenceRow, `${file}: canonical keyword evidence ${evidenceId} is missing`);
    assert.equal(evidenceRow.query_or_item, keyword, `${file}: ${evidenceId} keyword drift`);
    assert.equal(evidenceRow.used_by, frontmatter.slug, `${file}: ${evidenceId} evidence must be same-route`);
    assert.equal(evidenceRow.market, 'EG', `${file}: ${evidenceId} evidence must use EG market`);
    assert.equal(evidenceRow.metric_unit, 'qualitative', `${file}: ${evidenceId} evidence must remain qualitative`);
    assert.equal(evidenceRow.metric_value, 'returned', `${file}: ${evidenceId} evidence must be returned`);
    assert.equal(evidenceRow.source_name, keywordRow.source_name, `${file}: ${evidenceId} source-name drift`);
    assert.equal(evidenceRow.source_url, keywordRow.source_url, `${file}: ${evidenceId} source-URL drift`);
    assert.equal(evidenceRow.captured_at_utc, keywordRow.captured_at_utc, `${file}: ${evidenceId} source-date drift`);
  }
}

function assertNoUnsupportedClaims(article) {
  for (const pattern of prohibitedPatterns) {
    assert.doesNotMatch(article.body, pattern, `${article.file}: unsupported or prohibited claim (${pattern})`);
  }
}

function validateArticle(article, contract, mapEntry, researchContext) {
  const fm = article.frontmatter;
  const requiredFields = [
    'title', 'slug', 'description', 'primaryKeyword', 'secondaryKeywords', 'publishedAt', 'reviewedAt',
    'author', 'image', 'imageAlt', 'evidenceIds', 'disclosureMode',
  ];
  for (const field of requiredFields) assert.ok(fm[field]?.length, `${article.file}: frontmatter.${field} is required`);

  assert.equal(fm.slug, contract.slug, `${article.file}: route drift`);
  assert.equal(fm.primaryKeyword, contract.primaryKeyword, `${article.file}: primary keyword drift`);
  assert.ok(existsSync(new URL(`../${fm.image.replace(/^\//, '')}`, import.meta.url)), `${article.file}: image file is missing`);
  assert.equal(fm.image, contract.image, `${article.file}: image slot drift`);
  assert.equal(fm.description.length <= 160, true, `${article.file}: meta description must be at most 160 characters`);
  assert.equal(fm.publishedAt, '2026-07-15');
  assert.equal(fm.reviewedAt, '2026-07-15');
  assert.equal(fm.author, 'Setup Sahla Editorial');
  assert.equal(fm.disclosureMode, 'DIRECT_LINK — AFFILIATE ID REQUIRED');
  assert.equal(fm.secondaryKeywords.length, 3, `${article.file}: use three secondary keywords`);
  assert.ok(fm.imageAlt.length >= 35, `${article.file}: image alt text is too thin`);
  assert.ok(fm.evidenceIds.length >= 5, `${article.file}: source notes need at least five evidence IDs`);
  assert.equal(new Set(fm.evidenceIds).size, fm.evidenceIds.length, `${article.file}: evidence IDs must be unique`);
  const knownEvidence = new Set(researchContext.evidenceRows.map((row) => row.evidence_id));
  for (const id of fm.evidenceIds) assert.ok(knownEvidence.has(id), `${article.file}: unknown evidence ID ${id}`);
  const bodyEvidenceIds = uniqueInOrder(
    [...article.body.matchAll(/\b(?:PP-E\d{3}|SEO-KW-\d{3}|SEO-SERP-\d{3}|AFF-\d{3})\b/g)].map((match) => match[0]),
  );
  for (const id of bodyEvidenceIds) {
    assert.ok(fm.evidenceIds.includes(id), `${article.file}: body evidence ${id} must be declared for source rendering`);
  }
  assertKeywordRouting(fm, article.file, researchContext);

  const primary = fm.primaryKeyword.toLowerCase();
  const firstWords = article.body.split(/\s+/).slice(0, 220).join(' ').toLowerCase();
  assert.ok(fm.title.toLowerCase().includes(primary), `${article.file}: primary keyword must appear in title`);
  assert.ok(fm.description.toLowerCase().includes(primary), `${article.file}: primary keyword must appear in description`);
  assert.ok(firstWords.includes(primary), `${article.file}: primary keyword must appear in the introduction`);
  assert.ok(article.h2.some((heading) => heading.toLowerCase().includes(primary)), `${article.file}: primary keyword must appear in an H2`);
  for (const term of contract.slugTerms) assert.ok(fm.slug.includes(term), `${article.file}: slug needs keyword term ${term}`);
  for (const secondary of fm.secondaryKeywords) {
    assert.ok(article.body.toLowerCase().includes(secondary.toLowerCase()), `${article.file}: missing secondary keyword ${secondary}`);
  }

  assert.ok(article.wordCount >= 1200 && article.wordCount <= 1800, `${article.file}: word count ${article.wordCount} is outside 1200–1800`);
  assert.ok(article.h2.length >= 5, `${article.file}: needs at least five H2 sections`);
  assert.ok(article.internalLinks.length >= 3, `${article.file}: needs at least three internal links`);
  assert.ok(article.externalLinks.length >= 1 && article.externalLinks.length <= 2, `${article.file}: needs one or two direct-source links`);
  assert.ok(article.externalLinks.every((href) => !/amazon\.eg|noon\.com/i.test(href)), `${article.file}: guides should route retailer intent through internal product pages`);
  assert.ok(article.faqs.length >= 3, `${article.file}: needs at least three FAQ entries`);
  assert.match(article.body, /^## Evidence notes$/m, `${article.file}: needs an evidence notes section`);
  assertNoUnsupportedClaims(article);

  assert.ok(mapEntry, `${article.file}: editorial map entry missing`);
  assert.equal(mapEntry.sourceFile, article.file);
  assert.equal(mapEntry.targetRoute, fm.slug);
  assert.equal(mapEntry.primaryKeyword, fm.primaryKeyword);
  assert.ok(mapEntry.funnelRole && mapEntry.primaryCta?.label && mapEntry.primaryCta?.href);
  assert.match(mapEntry.primaryCta.href, /^\//, `${article.file}: primary CTA must be an internal route`);
  assert.ok(
    article.links.some((link) => link.href === mapEntry.primaryCta.href && link.label === mapEntry.primaryCta.label),
    `${article.file}: primary CTA must match an intended internal article link`,
  );
  assert.deepEqual(mapEntry.internalLinks, article.internalLinks, `${article.file}: internal link map drift`);
  assert.deepEqual(mapEntry.faq, article.faqs, `${article.file}: FAQ map drift`);
  assert.deepEqual(mapEntry.evidenceIds, fm.evidenceIds, `${article.file}: evidence map drift`);
}

export function validateContent({ articles, editorialMap, researchContext = loadResearchContext() }) {
  assert.equal(articles.length, 3, 'launch content must contain exactly three guides');
  assert.equal(editorialMap.version, '1.0');
  assert.equal(editorialMap.market, 'EG');
  assert.equal(editorialMap.articles.length, 3, 'editorial map must contain exactly three guides');
  const byFile = new Map(editorialMap.articles.map((entry) => [entry.sourceFile, entry]));
  assert.equal(byFile.size, 3, 'editorial map source files must be unique');
  assert.equal(
    new Set(editorialMap.articles.map((entry) => entry.funnelRole)).size,
    editorialMap.articles.length,
    'editorial map funnel roles must be unique',
  );
  for (const contract of Object.values(ARTICLE_CONTRACTS)) {
    const article = articles.find((item) => item.file === contract.file);
    assert.ok(article, `missing ${contract.file}`);
    validateArticle(article, contract, byFile.get(article.file), researchContext);
  }
  assert.equal(new Set(articles.map((article) => article.frontmatter.slug)).size, 3, 'guide slugs must be unique');
  return true;
}

async function main() {
  const contracts = Object.values(ARTICLE_CONTRACTS);
  const [mapText, ...texts] = await Promise.all([
    readFileAsync(new URL('../content/editorial-map.json', import.meta.url), 'utf8'),
    ...contracts.map((contract) => readFileAsync(new URL(`../${contract.file}`, import.meta.url), 'utf8')),
  ]);
  const articles = texts.map((text, index) => parseArticle(text, contracts[index].file));
  validateContent({ articles, editorialMap: JSON.parse(mapText) });
  console.log(`validate_content: ${articles.length} launch guides passed (${fileURLToPath(rootUrl)})`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
