import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const outputDir = path.join(root, "deliverables");
const previewDir = path.join(here, "previews");
const workbookPath = path.join(outputDir, "Setup-Sahla-Launch-Workbook.xlsx");

const palette = {
  ink: "#101411",
  paper: "#E9DFCA",
  lime: "#C9FF4A",
  cyan: "#66D9E8",
  cream: "#FFFDF7",
  muted: "#59645D",
  rule: "#C8C1B3",
  warning: "#F3C666",
  danger: "#D34F4F",
};

const DIRECT_STATE = "DIRECT_LINK — AFFILIATE ID REQUIRED";
const NOON_STATE = "Unverified — public terms do not establish Egypt eligibility";

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  const headers = rows[0];
  return rows.slice(1).filter((r) => r.some((v) => v !== "")).map((r) => Object.fromEntries(headers.map((h, idx) => [h, r[idx] ?? ""])));
}

function excelCol(index) {
  let value = index + 1;
  let result = "";
  while (value) {
    const mod = (value - 1) % 26;
    result = String.fromCharCode(65 + mod) + result;
    value = Math.floor((value - 1) / 26);
  }
  return result;
}

function setColumns(sheet, widths) {
  widths.forEach((width, index) => {
    sheet.getRange(`${excelCol(index)}:${excelCol(index)}`).format.columnWidth = width;
  });
}

function styleTitle(sheet, endCol, title, subtitle) {
  const titleRange = sheet.getRange(`A1:${endCol}1`);
  titleRange.merge();
  titleRange.values = [[title]];
  titleRange.format = {
    fill: palette.ink,
    font: { name: "Bahnschrift Condensed", size: 22, bold: true, color: palette.cream },
    verticalAlignment: "center",
  };
  titleRange.format.rowHeight = 34;
  const subRange = sheet.getRange(`A2:${endCol}2`);
  subRange.merge();
  subRange.values = [[subtitle]];
  subRange.format = {
    fill: palette.paper,
    font: { name: "Segoe UI", size: 9, color: palette.ink },
    verticalAlignment: "center",
    wrapText: true,
  };
  subRange.format.rowHeight = 28;
  sheet.getRange(`A3:${endCol}3`).format.rowHeight = 9;
  sheet.showGridLines = false;
}

function styleHeader(range) {
  range.format = {
    fill: palette.ink,
    font: { name: "Segoe UI Semibold", size: 9, bold: true, color: palette.cream },
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "inside", style: "thin", color: "#47504A" },
  };
  range.format.rowHeight = 34;
}

function styleBody(range) {
  range.format = {
    font: { name: "Segoe UI", size: 8, color: palette.ink },
    verticalAlignment: "top",
    wrapText: true,
    borders: {
      insideHorizontal: { style: "thin", color: palette.rule },
    },
  };
}

