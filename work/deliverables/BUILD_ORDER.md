# Setup Sahla deliverables build order

Run every command from the repository root. Use the bundled Python and Node runtimes returned by the workspace dependency loader.

1. Build the three PDFs and regenerate image thumbnails:

   `python work/deliverables/build_pdfs.py`

2. Build the seven-sheet workbook exclusively through `@oai/artifact-tool` and render all seven worksheet previews:

   `node work/deliverables/build_workbook.mjs`

3. Apply the narrow OOXML hardening pass required by two artifact-tool serialization gaps in the current runtime:

   `python work/deliverables/harden_xlsx.py`

   This pass does not author workbook content. It adds the seven requested frozen-pane records and 20 genuine external hyperlink relationships to the artifact-tool export. Friendly labels and exact raw URLs are already authored by artifact-tool.

4. Import the hardened XLSX through artifact-tool and render all seven final worksheet previews:

   `node work/deliverables/render_final_workbook.mjs`

5. Run structural and content validation:

   `python work/deliverables/verify_deliverables.py`

6. Render every PDF page with Poppler, regenerate the PDF contact sheets, and visually inspect every PDF page plus all seven worksheet previews. Retain the final contact sheets and worksheet previews under `work/deliverables/`.

The required order is PDF build -> artifact-tool workbook build -> OOXML hardening -> final workbook rendering -> validation -> PDF rendering and visual inspection. Running the artifact-tool workbook build after hardening replaces the XLSX and therefore requires steps 3-6 again.
