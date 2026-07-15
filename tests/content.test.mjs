import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  ARTICLE_CONTRACTS,
  DIRECT_LINK_DISCLOSURE,
  parseArticle,
  validateContent,
} from '../scripts/validate_content.mjs';

const root = resolve(import.meta.dirname, '..');
const articlePaths = Object.values(ARTICLE_CONTRACTS).map((contract) => contract.file);

async function loadLaunchContent() {
  const [mapText, ...articleTexts] = await Promise.all([
    readFile(resolve(root, 'content/editorial-map.json'), 'utf8'),
    ...articlePaths.map((file) => readFile(resolve(root, file), 'utf8')),
  ]);
  return {
    editorialMap: JSON.parse(mapText),
    articles: articleTexts.map((text, index) => parseArticle(text, articlePaths[index])),
  };
}

test('all three launch guides pass the publication contract', async () => {
  const content = await loadLaunchContent();
  assert.doesNotThrow(() => validateContent(content));
});
test('frontmatter is complete, dated, descriptive, and evidence-bound', async () => {
  const { articles } = await loadLaunchContent();
  for (const article of articles) {
    const { frontmatter } = article;
    assert.equal(frontmatter.publishedAt, '2026-07-15');
    assert.equal(frontmatter.reviewedAt, '2026-07-15');
    assert.equal(frontmatter.author, 'Setup Sahla Editorial');
    assert.equal(frontmatter.disclosureMode, 'DIRECT_LINK — AFFILIATE ID REQUIRED');
    assert.ok(frontmatter.description.length <= 160, `${article.file} description exceeds 160 characters`);
    assert.equal(frontmatter.secondaryKeywords.length, 3, `${article.file} needs exactly three secondary keywords`);
    assert.ok(frontmatter.evidenceIds.length >= 5, `${article.file} needs a traceable evidence set`);
    assert.match(frontmatter.image, /^\/assets\/generated\/setup-sahla-blog-[a-z0-9-]+\.png$/);
    assert.ok(frontmatter.imageAlt.length >= 35);
  }
});

test('each guide is substantial, scannable, linked, and FAQ-ready', async () => {
  const { articles, editorialMap } = await loadLaunchContent();
  for (const article of articles) {
    assert.ok(article.wordCount >= 1200 && article.wordCount <= 1800, `${article.file} word count is ${article.wordCount}`);
    assert.ok(article.h2.length >= 5, `${article.file} needs descriptive H2 sections`);
    assert.ok(article.internalLinks.length >= 3, `${article.file} needs at least three internal links`);
    assert.ok(article.externalLinks.length >= 1 && article.externalLinks.length <= 2, `${article.file} needs one or two direct-source links`);
    assert.ok(article.faqs.length >= 3, `${article.file} needs at least three FAQ answers`);

    const mapEntry = editorialMap.articles.find((item) => item.sourceFile === article.file);
    assert.ok(mapEntry, `${article.file} is missing from the editorial map`);
    assert.deepEqual(mapEntry.internalLinks, article.internalLinks, `${article.file} internal-link map drift`);
    assert.deepEqual(mapEntry.faq, article.faqs, `${article.file} FAQ map drift`);
    assert.deepEqual(mapEntry.evidenceIds, article.frontmatter.evidenceIds, `${article.file} evidence map drift`);
  }
});

test('retailer links cannot precede the direct-link disclosure', () => {
  const unsafe = `---\ntitle: Unsafe\n---\n[Retailer](https://www.amazon.eg/-/en/dp/B0BQLLB61B)\n${DIRECT_LINK_DISCLOSURE}`;
  assert.throws(() => parseArticle(unsafe, 'unsafe.md'), /retailer disclosure must appear before/i);
});

test('unsupported outcome, hype, affiliate, and M650 claims are rejected', async () => {
  const { articles, editorialMap } = await loadLaunchContent();
  const base = articles[0];
  for (const phrase of [
    'guaranteed results',
    'best overall',
    'lowers laptop temperature',
    'improves your posture',
    'residue-free adhesive',
    'M650 quiet clicks',
    'M650 vertical mouse',
    'we earn a Noon Egypt commission',
  ]) {
    const altered = articles.map((article) => article.file === base.file
      ? parseArticle(`${article.raw}\n\n${phrase}`, article.file)
      : article);
    assert.throws(
      () => validateContent({ articles: altered, editorialMap }),
      /unsupported or prohibited claim/i,
      `validator must reject: ${phrase}`,
    );
  }
});
