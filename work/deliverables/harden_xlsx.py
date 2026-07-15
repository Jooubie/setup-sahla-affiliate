from __future__ import annotations

import json
import os
import posixpath
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[2]
XLSX = ROOT / "deliverables" / "Setup-Sahla-Launch-Workbook.xlsx"
REPORT = Path(__file__).with_name("xlsx-hardening.json")

MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
DOC_REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
HYPERLINK_REL = f"{DOC_REL_NS}/hyperlink"
NS = {"x": MAIN_NS, "r": DOC_REL_NS}

ET.register_namespace("x", MAIN_NS)
ET.register_namespace("r", DOC_REL_NS)

PANE_SPECS = {
    "Launch Dashboard": {"ySplit": "3", "topLeftCell": "A4", "activePane": "bottomLeft", "state": "frozen"},
    "Products": {"xSplit": "3", "ySplit": "5", "topLeftCell": "D6", "activePane": "bottomRight", "state": "frozen"},
    "Providers": {"xSplit": "3", "ySplit": "5", "topLeftCell": "D6", "activePane": "bottomRight", "state": "frozen"},
    "Keywords": {"xSplit": "2", "ySplit": "5", "topLeftCell": "C6", "activePane": "bottomRight", "state": "frozen"},
    "Evidence": {"xSplit": "2", "ySplit": "5", "topLeftCell": "C6", "activePane": "bottomRight", "state": "frozen"},
    "Content Map": {"xSplit": "2", "ySplit": "5", "topLeftCell": "C6", "activePane": "bottomRight", "state": "frozen"},
    "Owner Actions": {"xSplit": "2", "ySplit": "5", "topLeftCell": "C6", "activePane": "bottomRight", "state": "frozen"},
}


def xml_bytes(root: ET.Element) -> bytes:
    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def workbook_sheet_paths(files: dict[str, bytes]) -> dict[str, str]:
    workbook = ET.fromstring(files["xl/workbook.xml"])
    relationships = ET.fromstring(files["xl/_rels/workbook.xml.rels"])
    rel_targets = {
        node.attrib["Id"]: node.attrib["Target"]
        for node in relationships.findall(f"{{{PKG_REL_NS}}}Relationship")
    }
    result = {}
    for sheet in workbook.findall("x:sheets/x:sheet", NS):
        target = rel_targets[sheet.attrib[f"{{{DOC_REL_NS}}}id"]]
        if target.startswith("/"):
            resolved = target.lstrip("/")
        else:
            resolved = posixpath.normpath(posixpath.join("xl", target))
        result[sheet.attrib["name"]] = resolved
    return result


def add_freeze_pane(sheet_xml: bytes, spec: dict[str, str]) -> bytes:
    root = ET.fromstring(sheet_xml)
    sheet_view = root.find("x:sheetViews/x:sheetView", NS)
    if sheet_view is None:
        sheet_views = ET.Element(f"{{{MAIN_NS}}}sheetViews")
        sheet_view = ET.SubElement(sheet_views, f"{{{MAIN_NS}}}sheetView", {"workbookViewId": "0"})
        insert_at = 1 if len(root) and root[0].tag.endswith("sheetPr") else 0
        root.insert(insert_at, sheet_views)
    for existing in list(sheet_view):
        if existing.tag == f"{{{MAIN_NS}}}pane":
            sheet_view.remove(existing)
    sheet_view.insert(0, ET.Element(f"{{{MAIN_NS}}}pane", spec))
    return xml_bytes(root)


def shared_strings(files: dict[str, bytes]) -> list[str]:
    payload = files.get("xl/sharedStrings.xml")
    if not payload:
        return []
    root = ET.fromstring(payload)
    values = []
    for item in root.findall("x:si", NS):
        values.append("".join(node.text or "" for node in item.iter(f"{{{MAIN_NS}}}t")))
    return values


def cell_text(cell: ET.Element, strings: list[str]) -> str:
    value = cell.find("x:v", NS)
    if value is None:
        inline = cell.find("x:is", NS)
        return "" if inline is None else "".join(node.text or "" for node in inline.iter(f"{{{MAIN_NS}}}t"))
    if cell.attrib.get("t") == "s":
        return strings[int(value.text or "0")]
    return value.text or ""


