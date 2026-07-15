import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  ARTICLE_CONTRACTS,
  DIRECT_LINK_DISCLOSURE,
  loadResearchContext,
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
    assert.ok(existsSync(resolve(root, frontmatter.image.slice(1))), `${article.file} image must exist`);
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
    assert.ok(
      article.links.some((link) => link.label === mapEntry.primaryCta.label && link.href === mapEntry.primaryCta.href),
      `${article.file} primary CTA must be an intended internal link`,
    );
  }
  assert.equal(
    new Set(editorialMap.articles.map((entry) => entry.funnelRole)).size,
    editorialMap.articles.length,
    'funnel roles must be unique',
  );
});

test('retailer links cannot precede the direct-link disclosure', () => {
  const unsafe = `---\ntitle: Unsafe\n---\n[Retailer](https://www.amazon.eg/-/en/dp/B0BQLLB61B)\n${DIRECT_LINK_DISCLOSURE}`;
  assert.throws(() => parseArticle(unsafe, 'unsafe.md'), /retailer disclosure must appear before/i);
});

test('unsupported claim mutation families are rejected', async () => {
  const { articles, editorialMap } = await loadLaunchContent();
  const base = articles[0];
  const families = {
    hype: ['guaranteed results', 'best overall'],
    quietClicks: ['The M650 delivers silent clicks.', 'The mouse clicks silently.'],
    thermalOutcome: ['The pad lowers laptop temperature.', 'The cooling pad improves thermal performance.', 'It keeps the laptop cooler.'],
    adhesion: ['The organizer is residue-free.', 'The clips leave no residue.', 'The clips stick permanently.'],
    noonMonetization: ['Setup Sahla earns money from Noon Egypt links.', 'Noon Egypt links are monetized.'],
    ergonomicTherapeutic: ['The M650 relieves wrist strain.', 'The mouse provides wrist pain relief.', 'This ergonomic mouse protects your wrist.', 'It delivers therapeutic benefits.'],
    modelIdentity: ['M650 vertical mouse'],
  };
  for (const [family, phrases] of Object.entries(families)) {
    for (const phrase of phrases) {
      const altered = articles.map((article) => article.file === base.file
        ? parseArticle(`${article.raw}\n\n${phrase}`, article.file)
        : article);
      assert.throws(
        () => validateContent({ articles: altered, editorialMap }),
        /unsupported or prohibited claim/i,
        `${family} validator must reject: ${phrase}`,
      );
    }
  }
});

test('every body evidence ID must be declared for the future source renderer', async () => {
  const { articles, editorialMap } = await loadLaunchContent();
  const hub = articles.find((article) => article.file.endsWith('usb-c-hub-buying-guide.md'));
  const altered = articles.map((article) => article.file === hub.file
    ? parseArticle(`${article.raw}\n\nAdditional source [Evidence: PP-E035]`, article.file)
    : article);
  assert.throws(
    () => validateContent({ articles: altered, editorialMap }),
    /body evidence PP-E035 must be declared for source rendering/i,
  );
});

test('keyword metadata must use same-route dated EG qualitative source records', async () => {
  const { articles, editorialMap } = await loadLaunchContent();
  const mutations = [
    ['same-route', (context) => { context.keywordRows.find((row) => row.keyword === 'laptop desk setup').assigned_route = '/wrong/'; }],
    ['EG evidence', (context) => { context.keywordRows.find((row) => row.keyword === 'laptop desk setup').locale = 'MENA'; }],
    ['remain qualitative', (context) => { context.keywordRows.find((row) => row.keyword === 'laptop desk setup').metric_unit = 'monthly searches'; }],
    ['direct HTTPS source', (context) => { context.keywordRows.find((row) => row.keyword === 'laptop desk setup').source_url = ''; }],
    ['valid source date', (context) => { context.keywordRows.find((row) => row.keyword === 'laptop desk setup').captured_at_utc = '2026-02-30T00:00:00Z'; }],
    ['evidence must be same-route', (context) => { context.evidenceRows.find((row) => row.evidence_id === 'SEO-KW-031').used_by = '/wrong/'; }],
  ];
  for (const [message, mutate] of mutations) {
    const researchContext = structuredClone(loadResearchContext());
    mutate(researchContext);
    assert.throws(
      () => validateContent({ articles, editorialMap, researchContext }),
      new RegExp(message, 'i'),
      `keyword mutation should fail: ${message}`,
    );
  }

  const workflow = articles.find((article) => article.file.endsWith('thermal-posture-cable-workflow.md'));
  const wrongRouteArticles = articles.map((article) => article.file === workflow.file
    ? { ...article, frontmatter: { ...article.frontmatter, secondaryKeywords: ['laptop running hot and slow', 'laptop running hot and loud', 'laptop cooling pad'] } }
    : article);
  assert.throws(
    () => validateContent({ articles: wrongRouteArticles, editorialMap }),
    /keyword laptop cooling pad must be same-route/i,
  );
});

test('missing images, duplicate funnel roles, and invalid primary CTAs fail', async () => {
  const { articles, editorialMap } = await loadLaunchContent();
  const base = articles[0];
  const missingImageArticles = articles.map((article) => article.file === base.file
    ? { ...article, frontmatter: { ...article.frontmatter, image: '/assets/generated/missing-content-image.png' } }
    : article);
  assert.throws(
    () => validateContent({ articles: missingImageArticles, editorialMap }),
    /image file is missing/i,
  );

  const duplicateRoles = structuredClone(editorialMap);
  duplicateRoles.articles[1].funnelRole = duplicateRoles.articles[0].funnelRole;
  assert.throws(
    () => validateContent({ articles, editorialMap: duplicateRoles }),
    /funnel roles must be unique/i,
  );

  const invalidCta = structuredClone(editorialMap);
  invalidCta.articles[0].primaryCta.href = '/missing-destination/';
  assert.throws(
    () => validateContent({ articles, editorialMap: invalidCta }),
    /primary CTA must match an intended internal article link/i,
  );
});
