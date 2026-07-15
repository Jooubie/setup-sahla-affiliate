import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";


const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const workbookPath = path.join(root, "deliverables", "Setup-Sahla-Launch-Workbook.xlsx");
const previewDir = path.join(here, "previews");
const sheetNames = ["Launch Dashboard", "Products", "Providers", "Keywords", "Evidence", "Content Map", "Owner Actions"];

await fs.mkdir(previewDir, { recursive: true });
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const outputs = [];
for (const sheetName of sheetNames) {
  const image = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  const safeName = sheetName.toLowerCase().replace(/\s+/g, "-");
  const outputPath = path.join(previewDir, `${safeName}.png`);
  await fs.writeFile(outputPath, new Uint8Array(await image.arrayBuffer()));
  outputs.push(outputPath);
}
console.log(JSON.stringify({ workbook: workbookPath, previews: outputs }, null, 2));