def add_provider_hyperlinks(
    sheet_xml: bytes,
    rels_xml: bytes | None,
    strings: list[str],
) -> tuple[bytes, bytes, list[dict[str, str]]]:
    root = ET.fromstring(sheet_xml)
    cells = {cell.attrib["r"]: cell for cell in root.findall(".//x:c", NS)}

    relationships = (
        ET.fromstring(rels_xml)
        if rels_xml
        else ET.Element(f"{{{PKG_REL_NS}}}Relationships")
    )
    for node in list(relationships):
        if node.attrib.get("Type") == HYPERLINK_REL:
            relationships.remove(node)
    used_ids = [
        int(match.group(1))
        for node in relationships
        if (match := re.fullmatch(r"rId(\d+)", node.attrib.get("Id", "")))
    ]
    next_id = max(used_ids, default=0) + 1

    existing_hyperlinks = root.find("x:hyperlinks", NS)
    if existing_hyperlinks is not None:
        root.remove(existing_hyperlinks)
    hyperlinks = ET.Element(f"{{{MAIN_NS}}}hyperlinks")
    added = []
    for row in range(6, 16):
        for label_col, url_col, label in [
            ("I", "J", "OPEN EXACT LISTING"),
            ("K", "L", "OPEN MANUFACTURER SOURCE"),
        ]:
            ref = f"{label_col}{row}"
            url_ref = f"{url_col}{row}"
            target = cell_text(cells[url_ref], strings)
            display = cell_text(cells[ref], strings)
            if display != label or not target.startswith("https://"):
                raise ValueError(f"Unexpected provider hyperlink source at {ref}/{url_ref}: {display!r} -> {target!r}")
            rel_id = f"rId{next_id}"
            next_id += 1
            ET.SubElement(
                relationships,
                f"{{{PKG_REL_NS}}}Relationship",
                {"Id": rel_id, "Type": HYPERLINK_REL, "Target": target, "TargetMode": "External"},
            )
            ET.SubElement(
                hyperlinks,
                f"{{{MAIN_NS}}}hyperlink",
                {"ref": ref, f"{{{DOC_REL_NS}}}id": rel_id, "display": display},
            )
            added.append({"cell": ref, "display": display, "target": target, "relationshipId": rel_id})

    insert_before = {
        "printOptions",
        "pageMargins",
        "pageSetup",
        "headerFooter",
        "rowBreaks",
        "colBreaks",
        "customProperties",
        "cellWatches",
        "ignoredErrors",
        "smartTags",
        "drawing",
        "legacyDrawing",
        "tableParts",
        "extLst",
    }
    insert_at = len(root)
    for index, child in enumerate(root):
        if child.tag.rsplit("}", 1)[-1] in insert_before:
            insert_at = index
            break
    root.insert(insert_at, hyperlinks)

    ET.register_namespace("", PKG_REL_NS)
    return xml_bytes(root), xml_bytes(relationships), added


def rewrite_xlsx(files: dict[str, bytes], infos: list[zipfile.ZipInfo]) -> None:
    temp = XLSX.with_suffix(".xlsx.tmp")
    with zipfile.ZipFile(temp, "w") as archive:
        for info in infos:
            archive.writestr(info, files[info.filename])
    os.replace(temp, XLSX)


def main() -> None:
    resolved = XLSX.resolve()
    if resolved.parent != (ROOT / "deliverables").resolve():
        raise RuntimeError(f"Refusing to modify workbook outside deliverables: {resolved}")

    with zipfile.ZipFile(XLSX) as archive:
        infos = archive.infolist()
        files = {info.filename: archive.read(info.filename) for info in infos}

    sheet_paths = workbook_sheet_paths(files)
    for sheet_name, spec in PANE_SPECS.items():
        sheet_path = sheet_paths[sheet_name]
        files[sheet_path] = add_freeze_pane(files[sheet_path], spec)

    provider_path = sheet_paths["Providers"]
    rels_path = posixpath.join(posixpath.dirname(provider_path), "_rels", posixpath.basename(provider_path) + ".rels")
    files[provider_path], provider_rels, links = add_provider_hyperlinks(
        files[provider_path],
        files.get(rels_path),
        shared_strings(files),
    )
    if rels_path not in files:
        new_info = zipfile.ZipInfo(rels_path)
        new_info.compress_type = zipfile.ZIP_DEFLATED
        infos.append(new_info)
    files[rels_path] = provider_rels

    placeholder_present = any(b"HYPERLINK is not implemented" in payload for payload in files.values())
    rewrite_xlsx(files, infos)
    report = {
        "workbook": str(XLSX),
        "bytes": XLSX.stat().st_size,
        "freezePanes": PANE_SPECS,
        "providerHyperlinks": links,
        "placeholderPhrasePresent": placeholder_present,
    }
    REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"workbook": report["workbook"], "bytes": report["bytes"], "freezePaneCount": len(PANE_SPECS), "hyperlinkCount": len(links), "placeholderPhrasePresent": report["placeholderPhrasePresent"]}, indent=2))
    if report["placeholderPhrasePresent"]:
        raise SystemExit("Artifact evaluator placeholder remains in workbook")


if __name__ == "__main__":
    main()
