from __future__ import annotations

import hashlib
import json
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
        ns = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
        sheet_names = [node.attrib["name"] for node in workbook_xml.findall("m:sheets/m:sheet", ns)]
        xml_text = "\n".join(
            archive.read(name).decode("utf-8", errors="replace")
            for name in names
            if name.endswith(".xml")
        )
        formula_count = len(re.findall(r"<(?:[A-Za-z0-9_]+:)?f(?:\s[^>]*)?>", xml_text))
        hyperlink_formula_count = xml_text.upper().count("HYPERLINK(")
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

    checks = {
        "zip_integrity": corrupt_member is None,
        "sheet_names": sheet_names,
        "expected_sheet_names": sheet_names == EXPECTED_SHEETS,
        "formula_count": formula_count,
        "hyperlink_formula_count": hyperlink_formula_count,
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
            hyperlink_formula_count >= 20,
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
    checks["ok"] = all(
        [
            checks["pages"] == expected_pages,
            not checks["empty_pages"],
            checks["text_chars"] > 1000,
            checks["external_link_annotations"] >= expected_links,
            checks["direct_state_present"],
            checks["noon_state_present"],
        ]
    )
    return checks


def main() -> None:
    workbook = DELIVERABLES / "Setup-Sahla-Launch-Workbook.xlsx"
    report = {
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
    report["ok"] = report["workbook"]["ok"] and all(item["ok"] for item in report["pdfs"].values())
    OUT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))
    if not report["ok"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
