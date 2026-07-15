from __future__ import annotations

import hashlib
import json
import posixpath
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[2]
DELIVERABLES = ROOT / "deliverables"
OUT = Path(__file__).with_name("final-validation.json")
DIRECT_STATE = "DIRECT_LINK — AFFILIATE ID REQUIRED"
NOON_STATE = "Unverified — public terms do not establish Egypt eligibility"
EXPECTED_SHEETS = [
    "Launch Dashboard",
    "Products",
    "Providers",
    "Keywords",
    "Evidence",
    "Content Map",
    "Owner Actions",
]
EXPECTED_PDF_PAGES = {
    "Setup-Sahla-Product-Research-Report.pdf": 9,
    "Setup-Sahla-Brand-Guide.pdf": 9,
    "Setup-Sahla-Business-Launch-Plan.pdf": 10,
}
EXPECTED_PDF_LINKS = {
    "Setup-Sahla-Product-Research-Report.pdf": 1,
    "Setup-Sahla-Brand-Guide.pdf": 0,
    "Setup-Sahla-Business-Launch-Plan.pdf": 1,
}
PANE_SPECS = {
    "Launch Dashboard": {"ySplit": "3", "topLeftCell": "A4", "activePane": "bottomLeft", "state": "frozen"},
    "Products": {"xSplit": "3", "ySplit": "5", "topLeftCell": "D6", "activePane": "bottomRight", "state": "frozen"},
    "Providers": {"xSplit": "3", "ySplit": "5", "topLeftCell": "D6", "activePane": "bottomRight", "state": "frozen"},
    "Keywords": {"xSplit": "2", "ySplit": "5", "topLeftCell": "C6", "activePane": "bottomRight", "state": "frozen"},
    "Evidence": {"xSplit": "2", "ySplit": "5", "topLeftCell": "C6", "activePane": "bottomRight", "state": "frozen"},
    "Content Map": {"xSplit": "2", "ySplit": "5", "topLeftCell": "C6", "activePane": "bottomRight", "state": "frozen"},
    "Owner Actions": {"xSplit": "2", "ySplit": "5", "topLeftCell": "C6", "activePane": "bottomRight", "state": "frozen"},
}
MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
DOC_REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
HYPERLINK_REL = f"{DOC_REL_NS}/hyperlink"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify_workbook(path: Path) -> dict:
    with zipfile.ZipFile(path) as archive:
        corrupt_member = archive.testzip()
        names = archive.namelist()
        workbook_xml = ET.fromstring(archive.read("xl/workbook.xml"))
        ns = {"m": MAIN_NS, "r": DOC_REL_NS}
        sheet_names = [node.attrib["name"] for node in workbook_xml.findall("m:sheets/m:sheet", ns)]
        workbook_rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        rel_targets = {
            node.attrib["Id"]: node.attrib["Target"]
            for node in workbook_rels.findall(f"{{{PKG_REL_NS}}}Relationship")
        }
        sheet_paths = {}
        for node in workbook_xml.findall("m:sheets/m:sheet", ns):
            target = rel_targets[node.attrib[f"{{{DOC_REL_NS}}}id"]]
            sheet_paths[node.attrib["name"]] = target.lstrip("/") if target.startswith("/") else posixpath.normpath(posixpath.join("xl", target))
        xml_text = "\n".join(
            archive.read(name).decode("utf-8", errors="replace")
            for name in names
            if name.endswith(".xml")
        )
        formula_count = len(re.findall(r"<(?:[A-Za-z0-9_]+:)?f(?:\s[^>]*)?>", xml_text))
        hyperlink_formula_count = xml_text.upper().count("HYPERLINK(")
        placeholder_phrase_present = "HYPERLINK is not implemented" in xml_text
        media = [name for name in names if name.startswith("xl/media/") and not name.endswith("/")]
        drawings = [name for name in names if name.startswith("xl/drawings/drawing") and name.endswith(".xml")]
        tables = [name for name in names if name.startswith("xl/tables/table") and name.endswith(".xml")]
        formula_error_tokens = sorted(
            token
            for token in ["#REF!", "#DIV/0!", "#VALUE!", "#NAME?", "#N/A"]
            if token in xml_text
        )
        direct_state_present = DIRECT_STATE.replace("—", "&#8212;") in xml_text or DIRECT_STATE in xml_text
        noon_state_present = NOON_STATE.replace("—", "&#8212;") in xml_text or NOON_STATE in xml_text
        pane_records = {}
        for sheet_name, sheet_path in sheet_paths.items():
            sheet_root = ET.fromstring(archive.read(sheet_path))
            pane = sheet_root.find("m:sheetViews/m:sheetView/m:pane", ns)
            pane_records[sheet_name] = None if pane is None else dict(pane.attrib)
        provider_path = sheet_paths["Providers"]
        provider_root = ET.fromstring(archive.read(provider_path))
        provider_hyperlink_nodes = provider_root.findall("m:hyperlinks/m:hyperlink", ns)
        provider_rels_path = posixpath.join(posixpath.dirname(provider_path), "_rels", posixpath.basename(provider_path) + ".rels")
        provider_rels = ET.fromstring(archive.read(provider_rels_path))
        hyperlink_relationships = [
            node
            for node in provider_rels.findall(f"{{{PKG_REL_NS}}}Relationship")
            if node.attrib.get("Type") == HYPERLINK_REL and node.attrib.get("TargetMode") == "External"
        ]
        provider_xml_text = archive.read(provider_path).decode("utf-8", errors="replace")
        visible_url_count = provider_xml_text.count("https://")
        friendly_listing_count = provider_xml_text.count("OPEN EXACT LISTING")
        friendly_manufacturer_count = provider_xml_text.count("OPEN MANUFACTURER SOURCE")

    checks = {
        "zip_integrity": corrupt_member is None,
        "sheet_names": sheet_names,
        "expected_sheet_names": sheet_names == EXPECTED_SHEETS,
        "formula_count": formula_count,
        "hyperlink_formula_count": hyperlink_formula_count,
        "placeholder_phrase_present": placeholder_phrase_present,
        "provider_hyperlink_nodes": len(provider_hyperlink_nodes),
        "provider_hyperlink_relationships": len(hyperlink_relationships),
        "visible_provider_url_count": visible_url_count,
        "friendly_listing_label_count": friendly_listing_count,
        "friendly_manufacturer_label_count": friendly_manufacturer_count,
        "freeze_panes": pane_records,
        "freeze_panes_match": pane_records == PANE_SPECS,
        "embedded_media_count": len(media),
        "drawing_xml_count": len(drawings),
        "table_xml_count": len(tables),
        "formula_error_tokens": formula_error_tokens,
        "direct_state_present": direct_state_present,
        "noon_state_present": noon_state_present,
    }
    checks["ok"] = all(
        [
            checks["zip_integrity"],
            checks["expected_sheet_names"],
            formula_count > 0,
            hyperlink_formula_count == 0,
            not placeholder_phrase_present,
            len(provider_hyperlink_nodes) == 20,
            len(hyperlink_relationships) == 20,
            visible_url_count == 20,
            friendly_listing_count >= 10,
            friendly_manufacturer_count >= 10,
            pane_records == PANE_SPECS,
            len(media) == 5,
            len(drawings) >= 1,
            len(tables) >= 6,
            not formula_error_tokens,
            direct_state_present,
            noon_state_present,
        ]
    )
    return checks


