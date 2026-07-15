import assert from 'node:assert/strict';
import { readFile, readFileSync } from 'node:fs';
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
  /\b(?:lowers?|reduces?) (?:the )?(?:laptop )?temperature\b/i,
  /\bimproves? (?:your )?posture\b/i,
  /\b(?:cures?|treats?|relieves?) (?:pain|carpal tunnel)\b/i,
  /\b(?:residue-free|sticks permanently|permanent adhesion)\b/i,
  /\bM650\s+(?:(?:has|offers|delivers)\s+|is\s+(?:an?\s+)?)?(?:quiet(?:er)? clicks?|vertical mouse)\b/i,
  /\b(?:we|Setup Sahla) earn(?:s)? (?:a )?Noon Egypt commission\b/i,
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
  const links = [...body.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1]);
  return {
    internal: uniqueInOrder(links.filter((href) => href.startsWith('/'))),
    external: uniqueInOrder(links.filter((href) => /^https:\/\//.test(href))),
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
    internalLinks: links.internal,
    externalLinks: links.external,
    faqs: extractFaqs(body),
  };
}

function evidenceIdSet() {
  const text = readFileSync(new URL('../research/evidence.csv', import.meta.url), 'utf8');
  return new Set(
    text.split(/\r?\n/).slice(1)
      .map((line) => line.match(/^"?([^",]+)"?,/)?.[1])
      .filter(Boolean),
  );
}

function assertNoUnsupportedClaims(article) {
  for (const pattern of prohibitedPatterns) {
    assert.doesNotMatch(article.body, pattern, `${article.file}: unsupported or prohibited claim (${pattern})`);
  }
}

function validateArticle(article, contract, mapEntry, knownEvidence) {
  const fm = article.frontmatter;
  const requiredFields = [
    'title', 'slug', 'description', 'primaryKeyword', 'secondaryKeywords', 'publishedAt', 'reviewedAt',
    'author', 'image', 'imageAlt', 'evidenceIds', 'disclosureMode',
  ];
  for (const field of requiredFields) assert.ok(fm[field]?.length, `${article.file}: frontmatter.${field} is required`);

  assert.equal(fm.slug, contract.slug, `${article.file}: route drift`);
  assert.equal(fm.primaryKeyword, contract.primaryKeyword, `${article.file}: primary keyword drift`);
  assert.equal(fm.image, contract.image, `${article.file}: image slot drift`);
  assert.equal(fm.description.length <= 160, true, `${article.file}: meta description must be at most 160 characters`);
  assert.equal(fm.publishedAt, '2026-07-15');
  assert.equal(fm.reviewedAt, '2026-07-15');
  assert.equal(fm.author, 'Setup Sahla Editorial');
  assert.equal(fm.disclosureMode, 'DIRECT_LINK — AFFILIATE ID REQUIRED');
  assert.equal(fm.secondaryKeywords.length, 3, `${article.file}: use three secondary keywords`);
  assert.ok(fm.imageAlt.length >= 35, `${article.file}: image alt text is too thin`);
  assert.ok(fm.evidenceIds.length >= 5, `${article.file}: source notes need at least five evidence IDs`);
  for (const id of fm.evidenceIds) assert.ok(knownEvidence.has(id), `${article.file}: unknown evidence ID ${id}`);

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
  assert.deepEqual(mapEntry.internalLinks, article.internalLinks, `${article.file}: internal link map drift`);
  assert.deepEqual(mapEntry.faq, article.faqs, `${article.file}: FAQ map drift`);
  assert.deepEqual(mapEntry.evidenceIds, fm.evidenceIds, `${article.file}: evidence map drift`);
}

export function validateContent({ articles, editorialMap }) {
  assert.equal(articles.length, 3, 'launch content must contain exactly three guides');
  assert.equal(editorialMap.version, '1.0');
  assert.equal(editorialMap.market, 'EG');
  assert.equal(editorialMap.articles.length, 3, 'editorial map must contain exactly three guides');
  const knownEvidence = evidenceIdSet();
  const byFile = new Map(editorialMap.articles.map((entry) => [entry.sourceFile, entry]));
  assert.equal(byFile.size, 3, 'editorial map source files must be unique');
  for (const contract of Object.values(ARTICLE_CONTRACTS)) {
    const article = articles.find((item) => item.file === contract.file);
    assert.ok(article, `missing ${contract.file}`);
    validateArticle(article, contract, byFile.get(article.file), knownEvidence);
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