function addTable(sheet, rangeAddress, name) {
  const table = sheet.tables.add(rangeAddress, true, name);
  table.showFilterButton = true;
  table.showBandedRows = true;
  return table;
}

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formulaString(value) {
  return String(value).replace(/"/g, '""');
}

async function dataUrl(filePath, mime = "image/jpeg") {
  const bytes = await fs.readFile(filePath);
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

const products = JSON.parse(await fs.readFile(path.join(root, "data/products.json"), "utf8"));
const editorial = JSON.parse(await fs.readFile(path.join(root, "content/editorial-map.json"), "utf8"));
const evidence = parseCsv(await fs.readFile(path.join(root, "research/evidence.csv"), "utf8"));
const keywords = parseCsv(await fs.readFile(path.join(root, "research/keywords.csv"), "utf8"));

const assetBySlug = {
  "anker-332-usb-c-hub": "anker-332-usb-c-hub.png",
  "ugreen-40289-laptop-stand": "ugreen-40289-laptop-stand.png",
  "havit-f2069-laptop-cooling-pad": "havit-f2069-laptop-cooling-pad.png",
  "joyroom-jr-zs368-cable-organizer": "joyroom-jr-zs368-cable-organizer.png",
  "logitech-signature-m650-mouse": "logitech-signature-m650-mouse.png",
};

const workbook = Workbook.create();
workbook.comments.setSelf({ displayName: "Setup Sahla" });

const dashboard = workbook.worksheets.add("Launch Dashboard");
const productsSheet = workbook.worksheets.add("Products");
const providersSheet = workbook.worksheets.add("Providers");
const keywordsSheet = workbook.worksheets.add("Keywords");
const evidenceSheet = workbook.worksheets.add("Evidence");
const contentSheet = workbook.worksheets.add("Content Map");
const ownerSheet = workbook.worksheets.add("Owner Actions");

// Products
styleTitle(productsSheet, "T", "SETUP SAHLA / SELECTED PRODUCTS", "Five launch products. Total score is formula-driven from seven visible components. Prices are dated EGP snapshots, not current-price claims.");
const productHeaders = ["Candidate ID", "Original visual", "Product", "Category", "Model", "Problem", "Verdict", "Price snapshot (EGP)", "Captured", "Primary keyword", "Total score", "Problem urgency", "Search intent", "Availability", "Value", "Compatibility", "Editorial fit", "Visual", "Route", "Closest rejected alternative"];
productsSheet.getRange("A5:T5").values = [productHeaders];
styleHeader(productsSheet.getRange("A5:T5"));
const productRows = products.map((p) => [
  p.candidateId,
  "ORIGINAL",
  p.name,
  p.category,
  p.model,
  p.problem,
  p.verdict,
  p.snapshotPriceEgp,
  toDate(p.priceCapturedAt),
  p.primaryKeyword.keyword,
  null,
  p.score.components.problemUrgency,
  p.score.components.searchIntent,
  p.score.components.availability,
  p.score.components.value,
  p.score.components.compatibility,
  p.score.components.editorialFit,
  p.score.components.visual,
  p.route,
  p.closestRejectedAlternative,
]);
productsSheet.getRange(`A6:T${5 + productRows.length}`).values = productRows;
for (let i = 0; i < productRows.length; i += 1) {
  const row = 6 + i;
  productsSheet.getRange(`K${row}`).formulas = [[`=SUM(L${row}:R${row})`]];
  productsSheet.getRange(`A${row}:T${row}`).format.rowHeight = 92;
  const thumbPath = path.join(root, "work/deliverables/thumbnails", assetBySlug[products[i].slug]);
  productsSheet.images.add({
    dataUrl: await dataUrl(thumbPath, "image/png"),
    anchor: { from: { row: row - 1, col: 1, rowOffsetPx: 5, colOffsetPx: 5 }, extent: { widthPx: 112, heightPx: 72 } },
  });
}
styleBody(productsSheet.getRange(`A6:T${5 + productRows.length}`));
productsSheet.getRange(`H6:H${5 + productRows.length}`).format.numberFormat = '"EGP" #,##0.00';
productsSheet.getRange(`I6:I${5 + productRows.length}`).format.numberFormat = "yyyy-mm-dd";
productsSheet.getRange(`K6:R${5 + productRows.length}`).format.numberFormat = "0";
productsSheet.getRange(`K6:K${5 + productRows.length}`).conditionalFormats.add("dataBar", { color: palette.lime, gradient: false });
addTable(productsSheet, `A5:T${5 + productRows.length}`, "SelectedProductsTable");
productsSheet.freezePanes.freezeRows(5);
productsSheet.freezePanes.freezeColumns(3);
setColumns(productsSheet, [14, 18, 29, 24, 19, 46, 58, 18, 13, 22, 12, 12, 12, 12, 10, 12, 12, 9, 30, 62]);

// Providers
styleTitle(providersSheet, "L", "SETUP SAHLA / PROVIDER REGISTRY", `All retailer links are ${DIRECT_STATE}. Noon Egypt affiliate eligibility remains unconfirmed; no commission claim is active.`);
const providerHeaders = ["Product ID", "Product", "Retailer", "Price (EGP)", "Captured", "Seller / stock / fulfillment caution", "Affiliate state", "Noon Egypt eligibility", "Open exact listing", "Exact direct URL", "Manufacturer source", "Manufacturer exact URL"];
providersSheet.getRange("A5:L5").values = [providerHeaders];
styleHeader(providersSheet.getRange("A5:L5"));
const providerRows = [];
const providerFormulas = [];
for (const product of products) {
  const manufacturerEvidence = product.evidence.find((e) => e.sourceUrl && !e.sourceUrl.includes("amazon.eg") && !e.sourceUrl.includes("noon.com")) ?? product.evidence[0];
  for (const provider of product.providers) {
    providerRows.push([
      product.candidateId,
      product.name,
      provider.retailer,
      provider.priceEgp,
      toDate(provider.capturedAt),
      provider.sellerNotes,
      provider.affiliateStatus,
      provider.retailer === "Noon Egypt" ? NOON_STATE : "Not applicable",
      null,
      provider.directUrl,
      null,
      manufacturerEvidence.sourceUrl,
    ]);
    providerFormulas.push([
      `=HYPERLINK("${formulaString(provider.directUrl)}","OPEN EXACT LISTING")`,
      `=HYPERLINK("${formulaString(manufacturerEvidence.sourceUrl)}","OPEN MANUFACTURER SOURCE")`,
    ]);
  }
}
const providerEnd = 5 + providerRows.length;
providersSheet.getRange(`A6:L${providerEnd}`).values = providerRows;
providerFormulas.forEach((formulas, index) => {
  const row = 6 + index;
  providersSheet.getRange(`I${row}`).formulas = [[formulas[0]]];
  providersSheet.getRange(`K${row}`).formulas = [[formulas[1]]];
});
styleBody(providersSheet.getRange(`A6:L${providerEnd}`));
providersSheet.getRange(`A6:L${providerEnd}`).format.rowHeight = 68;
providersSheet.getRange(`I6:I${providerEnd}`).format.wrapText = false;
providersSheet.getRange(`I6:I${providerEnd}`).format.font = { name: "Segoe UI Semibold", size: 8, bold: true, color: "#245C67", underline: true };
providersSheet.getRange(`K6:K${providerEnd}`).format.wrapText = false;
providersSheet.getRange(`K6:K${providerEnd}`).format.font = { name: "Segoe UI Semibold", size: 8, bold: true, color: "#245C67", underline: true };
providersSheet.getRange(`D6:D${providerEnd}`).format.numberFormat = '"EGP" #,##0.00';
providersSheet.getRange(`E6:E${providerEnd}`).format.numberFormat = "yyyy-mm-dd";
providersSheet.getRange(`G6:G${providerEnd}`).conditionalFormats.add("containsText", { text: "DIRECT_LINK", format: { fill: palette.paper, font: { bold: true, color: palette.ink } } });
providersSheet.getRange(`H6:H${providerEnd}`).conditionalFormats.add("containsText", { text: "Unverified", format: { fill: palette.warning, font: { bold: true, color: palette.ink } } });
addTable(providersSheet, `A5:L${providerEnd}`, "ProviderRegistryTable");
providersSheet.freezePanes.freezeRows(5);
providersSheet.freezePanes.freezeColumns(3);
setColumns(providersSheet, [13, 31, 15, 15, 13, 55, 31, 45, 24, 54, 28, 54]);

// Keywords
styleTitle(keywordsSheet, "N", "SETUP SAHLA / KEYWORD MAP", "Egypt-locale qualitative search-language evidence. Autocomplete presence is not search volume, difficulty, market share, or a trend-rate claim.");
const keywordHeaders = ["Keyword", "Locale", "Language", "Intent", "Problem cluster", "Metric", "Value", "Unit", "Trend direction", "Source", "Captured", "Assigned route", "Source URL", "Notes"];
keywordsSheet.getRange("A5:N5").values = [keywordHeaders];
styleHeader(keywordsSheet.getRange("A5:N5"));
const keywordRows = keywords.map((k) => [
  k.keyword,
  k.locale,
  k.language,
  k.intent,
  k.problem_cluster,
  k.metric_name,
  k.metric_value,
  k.metric_unit,
  k.trend_direction,
  k.source_name,
  toDate(k.captured_at_utc),
  k.assigned_route,
  k.source_url,
  k.notes,
]);
const keywordEnd = 5 + keywordRows.length;
keywordsSheet.getRange(`A6:N${keywordEnd}`).values = keywordRows;
styleBody(keywordsSheet.getRange(`A6:N${keywordEnd}`));
keywordsSheet.getRange(`A6:N${keywordEnd}`).format.rowHeight = 34;
keywordsSheet.getRange(`K6:K${keywordEnd}`).format.numberFormat = "yyyy-mm-dd hh:mm";
keywordsSheet.getRange(`M6:M${keywordEnd}`).format.font = { name: "Segoe UI", size: 8, color: "#245C67", underline: true };
keywordsSheet.getRange(`G6:G${keywordEnd}`).conditionalFormats.add("containsText", { text: "returned", format: { fill: palette.paper, font: { color: palette.ink } } });
keywordsSheet.getRange(`G6:G${keywordEnd}`).conditionalFormats.add("containsText", { text: "not_returned", format: { fill: "#F4D8D8", font: { color: palette.ink } } });
addTable(keywordsSheet, `A5:N${keywordEnd}`, "KeywordMapTable");
keywordsSheet.freezePanes.freezeRows(5);
keywordsSheet.freezePanes.freezeColumns(2);
setColumns(keywordsSheet, [28, 9, 10, 22, 24, 30, 15, 13, 16, 26, 20, 38, 16, 46]);

// Evidence
styleTitle(evidenceSheet, "N", "SETUP SAHLA / EVIDENCE REGISTRY", "Canonical claim and research evidence. Every factual, commercial, compatibility, price, trend, or comparative statement should trace to an evidence ID and source URL.");
const evidenceHeaders = ["Evidence ID", "Type", "Market", "Query / item", "Metric", "Value", "Unit", "Observation", "Source", "Source URL", "Captured UTC", "Rights", "Used by", "Notes"];
evidenceSheet.getRange("A5:N5").values = [evidenceHeaders];
styleHeader(evidenceSheet.getRange("A5:N5"));
const evidenceRows = evidence.map((e) => [
  e.evidence_id,
  e.evidence_type,
  e.market,
  e.query_or_item,
  e.metric_name,
  e.metric_value,
  e.metric_unit,
  e.observation,
  e.source_name,
  e.source_url,
  toDate(e.captured_at_utc),
  e.rights_status,
  e.used_by,
  e.notes,
]);
const evidenceEnd = 5 + evidenceRows.length;
evidenceSheet.getRange(`A6:N${evidenceEnd}`).values = evidenceRows;
styleBody(evidenceSheet.getRange(`A6:N${evidenceEnd}`));
evidenceSheet.getRange(`A6:N${evidenceEnd}`).format.rowHeight = 52;
evidenceSheet.getRange(`K6:K${evidenceEnd}`).format.numberFormat = "yyyy-mm-dd hh:mm";
evidenceSheet.getRange(`J6:J${evidenceEnd}`).format.font = { name: "Segoe UI", size: 8, color: "#245C67", underline: true };
evidenceSheet.getRange(`L6:L${evidenceEnd}`).conditionalFormats.add("containsText", { text: "ORIGINAL", format: { fill: palette.lime, font: { bold: true, color: palette.ink } } });
evidenceSheet.getRange(`L6:L${evidenceEnd}`).conditionalFormats.add("containsText", { text: "SOURCE_LINK_ONLY", format: { fill: palette.paper, font: { color: palette.ink } } });
addTable(evidenceSheet, `A5:N${evidenceEnd}`, "EvidenceRegistryTable");
evidenceSheet.freezePanes.freezeRows(5);
evidenceSheet.freezePanes.freezeColumns(2);
setColumns(evidenceSheet, [15, 21, 13, 38, 30, 20, 14, 75, 24, 17, 20, 20, 25, 55]);

// Content Map
styleTitle(contentSheet, "J", "SETUP SAHLA / CONTENT MAP", "Five commercial fit routes and three launch guides. Content routes, CTAs, internal links, and evidence declarations are sourced from the corrected editorial map and canonical product records.");
const contentHeaders = ["Type", "Route", "Primary keyword", "Role / friction", "Primary CTA", "Internal links", "Internal link count", "Evidence IDs", "Source file", "Launch state"];
contentSheet.getRange("A5:J5").values = [contentHeaders];
styleHeader(contentSheet.getRange("A5:J5"));
const contentRows = [];
for (const article of editorial.articles) {
  contentRows.push([
    "Guide",
    article.targetRoute,
    article.primaryKeyword,
    article.funnelRole,
    `${article.primaryCta.label} -> ${article.primaryCta.href}`,
    article.internalLinks.join("\n"),
    article.internalLinks.length,
    article.evidenceIds.join(", "),
    article.sourceFile,
    "READY FOR LAUNCH REVIEW",
  ]);
}
for (const product of products) {
  contentRows.push([
    "Product fit page",
    product.route,
    product.primaryKeyword.keyword,
    product.problem,
    "Check current price on named retailer",
    "/products/\n" + editorial.articles.filter((a) => a.internalLinks.includes(product.route)).map((a) => a.targetRoute).join("\n"),
    null,
    product.evidence.map((e) => e.evidenceId).join(", "),
    "data/products.json",
    "READY FOR LAUNCH REVIEW",
  ]);
}
const contentEnd = 5 + contentRows.length;
contentSheet.getRange(`A6:J${contentEnd}`).values = contentRows;
for (let i = 0; i < contentRows.length; i += 1) {
  const row = 6 + i;
  if (contentRows[i][0] === "Product fit page") {
    contentSheet.getRange(`G${row}`).formulas = [[`=MAX(0,LEN(F${row})-LEN(SUBSTITUTE(F${row},CHAR(10),""))+1)`]];
  }
}
styleBody(contentSheet.getRange(`A6:J${contentEnd}`));
contentSheet.getRange(`A6:J${contentEnd}`).format.rowHeight = 68;
contentSheet.getRange(`J6:J${contentEnd}`).conditionalFormats.add("containsText", { text: "READY", format: { fill: palette.lime, font: { bold: true, color: palette.ink } } });
addTable(contentSheet, `A5:J${contentEnd}`, "ContentMapTable");
contentSheet.freezePanes.freezeRows(5);
contentSheet.freezePanes.freezeColumns(2);
setColumns(contentSheet, [18, 43, 28, 55, 42, 55, 16, 55, 43, 24]);

// Owner Actions
styleTitle(ownerSheet, "H", "SETUP SAHLA / OWNER ACTIONS", "Open gates that cannot be invented or delegated: domain, legal/tax review, accounts, program IDs, territory eligibility, analytics, email consent, and operational ownership.");
const ownerHeaders = ["Gate ID", "Owner input / decision", "State", "Phase", "Why it matters", "Completion evidence", "Source", "Notes"];
ownerSheet.getRange("A5:H5").values = [ownerHeaders];
styleHeader(ownerSheet.getRange("A5:H5"));
const ownerActions = [
  ["OWN-001", "Owner-controlled domain", "OWNER INPUT REQUIRED", "Before publication", "Public destination, trust pages, Search Console verification, and rollback record", "Resolved domain and deployment record", "docs/business/LAUNCH_PLAN.md", "Publication gate"],
  ["OWN-002", "Legal and tax review", "OWNER INPUT REQUIRED", "Before publication / monetization", "Disclosures, privacy, affiliate income, and local obligations", "Owner-retained approval or advice record", "docs/business/AFFILIATE_ACTIVATION.md", "Do not infer local obligations"],
  ["OWN-003", "Owner contact and correction inbox", "OWNER INPUT REQUIRED", "Before publication", "Trust page, reader corrections, and incident response", "Published contact route tested", "docs/business/AFFILIATE_ACTIVATION.md", "Keep personal data out of source control"],
  ["OWN-004", "Analytics platform", "OWNER INPUT REQUIRED", "After publication", "Privacy-approved observed baselines", "Verified collection and annotated start", "docs/business/METRICS_SCORECARD.md", "Do not backfill estimates"],
  ["OWN-005", "Search Console owner account", "OWNER INPUT REQUIRED", "After public domain resolves", "Property verification, sitemap submission, query/indexing evidence", "Verified property and submission record", "docs/business/90_DAY_OPERATING_PLAN.md", "Not a publication blocker"],
  ["OWN-006", "Amazon Egypt Associates application", "OWNER INPUT REQUIRED", "Weeks 3-4", "Program approval is discretionary and owner-controlled", "Owner-held application / result", "docs/business/AFFILIATE_ACTIVATION.md", "Apply after useful public site exists"],
  ["OWN-007", "Amazon Associates ID/tag", "AFTER ENROLLMENT", "Post-enrollment", "Generate approved special links from owner account", "Owner-supplied tag and verified link records", "docs/business/AFFILIATE_ACTIVATION.md", "Never invent, borrow, or hand-edit a tag"],
  ["OWN-008", "Noon Egypt eligibility confirmation", "OWNER INPUT REQUIRED", "Before Noon tracking", "Public terms do not establish Egypt territory eligibility", "Written Noon confirmation retained", "docs/business/AFFILIATE_ACTIVATION.md", NOON_STATE],
  ["OWN-009", "Email platform and consent path", "OPTIONAL POST-LAUNCH", "Before email capture", "Sender identity, consent, privacy, and unsubscribe behavior", "Approved platform and tested flow", "docs/business/90_DAY_OPERATING_PLAN.md", "Email stays disabled until approved"],
  ["OWN-010", "Payment and identity details", "OWNER INPUT REQUIRED", "Program applications", "Enrollment and payouts", "Owner-held program records", "docs/business/AFFILIATE_ACTIVATION.md", "Do not put secrets or personal data in source control"],
  ["OWN-011", "Operating owners and weekly review slot", "OWNER INPUT REQUIRED", "Before recurring operations", "Assign evidence, editorial, site, link, and business decisions", "Named owner roster and meeting slot", "docs/business/90_DAY_OPERATING_PLAN.md", "Needed for 14-day and 90-day cadence"],
  ["OWN-012", "Reporting owner and monthly close date", "OWNER INPUT REQUIRED", "Before first complete baseline", "Comparable observed scorecard periods", "Named owner and close calendar", "docs/business/METRICS_SCORECARD.md", "Targets only after baseline"],
];
const ownerEnd = 5 + ownerActions.length;
ownerSheet.getRange(`A6:H${ownerEnd}`).values = ownerActions;
styleBody(ownerSheet.getRange(`A6:H${ownerEnd}`));
ownerSheet.getRange(`A6:H${ownerEnd}`).format.rowHeight = 60;
ownerSheet.getRange(`C6:C${ownerEnd}`).dataValidation = { rule: { type: "list", values: ["OWNER INPUT REQUIRED", "AFTER ENROLLMENT", "OPTIONAL POST-LAUNCH", "COMPLETE"] } };
ownerSheet.getRange(`C6:C${ownerEnd}`).conditionalFormats.add("containsText", { text: "OWNER INPUT REQUIRED", format: { fill: palette.warning, font: { bold: true, color: palette.ink } } });
ownerSheet.getRange(`C6:C${ownerEnd}`).conditionalFormats.add("containsText", { text: "COMPLETE", format: { fill: palette.lime, font: { bold: true, color: palette.ink } } });
addTable(ownerSheet, `A5:H${ownerEnd}`, "OwnerActionsTable");
ownerSheet.freezePanes.freezeRows(5);
ownerSheet.freezePanes.freezeColumns(2);
setColumns(ownerSheet, [13, 38, 24, 27, 55, 48, 40, 55]);

// Dashboard (formula-backed summary after all source sheets exist)
styleTitle(dashboard, "P", "SETUP SAHLA / LAUNCH CONTROL CENTER", "Fix the friction. Keep the gear. Egypt-first launch package with five product routes, three guides, dated provider evidence, original visuals, and direct links pending owner affiliate activation.");
dashboard.getRange("A4:C4").merge();
dashboard.getRange("A4:C4").values = [["SELECTED PRODUCTS"]];
dashboard.getRange("A5:C7").merge();
dashboard.getRange("A5:C7").formulas = [[`=COUNTA('Products'!A6:A${5 + products.length})`]];
dashboard.getRange("D4:F4").merge();
dashboard.getRange("D4:F4").values = [["CONTENT ROUTES"]];
dashboard.getRange("D5:F7").merge();
dashboard.getRange("D5:F7").formulas = [[`=COUNTA('Content Map'!B6:B${contentEnd})`]];
dashboard.getRange("G4:I4").merge();
dashboard.getRange("G4:I4").values = [["OWNER GATES OPEN"]];
dashboard.getRange("G5:I7").merge();
dashboard.getRange("G5:I7").formulas = [[`=COUNTIF('Owner Actions'!C6:C${ownerEnd},"OWNER INPUT REQUIRED")`]];
dashboard.getRange("J4:L4").merge();
dashboard.getRange("J4:L4").values = [["AVERAGE SELECTION SCORE"]];
dashboard.getRange("J5:L7").merge();
dashboard.getRange("J5:L7").formulas = [[`=ROUND(AVERAGE('Products'!K6:K${5 + products.length}),0)`]];
dashboard.getRange("M4:P4").merge();
dashboard.getRange("M4:P4").values = [["DIRECT RETAILER LINKS"]];
dashboard.getRange("M5:P7").merge();
dashboard.getRange("M5:P7").formulas = [[`=COUNTIF('Providers'!G6:G${providerEnd},"${DIRECT_STATE}")`]];
for (const addr of ["A4:C4", "D4:F4", "G4:I4", "J4:L4", "M4:P4"]) {
  dashboard.getRange(addr).format = { fill: palette.paper, font: { name: "Segoe UI Semibold", size: 8, bold: true, color: palette.ink }, horizontalAlignment: "center", verticalAlignment: "center", borders: { preset: "outside", style: "medium", color: palette.ink } };
}
for (const addr of ["A5:C7", "D5:F7", "G5:I7", "J5:L7", "M5:P7"]) {
  dashboard.getRange(addr).format = { fill: palette.cream, font: { name: "Bahnschrift Condensed", size: 28, bold: true, color: palette.ink }, horizontalAlignment: "center", verticalAlignment: "center", borders: { preset: "outside", style: "medium", color: palette.ink } };
}
dashboard.getRange("A9:I9").merge();
dashboard.getRange("A9:I9").values = [["AFFILIATE ACTIVATION STATE"]];
dashboard.getRange("A10:I12").merge();
dashboard.getRange("A10:I12").values = [[`${DIRECT_STATE}\nAmazon Egypt requires owner enrollment/tag and destination-level verification.\nNoon Egypt: ${NOON_STATE}.`]];
dashboard.getRange("A9:I9").format = { fill: palette.ink, font: { name: "Segoe UI Semibold", size: 9, bold: true, color: palette.cream }, verticalAlignment: "center" };
dashboard.getRange("A10:I12").format = { fill: palette.warning, font: { name: "Segoe UI Semibold", size: 10, bold: true, color: palette.ink }, wrapText: true, verticalAlignment: "center", borders: { preset: "outside", style: "medium", color: palette.ink } };

dashboard.getRange("A14:I14").merge();
dashboard.getRange("A14:I14").values = [["LAUNCH CONTROL / DO NOT CLAIM"]];
dashboard.getRange("A15:I22").values = [
  ["1", "Prices, stock, sellers, fulfillment, returns, and listing identity are dated snapshots.", null, null, null, null, null, null, null],
  ["2", "Autocomplete presence is qualitative search-language evidence, not search volume or trend strength.", null, null, null, null, null, null, null],
  ["3", "Retailer outbound clicks are navigation, not purchases, orders, commission, or revenue.", null, null, null, null, null, null, null],
  ["4", "The MENA posture is design readiness; launch demand and provider evidence is Egypt-specific.", null, null, null, null, null, null, null],
  ["5", "Public visuals are original. Retailer/manufacturer imagery is source-link-only unless permission is current.", null, null, null, null, null, null, null],
  ["6", "Compatibility, trade-offs, and skip guidance must precede every commercial CTA.", null, null, null, null, null, null, null],
  ["7", "A failed or changed-model link is disabled immediately before documentation follows.", null, null, null, null, null, null, null],
  ["8", "No numeric traffic, conversion, commission, or revenue forecast is in this launch package.", null, null, null, null, null, null, null],
];
for (let row = 15; row <= 22; row += 1) {
  dashboard.getRange(`B${row}:I${row}`).merge();
}
dashboard.getRange("A14:I14").format = { fill: palette.ink, font: { name: "Segoe UI Semibold", size: 9, bold: true, color: palette.cream } };
dashboard.getRange("A15:A22").format = { fill: palette.lime, font: { name: "SahlaMono", size: 9, bold: true, color: palette.ink }, horizontalAlignment: "center", verticalAlignment: "center", borders: { preset: "all", style: "thin", color: palette.rule } };
dashboard.getRange("B15:I22").format = { fill: palette.cream, font: { name: "Segoe UI", size: 8, color: palette.ink }, wrapText: true, verticalAlignment: "center", borders: { preset: "all", style: "thin", color: palette.rule } };
dashboard.getRange("A15:I22").format.rowHeight = 28;

dashboard.getRange("J9:K9").values = [["Product", "Score"]];
dashboard.getRange(`J10:K${9 + products.length}`).formulas = products.map((_, idx) => [[`='Products'!C${6 + idx}`, `='Products'!K${6 + idx}`]])
  .map((row) => row[0]);
styleHeader(dashboard.getRange("J9:K9"));
styleBody(dashboard.getRange(`J10:K${9 + products.length}`));
const chart = dashboard.charts.add("bar", dashboard.getRange(`J9:K${9 + products.length}`));
chart.title = "Launch selection score / 100";
chart.hasLegend = false;
chart.xAxis = { axisType: "textAxis", textStyle: { fontSize: 8 } };
chart.yAxis = { numberFormatCode: "0", min: 0, max: 100 };
chart.setPosition("J16", "P31");

dashboard.getRange("A25:I25").merge();
dashboard.getRange("A25:I25").values = [["SOURCE FRESHNESS / COUNTS"]];
dashboard.getRange("A26:B26").merge();
dashboard.getRange("C26:D26").merge();
dashboard.getRange("A28:B28").merge();
dashboard.getRange("C28:D28").merge();
dashboard.getRange("A26:B26").values = [["Evidence rows"]];
dashboard.getRange("C26:D26").values = [["Keyword rows"]];
dashboard.getRange("A28:B28").values = [["Amazon provider rows"]];
dashboard.getRange("C28:D28").values = [["Noon provider rows"]];
dashboard.getRange("A27:B27").merge();
dashboard.getRange("C27:D27").merge();
dashboard.getRange("A29:B29").merge();
dashboard.getRange("C29:D29").merge();
dashboard.getRange("A27:B27").formulas = [[`=COUNTA('Evidence'!A6:A${evidenceEnd})`]];
dashboard.getRange("C27:D27").formulas = [[`=COUNTA('Keywords'!A6:A${keywordEnd})`]];
dashboard.getRange("A29:B29").formulas = [[`=COUNTIF('Providers'!C6:C${providerEnd},"Amazon Egypt")`]];
dashboard.getRange("C29:D29").formulas = [[`=COUNTIF('Providers'!C6:C${providerEnd},"Noon Egypt")`]];
dashboard.getRange("A25:I25").format = { fill: palette.ink, font: { name: "Segoe UI Semibold", size: 9, bold: true, color: palette.cream } };
dashboard.getRange("A26:D29").format = { fill: palette.paper, font: { name: "Segoe UI", size: 8, color: palette.ink }, wrapText: true, verticalAlignment: "center", borders: { preset: "all", style: "thin", color: palette.rule } };
dashboard.getRange("A27:D29").format.numberFormat = "0";
dashboard.getRange("A27:D29").format.font = { name: "Bahnschrift Condensed", size: 18, bold: true, color: palette.ink };
dashboard.freezePanes.freezeRows(3);
setColumns(dashboard, [11, 15, 15, 11, 15, 15, 11, 15, 15, 26, 12, 12, 12, 12, 12, 12]);

// Add source comments to key dashboard controls.
workbook.comments.addThread({ cell: dashboard.getRange("A10") }, "Source: docs/business/AFFILIATE_ACTIVATION.md and research/affiliate-program-evidence.csv. Affiliate IDs and Noon Egypt territory permission are owner-controlled inputs and are not present in this launch package.");
workbook.comments.addThread({ cell: dashboard.getRange("J5") }, "Formula-backed average of the five visible product totals. Each product total is the sum of seven visible selection components; the score is an editorial rank inside the evaluated launch set, not a performance claim.");

// Compact verification before export.
const dashboardCheck = await workbook.inspect({ kind: "table", range: "Launch Dashboard!A1:P31", include: "values,formulas", tableMaxRows: 31, tableMaxCols: 16, maxChars: 12000 });
const productCheck = await workbook.inspect({ kind: "table", range: `Products!A1:T${5 + products.length}`, include: "values,formulas", tableMaxRows: 15, tableMaxCols: 20, maxChars: 10000 });
const formulaErrors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 300 }, summary: "final formula error scan" });
const formulaInventory = await workbook.inspect({ kind: "formula", maxChars: 20000, options: { maxResults: 500 } });