def verify_pdf(path: Path, expected_pages: int, expected_links: int) -> dict:
    reader = PdfReader(str(path))
    page_text = [(page.extract_text() or "").strip() for page in reader.pages]
    full_text = "\n".join(page_text)
    normalized = " ".join(full_text.split())
    link_count = 0
    for page in reader.pages:
        for annotation in page.annotations or []:
            obj = annotation.get_object()
            action = obj.get("/A")
            if action and action.get("/URI"):
                link_count += 1
    checks = {
        "pages": len(reader.pages),
        "expected_pages": expected_pages,
        "empty_pages": [index + 1 for index, text in enumerate(page_text) if len(text) < 20],
        "text_chars": len(full_text),
        "external_link_annotations": link_count,
        "minimum_external_links": expected_links,
        "direct_state_present": DIRECT_STATE in full_text,
        "noon_state_present": NOON_STATE in full_text,
    }
    if path.name == "Setup-Sahla-Product-Research-Report.pdf":
        rubric_labels = [
            "Problem urgency 25",
            "Search intent 20",
            "Availability 15",
            "Value 15",
            "Compatibility 10",
            "Editorial fit 10",
            "Visual 5",
        ]
        checks.update({
            "evidence_qualified_framing": "evidence-qualified launch products" in normalized.lower(),
            "trend_validation_limit": "no volume/trend-direction/growth dataset was available" in normalized.lower(),
            "not_trend_validated_winners": "not trend-validated winners" in normalized.lower(),
            "scoring_rubric_maxima": all(label.lower() in normalized.lower() for label in rubric_labels),
            "havit_discontinuation_beside_and_limits": normalized.lower().count("manufacturer store marks f2069 no longer available") >= 2,
        })
    if path.name == "Setup-Sahla-Business-Launch-Plan.pdf":
        expected_routes = [
            "/products/usb-c-hub/",
            "/products/laptop-stand/",
            "/products/laptop-cooling-pad/",
            "/products/desk-cable-management/",
            "/products/ergonomic-mouse/",
            "/guides/fix-laptop-desk-setup-egypt/",
            "/guides/choose-usb-c-hub-egypt/",
            "/guides/laptop-heat-posture-cable-fixes/",
        ]
        checks.update({
            "unbroken_page_5_routes": all(route in full_text for route in expected_routes),
            "evidence_qualified_framing": "evidence-qualified product pages" in normalized.lower(),
            "not_trend_validated_winners": "not trend-validated winners" in normalized.lower(),
        })
    extra_checks = [value for key, value in checks.items() if key in {
        "evidence_qualified_framing",
        "trend_validation_limit",
        "not_trend_validated_winners",
        "scoring_rubric_maxima",
        "havit_discontinuation_beside_and_limits",
        "unbroken_page_5_routes",
    }]
    checks["ok"] = all(
        [
            checks["pages"] == expected_pages,
            not checks["empty_pages"],
            checks["text_chars"] > 1000,
            checks["external_link_annotations"] >= expected_links,
            checks["direct_state_present"],
            checks["noon_state_present"],
            *extra_checks,
        ]
    )
    return checks


def main() -> None:
    workbook = DELIVERABLES / "Setup-Sahla-Launch-Workbook.xlsx"
    report = {
        "build_order_document_exists": (ROOT / "work" / "deliverables" / "BUILD_ORDER.md").is_file(),
        "workbook": verify_workbook(workbook),
        "pdfs": {
            name: verify_pdf(DELIVERABLES / name, pages, EXPECTED_PDF_LINKS[name])
            for name, pages in EXPECTED_PDF_PAGES.items()
        },
        "files": {
            path.name: {"bytes": path.stat().st_size, "sha256": sha256(path)}
            for path in sorted(DELIVERABLES.iterdir())
            if path.is_file() and path.suffix.lower() in {".xlsx", ".pdf"}
        },
    }
    report["ok"] = (
        report["build_order_document_exists"]
        and report["workbook"]["ok"]
        and all(item["ok"] for item in report["pdfs"].values())
    )
    OUT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))
    if not report["ok"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