const previewNames = [];
for (const sheetName of ["Launch Dashboard", "Products", "Providers", "Keywords", "Evidence", "Content Map", "Owner Actions"]) {
  const blob = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  const safeName = sheetName.toLowerCase().replace(/\s+/g, "-");
  const previewPath = path.join(previewDir, `${safeName}.png`);
  await fs.writeFile(previewPath, new Uint8Array(await blob.arrayBuffer()));
  previewNames.push(previewPath);
}

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(workbookPath);

const validation = {
  workbook: workbookPath,
  bytes: (await fs.stat(workbookPath)).size,
  sheetCount: 7,
  sourceCounts: { products: products.length, providers: providerRows.length, keywords: keywords.length, evidence: evidence.length, contentRoutes: contentRows.length, ownerActions: ownerActions.length },
  previewNames,
  dashboardCheck: dashboardCheck.ndjson,
  productCheck: productCheck.ndjson,
  formulaErrors: formulaErrors.ndjson,
  formulaInventory: formulaInventory.ndjson,
};
await fs.writeFile(path.join(here, "workbook-validation.json"), JSON.stringify(validation, null, 2), "utf8");
console.log(JSON.stringify({ workbook: workbookPath, bytes: validation.bytes, sourceCounts: validation.sourceCounts, previews: previewNames, formulaErrors: formulaErrors.ndjson }, null, 2));
