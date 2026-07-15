from __future__ import annotations

import json
import os
import re
from html import escape
from pathlib import Path
from typing import Iterable

from PIL import Image as PILImage, ImageDraw, ImageOps
from pypdf import PdfReader
from reportlab.graphics.shapes import Circle, Drawing, Line, Path as RLPath, Rect, String
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    CondPageBreak,
    Flowable,
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
DELIVERABLES = ROOT / "deliverables"
WORK = ROOT / "work" / "deliverables"
THUMBS = WORK / "thumbnails"
CONTACTS = WORK / "deliverables-contact-sheets"

INK = colors.HexColor("#101411")
PAPER = colors.HexColor("#E9DFCA")
LIME = colors.HexColor("#C9FF4A")
CYAN = colors.HexColor("#66D9E8")
CREAM = colors.HexColor("#FFFDF7")
MUTED = colors.HexColor("#59645D")
RULE = colors.HexColor("#C8C1B3")
RED = colors.HexColor("#D34F4F")
WHITE = colors.white

DIRECT_STATE = "DIRECT_LINK — AFFILIATE ID REQUIRED"
NOON_STATE = "Unverified — public terms do not establish Egypt eligibility"


def register_fonts() -> None:
    candidates = {
        "SahlaBody": Path("C:/Windows/Fonts/segoeui.ttf"),
        "SahlaBodyBold": Path("C:/Windows/Fonts/seguisb.ttf"),
        "SahlaDisplay": Path("C:/Windows/Fonts/bahnschrift.ttf"),
        "SahlaMono": Path("C:/Windows/Fonts/consola.ttf"),
        "SahlaMonoBold": Path("C:/Windows/Fonts/consolab.ttf"),
    }
    fallback = Path("C:/Windows/Fonts/arial.ttf")
    fallback_bold = Path("C:/Windows/Fonts/arialbd.ttf")
    for name, path in candidates.items():
        chosen = path if path.exists() else (fallback_bold if "Bold" in name else fallback)
        pdfmetrics.registerFont(TTFont(name, str(chosen)))


register_fonts()


def clean(value: object) -> str:
    text = "" if value is None else str(value)
    return (
        text.replace("\u2011", "-")
        .replace("\u2013", "-")
        .replace("\u2212", "-")
        .replace("\u00a0", " ")
    )


BASE = getSampleStyleSheet()
STYLES = {
    "cover_kicker": ParagraphStyle(
        "CoverKicker",
        fontName="SahlaMonoBold",
        fontSize=9,
        leading=12,
        textColor=CYAN,
        spaceAfter=10,
        tracking=0.7,
    ),
    "cover_title": ParagraphStyle(
        "CoverTitle",
        fontName="SahlaDisplay",
        fontSize=33,
        leading=36,
        textColor=CREAM,
        spaceAfter=12,
    ),
    "cover_sub": ParagraphStyle(
        "CoverSub",
        fontName="SahlaBody",
        fontSize=12,
        leading=18,
        textColor=PAPER,
        spaceAfter=20,
    ),
    "h1": ParagraphStyle(
        "H1",
        fontName="SahlaDisplay",
        fontSize=22,
        leading=25,
        textColor=INK,
        spaceBefore=3,
        spaceAfter=10,
    ),
    "h2": ParagraphStyle(
        "H2",
        fontName="SahlaDisplay",
        fontSize=15,
        leading=18,
        textColor=INK,
        spaceBefore=8,
        spaceAfter=7,
    ),
    "h3": ParagraphStyle(
        "H3",
        fontName="SahlaBodyBold",
        fontSize=10,
        leading=13,
        textColor=INK,
        spaceBefore=5,
        spaceAfter=4,
    ),
    "body": ParagraphStyle(
        "Body",
        fontName="SahlaBody",
        fontSize=9.2,
        leading=13.8,
        textColor=INK,
        spaceAfter=6,
    ),
    "small": ParagraphStyle(
        "Small",
        fontName="SahlaBody",
        fontSize=7.7,
        leading=10.8,
        textColor=MUTED,
        spaceAfter=3,
    ),
    "mono": ParagraphStyle(
        "Mono",
        fontName="SahlaMono",
        fontSize=7.2,
        leading=10,
        textColor=INK,
        spaceAfter=2,
    ),
    "callout": ParagraphStyle(
        "Callout",
        fontName="SahlaBodyBold",
        fontSize=10.5,
        leading=14.5,
        textColor=INK,
        spaceAfter=0,
    ),
    "table": ParagraphStyle(
        "TableText",
        fontName="SahlaBody",
        fontSize=7.2,
        leading=9.4,
        textColor=INK,
    ),
    "table_bold": ParagraphStyle(
        "TableBold",
        fontName="SahlaBodyBold",
        fontSize=7.2,
        leading=9.4,
        textColor=INK,
    ),
    "white_small": ParagraphStyle(
        "WhiteSmall",
        fontName="SahlaBody",
        fontSize=8.5,
        leading=12,
        textColor=CREAM,
    ),
}


def para(text: object, style: str = "body") -> Paragraph:
    return Paragraph(escape(clean(text)).replace("\n", "<br/>"), STYLES[style])


def rich(html: str, style: str = "body") -> Paragraph:
    return Paragraph(html, STYLES[style])


def bullets(items: Iterable[object], style: str = "body") -> list[Paragraph]:
    return [Paragraph(escape(clean(item)), STYLES[style], bulletText="-") for item in items]


def callout(label: str, text: str, fill=LIME) -> Table:
    data = [[para(label.upper(), "mono"), para(text, "callout")]]
    table = Table(data, colWidths=[34 * mm, 137 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), fill),
                ("BOX", (0, 0), (-1, -1), 1.2, INK),
                ("LINEAFTER", (0, 0), (0, -1), 1.2, INK),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    return table


def link(label: str, url: str, style: str = "table") -> Paragraph:
    safe_url = escape(url, quote=True)
    return rich(f'<link href="{safe_url}" color="#245C67"><u>{escape(label)}</u></link>', style)


def standard_table(data, widths, header=True, font_size=None, repeat_rows=1) -> Table:
    table = Table(data, colWidths=widths, repeatRows=repeat_rows if header else 0, hAlign="LEFT")
    commands = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.35, RULE),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("BACKGROUND", (0, 1 if header else 0), (-1, -1), CREAM),
    ]
    if header:
        commands += [
            ("BACKGROUND", (0, 0), (-1, 0), INK),
            ("TEXTCOLOR", (0, 0), (-1, 0), CREAM),
            ("FONTNAME", (0, 0), (-1, 0), "SahlaBodyBold"),
        ]
    table.setStyle(TableStyle(commands))
    return table


def logo_drawing(width=250, reverse=False) -> Drawing:
    scale = width / 560
    height = 128 * scale
    d = Drawing(width, height)
    def X(v): return v * scale
    dark = CREAM if reverse else INK
    d.add(Rect(X(8), X(16), X(96), X(96), rx=X(22), ry=X(22), fillColor=INK, strokeColor=None))
    cable = RLPath()
    cable.moveTo(X(26), X(92))
    cable.lineTo(X(37), X(92))
    cable.curveTo(X(62), X(92), X(80), X(82), X(80), X(66))
    cable.curveTo(X(80), X(53), X(69), X(48), X(53), X(48))
    cable.curveTo(X(39), X(48), X(31), X(51), X(31), X(58))
    cable.curveTo(X(31), X(66), X(41), X(68), X(56), X(68))
    cable.strokeColor = LIME
    cable.strokeWidth = X(8)
    cable.fillColor = None
    d.add(cable)
    connector = RLPath()
    connector.moveTo(X(30), X(84))
    connector.lineTo(X(21), X(84))
    connector.curveTo(X(16), X(84), X(13), X(81), X(13), X(76))
    connector.curveTo(X(13), X(71), X(16), X(68), X(21), X(68))
    connector.lineTo(X(30), X(68))
    connector.closePath()
    connector.fillColor = CYAN
    connector.strokeColor = None
    d.add(connector)
    d.add(Line(X(13), X(72), X(9), X(72), strokeColor=CYAN, strokeWidth=X(3)))
    d.add(Line(X(13), X(80), X(9), X(80), strokeColor=CYAN, strokeWidth=X(3)))
    d.add(Circle(X(56), X(68), X(4), fillColor=CREAM, strokeColor=None))
    d.add(String(X(128), X(67), "SETUP SAHLA", fontName="SahlaDisplay", fontSize=X(44), fillColor=dark))
    d.add(Line(X(130), X(48), X(493), X(48), strokeColor=dark, strokeWidth=X(5)))
    d.add(Line(X(493), X(48), X(531), X(33), strokeColor=dark, strokeWidth=X(5)))
    d.add(Line(X(531), X(33), X(546), X(33), strokeColor=CYAN, strokeWidth=X(4)))
    d.add(String(X(130), X(20), "FIX THE FRICTION. KEEP THE GEAR.", fontName="SahlaBodyBold", fontSize=X(13), fillColor=PAPER if reverse else MUTED))
    return d


class ScoreBadge(Flowable):
    def __init__(self, score: int, width=68, height=68):
        super().__init__()
        self.score = score
        self.width = width
        self.height = height

    def draw(self):
        c = self.canv
        c.setFillColor(INK)
        c.roundRect(0, 0, self.width, self.height, 10, fill=1, stroke=0)
        c.setStrokeColor(LIME)
        c.setLineWidth(3)
        c.line(10, 12, self.width - 10, 12)
        c.setFont("SahlaDisplay", 26)
        c.setFillColor(CREAM)
        c.drawCentredString(self.width / 2, 31, str(self.score))
        c.setFont("SahlaMonoBold", 7)
        c.setFillColor(CYAN)
        c.drawCentredString(self.width / 2, 19, "OF 100")


def make_thumbnail(source: Path, target: Path, size=(900, 560)) -> Path:
    target.parent.mkdir(parents=True, exist_ok=True)
    with PILImage.open(source) as img:
        rgb = img.convert("RGB")
        fitted = ImageOps.fit(rgb, size, method=PILImage.Resampling.LANCZOS, centering=(0.5, 0.5))
        if target.suffix.lower() == ".png":
            fitted.save(target, "PNG", optimize=True)
        else:
            fitted.save(target, "JPEG", quality=85, optimize=True)
    return target


ASSET_BY_SLUG = {
    "anker-332-usb-c-hub": "setup-sahla-category-usb-c-hub.png",
    "ugreen-40289-laptop-stand": "setup-sahla-category-laptop-stand.png",
    "havit-f2069-laptop-cooling-pad": "setup-sahla-category-cooling-pad.png",
    "joyroom-jr-zs368-cable-organizer": "setup-sahla-category-cable-management.png",
    "logitech-signature-m650-mouse": "setup-sahla-category-quiet-mouse.png",
}


def prepare_assets(products: list[dict]) -> dict[str, Path]:
    assets = {}
    for product in products:
        name = ASSET_BY_SLUG[product["slug"]]
        assets[product["slug"]] = make_thumbnail(
            ROOT / "assets" / "generated" / name,
            THUMBS / f'{product["slug"]}.jpg',
        )
        make_thumbnail(
            ROOT / "assets" / "generated" / name,
            THUMBS / f'{product["slug"]}.png',
            size=(450, 280),
        )
    for name in [
        "setup-sahla-home-hero.png",
        "setup-sahla-blog-desk-setup-diagnostic.png",
        "setup-sahla-blog-usb-c-hub-guide.png",
        "setup-sahla-blog-thermal-posture-cable-workflow.png",
        "setup-sahla-og-social-1200x630.png",
    ]:
        assets[name] = make_thumbnail(ROOT / "assets" / "generated" / name, THUMBS / name.replace(".png", ".jpg"))
    return assets


def page_decorator(report_title: str):
    def _draw(canvas, doc):
        canvas.saveState()
        width, height = A4
        if doc.page == 1:
            canvas.setFillColor(INK)
            canvas.rect(0, 0, width, height, fill=1, stroke=0)
            canvas.setStrokeColor(LIME)
            canvas.setLineWidth(5)
            canvas.line(0, 18 * mm, width * 0.62, 18 * mm)
            canvas.setStrokeColor(CYAN)
            canvas.line(width * 0.62, 18 * mm, width, 30 * mm)
        else:
            canvas.setFillColor(CREAM)
            canvas.rect(0, 0, width, height, fill=1, stroke=0)
            canvas.setFillColor(PAPER)
            canvas.rect(0, height - 17 * mm, width, 17 * mm, fill=1, stroke=0)
            canvas.setFont("SahlaMonoBold", 7)
            canvas.setFillColor(INK)
            canvas.drawString(15 * mm, height - 10.8 * mm, "SETUP SAHLA / LAUNCH SYSTEM")
            canvas.drawRightString(width - 15 * mm, height - 10.8 * mm, clean(report_title).upper()[:72])
            canvas.setStrokeColor(RULE)
            canvas.setLineWidth(0.5)
            canvas.line(15 * mm, 13 * mm, width - 15 * mm, 13 * mm)
            canvas.setFont("SahlaBody", 7)
            canvas.setFillColor(MUTED)
            canvas.drawString(15 * mm, 8.5 * mm, "Evidence snapshot: 2026-07-15 / Egypt launch market")
            canvas.drawRightString(width - 15 * mm, 8.5 * mm, f"{doc.page}")
        canvas.restoreState()
    return _draw


def cover_story(kicker: str, title: str, subtitle: str, hero: Path | None = None) -> list:
    story = [Spacer(1, 18 * mm), logo_drawing(205, reverse=True), Spacer(1, 30 * mm)]
    story += [para(kicker, "cover_kicker"), para(title, "cover_title"), para(subtitle, "cover_sub")]
    if hero:
        story += [Spacer(1, 4 * mm), Image(str(hero), width=171 * mm, height=76 * mm, kind="proportional")]
    story += [Spacer(1, 8 * mm), para("Prepared 15 July 2026 / Egypt-first / MENA-aware by design", "white_small"), PageBreak()]
    return story


def build_pdf(path: Path, title: str, story: list) -> None:
    doc = SimpleDocTemplate(
        str(path),
        pagesize=A4,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=23 * mm,
        bottomMargin=18 * mm,
        title=title,
        author="Setup Sahla",
        subject="Setup Sahla business launch package",
    )
    doc.build(story, onFirstPage=page_decorator(title), onLaterPages=page_decorator(title))


def product_page(product: dict, image_path: Path, index: int) -> list:
    rows = [[
        Image(str(image_path), width=76 * mm, height=47 * mm, kind="proportional"),
        [
            para(f"PRODUCT {index} / {product['candidateId']}", "mono"),
            para(product["name"], "h1"),
            para(product["category"], "small"),
        ],
        ScoreBadge(product["score"]["total"]),
    ]]
    header = Table(rows, colWidths=[80 * mm, 70 * mm, 20 * mm])
    header.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 5)]))
    story = [header, Spacer(1, 5 * mm)]
    story += [callout("Friction", product["problem"], PAPER), Spacer(1, 3 * mm), callout("Decision", product["verdict"], LIME)]
    fit_data = [
        [para("A FIT FOR", "table_bold"), para("SKIP IF", "table_bold")],
        [para("\n".join(f"- {clean(x)}" for x in product["bestFor"]), "table"), para("\n".join(f"- {clean(x)}" for x in product["skipIf"]), "table")],
    ]
    fit = standard_table(fit_data, [85 * mm, 85 * mm], header=True)
    story += [Spacer(1, 4 * mm), fit]
    story += [para("Compatibility gate", "h2")]
    story += bullets(product["compatibility"], "small")
    components = product["score"]["components"]
    score_items = [(re.sub(r"([A-Z])", r" \1", k).title(), v) for k, v in components.items()]
    component_line = "  /  ".join(f"{name}: {value}" for name, value in score_items)
    story += [para(f"Score components - {component_line}", "mono")]
    story += [para("Provider snapshot", "h2")]
    provider_rows = [[para("RETAILER", "table_bold"), para("PRICE / DATE", "table_bold"), para("STATUS", "table_bold"), para("OBSERVATION + LINK", "table_bold")]]
    for provider in product["providers"]:
        provider_rows.append([
            para(provider["retailer"], "table_bold"),
            para(f"EGP {provider['priceEgp']:,.2f}".rstrip("0").rstrip(".") + f"\n{provider['capturedAt']}", "table"),
            para(provider["affiliateStatus"], "table"),
            Table([[para(provider["sellerNotes"], "table")], [link("Open exact listing", provider["directUrl"]) ]], colWidths=[69 * mm], style=TableStyle([("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),0),("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),2)])),
        ])
    story += [standard_table(provider_rows, [28 * mm, 27 * mm, 42 * mm, 73 * mm], header=True)]
    evidence_ids = ", ".join(e["evidenceId"] for e in product["evidence"])
    story += [Spacer(1, 3 * mm), para(f"Evidence IDs: {evidence_ids}. Primary keyword: {product['primaryKeyword']['keyword']} ({product['primaryKeyword']['metricName']} = {product['primaryKeyword']['metricValue']}, qualitative; captured {product['primaryKeyword']['capturedAt'][:10]}).", "mono")]
    story += [para("Selected retailer values are dated snapshots. Recheck the exact model, seller, fulfillment, returns, stock, and price before promotion. Noon Egypt commission eligibility is not established by the captured public terms.", "small")]
    return story


def build_research_pdf(products: list[dict], assets: dict[str, Path]) -> None:
    path = DELIVERABLES / "Setup-Sahla-Product-Research-Report.pdf"
    story = cover_story(
        "PRODUCT RESEARCH / LAUNCH SET",
        "Five problem-solving setup products for Egypt",
        "A traceable selection report covering methodology, qualitative search signals, exact-provider snapshots, compatibility gates, alternatives, and affiliate limitations.",
        assets["setup-sahla-home-hero.png"],
    )
    story += [para("Executive decision", "h1")]
    story += [callout("Launch set", "Five exact products, five distinct friction clusters, ten live Egypt retailer destinations at research capture, and original category visuals.")]
    story += [Spacer(1, 4 * mm), para("Why these five", "h2")]
    story += bullets([
        "Each selected item solves a different recurring setup problem: ports, screen position, airflow space, cable reach, or pointer fit.",
        "Every product has a manufacturer or official model trail plus exact Amazon Egypt and Noon Egypt product pages in the research record.",
        "Keyword evidence is qualitative. Google Autocomplete presence supports language and intent routing; it is not search volume, difficulty, or a growth forecast.",
        "Scores are an editorial ranking inside the evaluated candidate set. They are not laboratory performance scores or market-share evidence.",
    ])
    story += [para("Methodology and evidence boundary", "h2")]
    methodology = [
        [para("STAGE", "table_bold"), para("CONTROL", "table_bold"), para("OUTPUT", "table_bold")],
        [para("Candidate screening", "table"), para("15 candidates across five problem clusters", "table"), para("Exact model and provider trail or rejection", "table")],
        [para("Demand language", "table"), para("Egypt-locale autocomplete plus source/date", "table"), para("Qualitative route and intent labels only", "table")],
        [para("Claim control", "table"), para("Manufacturer/official specs plus retailer snapshots", "table"), para("Compatibility, dated price, seller/stock cautions", "table")],
        [para("Selection", "table"), para("Seven-component score totals to 100", "table"), para("Five launch products and one closest rejected alternative each", "table")],
        [para("Commercial status", "table"), para("Direct links until approved IDs and link checks exist", "table"), para(DIRECT_STATE, "table")],
    ]
    story += [standard_table(methodology, [35 * mm, 65 * mm, 70 * mm], header=True)]
    story += [Spacer(1, 4 * mm), para("Launch ranking", "h2")]
    ranking = [[para("RANK", "table_bold"), para("PRODUCT", "table_bold"), para("CLUSTER", "table_bold"), para("SCORE", "table_bold"), para("PRIMARY KEYWORD", "table_bold")]]
    for i, p in enumerate(sorted(products, key=lambda x: x["score"]["total"], reverse=True), 1):
        ranking.append([para(i, "table"), para(p["name"], "table_bold"), para(p["category"], "table"), para(p["score"]["total"], "table_bold"), para(p["primaryKeyword"]["keyword"], "table")])
    story += [standard_table(ranking, [15 * mm, 57 * mm, 50 * mm, 18 * mm, 30 * mm], header=True), PageBreak()]

    for index, product in enumerate(products, 1):
        story += product_page(product, assets[product["slug"]], index)
        story += [PageBreak()]

    story += [para("Alternatives and rejection logic", "h1")]
    story += [para("A rejected candidate is not automatically a bad product. It lost its launch slot because the evidence or provider shape was weaker for this specific Egypt-first publication decision.", "body")]
    alt_rows = [[para("SELECTED PRODUCT", "table_bold"), para("CLOSEST REJECTED ALTERNATIVE / WHY IT LOST", "table_bold")]]
    for p in products:
        alt_rows.append([para(p["name"], "table_bold"), para(p["closestRejectedAlternative"], "table")])
    story += [standard_table(alt_rows, [62 * mm, 108 * mm], header=True)]
    story += [para("Cross-cutting limitations", "h2")]
    story += bullets([
        "Retailer price, stock, seller, fulfillment, returns, and listing identity can change after the capture date.",
        "No volume, trend-rate, conversion, commission, or revenue claim is supported by the qualitative keyword evidence.",
        "MENA-aware is a design and expansion posture. The demand and retailer evidence in this report is Egypt-specific.",
        "Public product imagery is original. Retailer and manufacturer pages remain source links only unless a current permission record says otherwise.",
        "Fit language for comfort and preference remains editorial judgment, not medical, ergonomic, thermal, or performance proof.",
    ])
    story += [PageBreak(), para("Provider and affiliate status", "h1")]
    story += [callout("Current state", DIRECT_STATE, PAPER), Spacer(1, 4 * mm), callout("Noon Egypt", NOON_STATE, CYAN)]
    story += [para("Amazon Egypt", "h2")]
    story += bullets([
        "The official Amazon Egypt Associates enrollment route exists, and tracked links require the program's approved special-link process.",
        "Until the owner completes enrollment, obtains an approved account/tag, generates each program link, and verifies the exact destination, every Amazon product link stays direct.",
        "The public site must not imply active commission before the program relationship and the link state are verified.",
    ])
    story += [para("Noon Egypt", "h2")]
    story += bullets([
        "The captured public Noon Associate Marketing terms identify UAE and Saudi Arabia; they do not establish Egypt territory eligibility.",
        "Noon Egypt product pages can remain useful direct provider destinations, but no commission promise or tracking activation is permitted without written owner confirmation and destination-level verification.",
    ])
    story += [para("Refresh cadence", "h2")]
    refresh_rows = [
        [para("WHEN", "table_bold"), para("RECHECK", "table_bold"), para("ACTION IF FAILED", "table_bold")],
        [para("Launch day and every 14 days", "table"), para("Exact model, destination, price snapshot, seller, stock, fulfillment, returns wording, link state", "table"), para("Remove prominent CTA and set LINK DISABLED — REVIEW REQUIRED", "table")],
        [para("Every 90 days", "table"), para("Search intent, technical claims, compatibility, content usefulness, program terms, image rights", "table"), para("Reopen the earliest evidence or claim gate and rebuild downstream assets", "table")],
        [para("Any reader correction", "table"), para("Source and affected page immediately", "table"), para("Contain first; document and assign follow-up within one business day", "table")],
    ]
    story += [standard_table(refresh_rows, [35 * mm, 80 * mm, 55 * mm], header=True)]
    story += [para("Primary source register", "h2")]
    sources = [
        ("Amazon Egypt Associates enrollment", "https://affiliate-program.amazon.eg/welcome"),
        ("Amazon Egypt operating agreement", "https://affiliate-program.amazon.eg/help/operating/agreement"),
        ("Amazon Egypt program policies", "https://affiliate-program.amazon.eg/help/operating/policies/"),
        ("Noon Associate Marketing terms", "https://affiliates.noon.com/en/terms"),
        ("Canonical evidence registry", "research/evidence.csv"),
        ("Canonical keyword registry", "research/keywords.csv"),
    ]
    for label, url in sources:
        if url.startswith("http"):
            story.append(link(label, url, "body"))
        else:
            story.append(para(f"{label}: {url}", "body"))
    build_pdf(path, "Setup Sahla Product Research Report", story)


def color_swatch(name: str, hex_value: str, role: str) -> Table:
    swatch = Table([[""], [para(name, "table_bold")], [para(hex_value, "mono")], [para(role, "small")]], colWidths=[31 * mm], rowHeights=[19 * mm, 8 * mm, 7 * mm, 19 * mm])
    swatch.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), colors.HexColor(hex_value)),
        ("BOX", (0, 0), (-1, -1), 0.8, INK),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return swatch


def build_brand_pdf(assets: dict[str, Path]) -> None:
    path = DELIVERABLES / "Setup-Sahla-Brand-Guide.pdf"
    story = cover_story(
        "BRAND IDENTITY / VERSION 1.0",
        "A calm workshop identity for practical setup fixes",
        "Logo, palette, typography, voice, editorial controls, original creative system, and application rules for Egypt-first launch content.",
        assets["setup-sahla-og-social-1200x630.png"],
    )
    story += [para("Brand core", "h1")]
    story += [callout("Tagline", "Fix the friction. Keep the gear.")]
    story += [Spacer(1, 4 * mm), para("Setup Sahla is a practical guide for people in Egypt who already own usable PC or laptop gear and want to remove one daily setup problem at a time. The name pairs the familiar category word setup with sahla - easy - without pretending every technical choice is effortless.", "body")]
    story += [para("Positioning", "h2"), para("Evidence-led, locally available setup fixes for ports, posture, heat, cable clutter, and input comfort. Egypt is the launch market. MENA-aware describes design readiness and cultural fluency, not region-wide demand evidence.", "body")]
    story += [para("Promise", "h2"), para("Start with the symptom. Check compatibility. Show the trade-off. Offer the smallest credible fix. A recommendation is useful only when the reader can also see who should skip it.", "body")]
    story += [para("Personality", "h2")]
    personality = [
        ("Calm expert", "Decisive after the evidence, candid before it."),
        ("Workshop host", "Warm, organized, and specific about what connects where."),
        ("Friction hunter", "Notices the irritating five-minute problems that compound every day."),
        ("Budget-respectful", "Keeps working gear in service instead of glorifying replacement."),
        ("Locally grounded", "Makes EGP, availability, and Egypt retailer context explicit."),
    ]
    p_rows = [[para("TRAIT", "table_bold"), para("BEHAVIOR", "table_bold")]] + [[para(a, "table_bold"), para(b, "table")] for a, b in personality]
    story += [standard_table(p_rows, [45 * mm, 125 * mm], header=True), PageBreak()]

    story += [para("Logo system", "h1"), Spacer(1, 5 * mm), logo_drawing(420, reverse=False), Spacer(1, 8 * mm)]
    story += [callout("Visual idea", "One line, one solved path. A continuous cable line resolves into an S, connector, underline, route, or diagram path.", PAPER)]
    story += [para("Usage rules", "h2")]
    story += bullets([
        "Use the full logo on cream or warm paper at 220px or wider. Below that, use the compact mark plus live-text brand name.",
        "Keep at least two cable-stroke diameters around the mark and three around the full lockup.",
        "Do not rotate, stretch, outline, bevel, glow, add gradients, or combine it with retailer/product marks.",
        "On dark backgrounds, reverse the wordmark and tagline to cream; lime and cyan stay unchanged.",
        "For one-color use, preserve the cable as a knockout or remove the tile; never bury same-color cable geometry inside a solid tile.",
    ])
    story += [PageBreak(), para("Color system", "h1")]
    swatches = [[
        color_swatch("Ink", "#101411", "Primary text and inverse surface"),
        color_swatch("Warm paper", "#E9DFCA", "Workshop panels and evidence bands"),
        color_swatch("Signal lime", "#C9FF4A", "Primary action and solved route"),
        color_swatch("Cool cyan", "#66D9E8", "Data and compatibility accent"),
        color_swatch("Clean cream", "#FFFDF7", "Main canvas and report background"),
    ]]
    palette = Table(swatches, colWidths=[34 * mm] * 5)
    palette.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 1.5), ("RIGHTPADDING", (0, 0), (-1, -1), 1.5)]))
    story += [palette, Spacer(1, 7 * mm)]
    story += [para("Accessible pairings", "h2")]
    access = [
        [para("PAIR", "table_bold"), para("RATIO", "table_bold"), para("APPROVED USE", "table_bold")],
        [para("Ink on cream", "table"), para("18.27:1", "table_bold"), para("All text and icons", "table")],
        [para("Ink on warm paper", "table"), para("14.04:1", "table_bold"), para("All text and icons", "table")],
        [para("Ink on signal lime", "table"), para("15.83:1", "table_bold"), para("Buttons, labels, small text", "table")],
        [para("Cyan on ink", "table"), para("11.20:1", "table_bold"), para("Data labels, connector detail, inverse links", "table")],
    ]
    story += [standard_table(access, [55 * mm, 35 * mm, 80 * mm], header=True)]
    story += [Spacer(1, 4 * mm), para("Lime and cyan are accents, not default text colors on cream. Status never relies on color alone; pair it with a label, icon, line pattern, or shape.", "body")]
    story += [PageBreak(), para("Typography and layout", "h1")]
    type_rows = [
        [para("ROLE", "table_bold"), para("STACK", "table_bold"), para("USE", "table_bold")],
        [para("Display", "table_bold"), para("Arial Narrow / Roboto Condensed / Bahnschrift Condensed / Arial", "table"), para("Short H1/H2, forceful utility headings", "table")],
        [para("Body and UI", "table_bold"), para("Inter / Segoe UI / Arial", "table"), para("Natural sentence case; 1.58 line height", "table")],
        [para("Arabic", "table_bold"), para("Noto Sans Arabic / Tahoma / Arial", "table"), para("Preserve shaping; never letter-space Arabic", "table")],
        [para("Data and IDs", "table_bold"), para("Cascadia Mono / Consolas", "table"), para("Evidence IDs, dates, ports, dimensions", "table")],
    ]
    story += [standard_table(type_rows, [35 * mm, 75 * mm, 60 * mm], header=True)]
    story += [para("Signature components", "h2")]
    components = [
        ("Friction ticket", "Names a symptom or gate: SOLVES / TOO FEW PORTS, CHECK FIRST / LAPTOP SIZE, SKIP IF / ..."),
        ("Cable route", "Connects symptom -> compatibility gate -> fix -> retailer choice. Every stop has a text label."),
        ("Evidence label", "Pairs evidence ID, checked date, source status, currency, and snapshot date."),
        ("Sturdy card", "Uses 16px radius, 2px ink border for key decisions, 1px neutral border for supporting content, and a hard-edged shadow."),
    ]
    c_rows = [[para("COMPONENT", "table_bold"), para("RULE", "table_bold")]] + [[para(a, "table_bold"), para(b, "table")] for a, b in components]
    story += [standard_table(c_rows, [42 * mm, 128 * mm], header=True)]
    story += [PageBreak(), para("Voice and editorial system", "h1")]
    story += [callout("Voice in one line", "Name the friction, check the gate, explain the fit, show the exit.")]
    principles = [
        ("1. Problem before product", "Start with the symptom in the reader's language. Introduce a category or model only after the problem is clear."),
        ("2. Specific, not absolute", "Say what a source supports and label the point where editorial judgment begins."),
        ("3. Compatibility before conversion", "Put the decision gate and a reader-verifiable check before every retailer link."),
        ("4. Dated, not live-looking", "Label price, stock, seller, rating, and returns as observations with capture dates."),
        ("5. Useful without a click", "Every page helps the reader diagnose, verify, or skip a purchase."),
    ]
    story += [Spacer(1, 4 * mm)]
    for title, text in principles:
        story += [para(title, "h3"), para(text, "body")]
    story += [para("Page-writing sequence", "h2")]
    sequence = ["Friction", "Quick verdict", "Compatibility gate", "Trade-offs and skip guidance", "Affiliate disclosure", "Provider snapshot", "Named-retailer CTA", "Evidence and checked date"]
    seq_rows = [[para(str(i), "table_bold"), para(item, "table")] for i, item in enumerate(sequence, 1)]
    story += [standard_table([[para("STEP", "table_bold"), para("CONTENT", "table_bold")]] + seq_rows, [20 * mm, 150 * mm], header=True)]
    story += [PageBreak(), para("Commercial language controls", "h1")]
    story += [callout("Direct-link disclosure", f"{DIRECT_STATE}. Buying links currently go directly to the retailer. Setup Sahla does not yet earn from these links. Affiliate tracking may be added only after program, territory, and finished-link verification.", PAPER)]
    story += [Spacer(1, 4 * mm), callout("Noon Egypt safeguard", NOON_STATE, CYAN)]
    voice_rows = [
        [para("APPROVED", "table_bold"), para("AVOID", "table_bold")],
        [para("Check current price on Amazon Egypt", "table"), para("Buy now", "table")],
        [para("View the exact listing on Noon Egypt", "table"), para("Grab it", "table")],
        [para("Check compatibility before choosing", "table"), para("Works with all laptops", "table")],
        [para("EGP [amount] snapshot observed on [date]", "table"), para("Only EGP [amount] today", "table")],
        [para("Editorial fit judgment: ...", "table"), para("Best for everyone", "table")],
    ]
    story += [Spacer(1, 5 * mm), standard_table(voice_rows, [85 * mm, 85 * mm], header=True)]
    story += [para("Arabic-aware behavior", "h2")]
    story += bullets([
        "Use real Arabic terms only when natural; do not force slang or transliteration.",
        "A full Arabic component uses lang=ar and dir=rtl, preserves shaping, and keeps USB/HDMI/model strings isolated left-to-right.",
        "Research capture includes Arabic queries, but the launch demand evidence remains qualitative and Egypt-specific.",
    ])
    story += [PageBreak(), para("Original creative system", "h1")]
    story += [para("The visual story is friction becoming a route. Public launch art is original and category-generic: no retailer logos, copied listing compositions, exact packaging, prices, stock, badges, or unsupported performance readouts.", "body")]
    gallery_names = [
        ("Ports / USB-C hub", assets["anker-332-usb-c-hub"]),
        ("Posture / laptop stand", assets["ugreen-40289-laptop-stand"]),
        ("Thermal / cooling pad", assets["havit-f2069-laptop-cooling-pad"]),
        ("Cable control", assets["joyroom-jr-zs368-cable-organizer"]),
        ("Input comfort", assets["logitech-signature-m650-mouse"]),
        ("Launch hero", assets["setup-sahla-home-hero.png"]),
    ]
    grid = []
    for i in range(0, len(gallery_names), 2):
        row = []
        for label, image_path in gallery_names[i:i+2]:
            inner = Table([[Image(str(image_path), width=78 * mm, height=47 * mm, kind="proportional")], [para(label, "table_bold")]], colWidths=[80 * mm])
            inner.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 0.8, INK), ("LEFTPADDING", (0, 0), (-1, -1), 3), ("RIGHTPADDING", (0, 0), (-1, -1), 3), ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]))
            row.append(inner)
        grid.append(row)
    gallery = Table(grid, colWidths=[85 * mm, 85 * mm])
    gallery.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 2), ("RIGHTPADDING", (0,0), (-1,-1), 2), ("TOPPADDING", (0,0), (-1,-1), 2), ("BOTTOMPADDING", (0,0), (-1,-1), 5)]))
    story += [gallery, PageBreak(), para("Creative and rights checklist", "h1")]
    story += bullets([
        "Origin record includes slot ID, prompt, generator or artist, generation date, and retained source file.",
        "Rights status is exactly ORIGINAL; any other status returns to rights review.",
        "No Amazon, Noon, manufacturer, product, certification, or operating-system logo appears.",
        "The object is category-generic and does not mimic distinctive protected industrial design.",
        "Ports, plugs, cable direction, gravity, fan placement, and device scale remain physically plausible.",
        "No visual promises charging, speed, temperature, adhesion, comfort, or compatibility.",
        "No price, stock, seller, review rating, scarcity, CTA, or promotional claim is baked into the image.",
        "Required desktop and mobile crops preserve the essential subject and safe area.",
        "Alt text is written or the asset is intentionally decorative.",
    ])
    story += [callout("Fallback", "If an asset's origin or permission cannot be verified, withdraw it and use the original cable-line fallback.", PAPER)]
    build_pdf(path, "Setup Sahla Brand Guide", story)


def build_business_pdf(products: list[dict], editorial: dict, assets: dict[str, Path]) -> None:
    path = DELIVERABLES / "Setup-Sahla-Business-Launch-Plan.pdf"
    story = cover_story(
        "BUSINESS OPERATING PLAN / 90 DAYS",
        "Launch a useful affiliate business before monetization is active",
        "Positioning, publication gates, affiliate activation, content launch, 30/60/90 actions, measurement, risks, and owner inputs - without invented forecasts.",
        assets["setup-sahla-blog-desk-setup-diagnostic.png"],
    )
    story += [para("Launch decision", "h1")]
    story += [callout("Go-to-market", "Publish as an Egypt-first, problem-led setup guide with five product pages and three launch guides. Keep all retailer destinations direct until affiliate verification is complete.")]
    story += [Spacer(1, 4 * mm), para("Business model", "h2")]
    story += bullets([
        "Acquire through problem-led search guides, useful community answers, and original social excerpts.",
        "Move readers from symptom diagnosis to compatibility checks, trade-offs, exact product evidence, and a named retailer destination.",
        "Monetize only after Amazon Egypt or any other program link is approved, generated through the owner account, and independently verified.",
        "Treat retailer outbound clicks as commercial navigation, not purchases or commission. Program-reported orders and commission begin only after verified affiliate activation.",
        "Budget is intentionally unset. The launch is organic-first until the owner supplies an approved budget and a reliable baseline.",
    ])
    story += [para("Value proposition", "h2")]
    value_rows = [
        [para("WHAT SETUP SAHLA DOES", "table_bold"), para("WHAT IT REFUSES", "table_bold")],
        [para("Starts with a repeated setup friction", "table"), para("Generic gadget catalogue pages", "table")],
        [para("Checks exact compatibility before a CTA", "table"), para("Works-with-everything claims", "table")],
        [para("Shows reasons to skip", "table"), para("Urgency, scarcity, and replacement hype", "table")],
        [para("Uses dated Egypt provider snapshots", "table"), para("Permanent cheapest-provider claims", "table")],
        [para("Uses original public visuals", "table"), para("Scraped retailer/manufacturer images", "table")],
    ]
    story += [standard_table(value_rows, [85 * mm, 85 * mm], header=True), PageBreak()]

    story += [para("Audience and message system", "h1")]
    audience_rows = [
        [para("AUDIENCE", "table_bold"), para("JOB TO BE DONE", "table_bold"), para("MESSAGE", "table_bold")],
        [para("Students and early-career laptop users", "table_bold"), para("Make one laptop setup more usable without replacing everything", "table"), para("Fix the repeated friction first; keep the working gear", "table")],
        [para("Remote workers and creators", "table_bold"), para("Stabilize ports, screen position, cables, heat path, and pointing", "table"), para("Check exact requirements and solve one workflow break at a time", "table")],
        [para("Family or gift buyers", "table_bold"), para("Avoid incompatible or redundant accessories", "table"), para("Use the fit and skip gates before choosing a retailer", "table")],
    ]
    story += [standard_table(audience_rows, [42 * mm, 63 * mm, 65 * mm], header=True)]
    story += [para("Acquisition loops", "h2")]
    loops = [
        ("Search diagnosis loop", "Qualitative Egypt keyword -> guide -> problem route -> product fit page -> direct provider link."),
        ("Practical-share loop", "Original pain-led post or answer-first community contribution -> guide -> reader question log."),
        ("Refresh-trust loop", "Scheduled retailer and evidence review -> visible dated update -> corrections -> stronger source record."),
        ("Email return loop", "Disabled until an approved platform, consent capture, privacy text, sender identity, and unsubscribe behavior exist."),
    ]
    l_rows = [[para("LOOP", "table_bold"), para("PATH", "table_bold")]] + [[para(a, "table_bold"), para(b, "table")] for a, b in loops]
    story += [standard_table(l_rows, [45 * mm, 125 * mm], header=True)]
    story += [PageBreak(), para("Affiliate activation", "h1")]
    story += [callout("All current product links", DIRECT_STATE, PAPER), Spacer(1, 4 * mm), callout("Noon Egypt", NOON_STATE, CYAN)]
    activation = [
        [para("PHASE", "table_bold"), para("AMAZON EGYPT CONTROL", "table_bold"), para("OWNER DEPENDENCY", "table_bold")],
        [para("Pre-application", "table_bold"), para("Publish the useful site, disclosures, trust pages, original content, and safe direct links", "table"), para("Domain, legal/tax review, identity/payment details", "table")],
        [para("Enrollment", "table_bold"), para("Apply through the official Amazon Egypt Associates route after the site is public", "table"), para("Owner-held application and approval", "table")],
        [para("Tag setup", "table_bold"), para("Generate one special program link at a time from the approved account; never hand-edit or borrow a tag", "table"), para("Amazon Associates ID/tag after enrollment", "table")],
        [para("Verification", "table_bold"), para("Check Egypt storefront, exact model/variant, final destination, relationship attributes, reviewer, UTC time, and rollback", "table"), para("Named reviewer and link registry", "table")],
        [para("Activation", "table_bold"), para("Change only the verified record to AFFILIATE_LINK — VERIFIED and use the correct disclosure", "table"), para("Passed destination check", "table")],
    ]
    story += [standard_table(activation, [30 * mm, 90 * mm, 50 * mm], header=True)]
    story += [para("Official program sources", "h2")]
    story += [link("Amazon Egypt Associates enrollment", "https://affiliate-program.amazon.eg/welcome", "body"), link("Amazon Egypt operating agreement", "https://affiliate-program.amazon.eg/help/operating/agreement", "body"), link("Amazon Egypt program policies", "https://affiliate-program.amazon.eg/help/operating/policies/", "body"), link("Noon Associate Marketing terms", "https://affiliates.noon.com/en/terms", "body")]
    story += [PageBreak(), para("Content launch map", "h1")]
    product_rows = [[para("PRODUCT ROUTE", "table_bold"), para("FRICTION", "table_bold"), para("PRIMARY KEYWORD", "table_bold"), para("SCORE", "table_bold")]]
    for p in products:
        product_rows.append([para(p["route"], "mono"), para(p["problem"], "table"), para(p["primaryKeyword"]["keyword"], "table"), para(p["score"]["total"], "table_bold")])
    story += [standard_table(product_rows, [42 * mm, 75 * mm, 35 * mm, 18 * mm], header=True)]
    story += [para("Three launch guides", "h2")]
    guide_rows = [[para("ROUTE", "table_bold"), para("FUNNEL ROLE", "table_bold"), para("PRIMARY CTA", "table_bold")]]
    for article in editorial["articles"]:
        guide_rows.append([para(article["targetRoute"], "mono"), para(article["funnelRole"], "table"), para(f"{article['primaryCta']['label']} -> {article['primaryCta']['href']}", "table")])
    story += [standard_table(guide_rows, [58 * mm, 60 * mm, 52 * mm], header=True)]
    story += [Spacer(1, 4 * mm), callout("Launch inventory target", "Exactly five approved product pages and three complete launch guides at release. This is a publication control, not a traffic or revenue forecast.", LIME)]
    story += [PageBreak(), para("Days 1-30: publish, instrument, establish baselines", "h1")]
    phase1 = [
        ("Launch day", "Run route, internal-link, disclosure, metadata, accessibility, and outbound-link checks; record rollback."),
        ("Launch day", "Recheck every exact Amazon Egypt and Noon Egypt destination with UTC-stamped audit."),
        ("Launch day", "Publish five product pages and three guides on the verified owner domain."),
        ("Week 1", "Verify Search Console after the public domain resolves, submit the sitemap, and configure privacy-approved measurement."),
        ("Week 1", "Distribute each guide through original pain-led social and answer-first community contributions."),
        ("Week 2", "Review indexing, broken links, query appearance, outbound events, and complete the 14-day provider audit."),
        ("Weeks 3-4", "Change titles, internal links, FAQs, or CTA context only when observed data supports the change."),
        ("Weeks 3-4", "Prepare and submit Amazon Egypt Associates application."),
        ("Day 30", "Freeze the first complete reporting window and record its limitations."),
    ]
    story += [standard_table([[para("TIMING", "table_bold"), para("ACTION", "table_bold")]] + [[para(a, "table_bold"), para(b, "table")] for a, b in phase1], [32 * mm, 138 * mm], header=True)]
    story += [Spacer(1, 4 * mm), para("Do not change product selection because of a few clicks. Early data is diagnostic. Record collection gaps, bot/referral noise, and incomplete periods instead of smoothing them into a claim.", "body")]
    story += [PageBreak(), para("Days 31-60: improve intent paths, activate only verified links", "h1")]
    phase2 = [
        ("Weeks 5-6", "Compare guide entrances, internal product clicks, and retailer outbound clicks by problem cluster; create a two-page improvement queue."),
        ("Weeks 5-6", "Refresh all providers and urgent-risk records, especially Havit discontinuation risk and JOYROOM price/stock spread."),
        ("Week 6", "If Amazon account access exists, obtain the owner tag and convert/test one exact product link at a time."),
        ("Week 6", "Ask Noon for written Egypt eligibility; keep tracking inactive until explicit confirmation is retained."),
        ("Weeks 7-8", "Update one guide section or decision aid from observed questions and query wording, with a change note."),
        ("Week 8", "Run the next provider audit and disclosure sweep."),
        ("Day 60", "Compare the second complete period with baseline without calling correlation a purchase outcome."),
    ]
    story += [standard_table([[para("TIMING", "table_bold"), para("ACTION", "table_bold")]] + [[para(a, "table_bold"), para(b, "table")] for a, b in phase2], [32 * mm, 138 * mm], header=True)]
    story += [para("Days 61-90: consolidate evidence and prepare the next cycle", "h2")]
    phase3 = [
        ("Weeks 9-10", "Audit query/landing-page -> product-page -> retailer-click journeys and refresh link states."),
        ("Week 11", "Review content accuracy, compatibility, disclosures, program terms, search intent, and image rights."),
        ("Week 11", "Approve a new brief, FAQ expansion, replacement, or an explicit no-publish decision from refresh evidence."),
        ("Week 12", "Run a second original-creative distribution cycle around the strongest observed reader problem."),
        ("Week 13", "Produce the 90-day review with actual scorecard, decisions, risks, and next-quarter plan."),
    ]
    story += [standard_table([[para("TIMING", "table_bold"), para("ACTION", "table_bold")]] + [[para(a, "table_bold"), para(b, "table")] for a, b in phase3], [32 * mm, 138 * mm], header=True)]
    story += [PageBreak(), para("Metrics and decision rules", "h1")]
    story += [callout("Measurement rule", "Observed values only. Use Not configured, Unverified, Incomplete window, or Not enough data when measurement is unavailable.", PAPER)]
    metrics = [
        [para("METRIC", "table_bold"), para("LAUNCH CONTROL / BASELINE", "table_bold"), para("DECISION USE", "table_bold")],
        [para("Published launch inventory", "table_bold"), para("TARGET: five product pages and three launch guides", "table"), para("Block release if counts differ", "table")],
        [para("Disclosure compliance", "table_bold"), para("TARGET: 100% of commercial pages", "table"), para("Roll back non-compliant page", "table")],
        [para("Retail-link freshness", "table_bold"), para("TARGET: 100% checked within 14 days", "table"), para("Recheck or disable stale links", "table")],
        [para("Affiliate link status coverage", "table_bold"), para("TARGET: every retailer link has one valid state", "table"), para("Prevent unknown tracking state", "table")],
        [para("Organic entrances and query coverage", "table_bold"), para("Not configured until Search Console and approved analytics are verified", "table"), para("Diagnose indexing and intent gaps", "table")],
        [para("Guide-to-product and product-to-retailer click rates", "table_bold"), para("Owner-set only after first complete baseline", "table"), para("Improve relevance, fit, trust, and CTA context", "table")],
        [para("Affiliate-reported orders and commission", "table_bold"), para("No verified affiliate links", "table"), para("Report program values only after activation", "table")],
    ]
    story += [Spacer(1, 4 * mm), standard_table(metrics, [47 * mm, 73 * mm, 50 * mm], header=True)]
    story += [para("Decision rules", "h2")]
    story += bullets([
        "Fix incomplete tracking before setting performance targets.",
        "Treat retailer outbound clicks as navigation, not checkout conversion.",
        "Disable a failed or changed-model retailer destination immediately, regardless of traffic.",
        "After the first complete baseline, any numeric goal must be labeled TARGET with owner, date, baseline, rationale, and review window.",
        "Do not infer MENA demand, affiliate eligibility, or revenue from the Egypt launch evidence.",
    ])
    story += [PageBreak(), para("Risk register", "h1")]
    risks = [
        ("Retail price, stock, seller, or listing changes", "Recheck exact page, qualify the snapshot, update the record, or disable the CTA."),
        ("Failed or redirected retailer link", "Remove the prominent CTA immediately and set LINK DISABLED — REVIEW REQUIRED until reverified."),
        ("Noon Egypt commission assumption", f"Keep direct with tracking inactive and record {NOON_STATE}."),
        ("Amazon application delay or decline", "Keep useful direct links, resolve the named deficiency, and never borrow a tag."),
        ("Claim or model identity drift", "Roll back to the earliest failed evidence/claim gate and rebuild downstream artifacts."),
        ("Thin initial traffic", "Continue problem-led owned content and technical SEO; do not infer conversion from a few visits."),
        ("Image-rights violation", "Withdraw the asset and use the original fallback; review the creative pipeline."),
        ("Analytics or consent unconfigured", "Keep optional tracking and email disabled; use only lawfully available records."),
    ]
    risk_rows = [[para("RISK", "table_bold"), para("CONTROL RESPONSE", "table_bold")]] + [[para(a, "table_bold"), para(b, "table")] for a, b in risks]
    story += [standard_table(risk_rows, [65 * mm, 105 * mm], header=True)]
    story += [Spacer(1, 4 * mm), callout("Incident rule", "Contain a failed link immediately. Documentation, owner assignment, and follow-up are completed within one business day, but that documentation never delays containment.", RED)]
    story += [PageBreak(), para("Owner inputs and launch gates", "h1")]
    owner_rows = [
        [para("OWNER INPUT", "table_bold"), para("WHY IT MATTERS", "table_bold"), para("PHASE", "table_bold")],
        [para("Domain", "table_bold"), para("Public owner-controlled destination and rollback record", "table"), para("Before publication", "table")],
        [para("Legal and tax review", "table_bold"), para("Disclosures, privacy, affiliate income, and local obligations", "table"), para("Before publication / monetization", "table")],
        [para("Owner contact and correction inbox", "table_bold"), para("Trust page, reader corrections, incident route", "table"), para("Before publication", "table")],
        [para("Analytics platform", "table_bold"), para("Privacy-approved observed baselines", "table"), para("After publication", "table")],
        [para("Search Console owner account", "table_bold"), para("Verify property and submit sitemap", "table"), para("After domain resolves", "table")],
        [para("Amazon Associates ID/tag", "table_bold"), para("Generate owner-approved special links", "table"), para("After enrollment supplies it", "table")],
        [para("Noon Egypt eligibility confirmation", "table_bold"), para("Written territory evidence before any commission claim", "table"), para("Before Noon tracking", "table")],
        [para("Email platform and consent path", "table_bold"), para("Return loop remains disabled until approved", "table"), para("Optional post-launch", "table")],
        [para("Payment and identity details", "table_bold"), para("Program enrollment and payouts", "table"), para("Owner-held during applications", "table")],
        [para("Operating owners and weekly review slot", "table_bold"), para("Link, research, editorial, site, and business decisions", "table"), para("Before recurring operations", "table")],
    ]
    story += [standard_table(owner_rows, [52 * mm, 78 * mm, 40 * mm], header=True)]
    story += [para("Pre-publication checklist", "h2")]
    story += bullets([
        "Exactly five product pages and three complete guides use approved canonical claims and original assets.",
        "Disclosure appears before the first commercial CTA on every page with a retailer link.",
        "Every exact Amazon Egypt and Noon Egypt destination is rechecked on launch day with reviewer and UTC time.",
        "Prices are dated EGP snapshots or replaced with Check current price.",
        "Compatibility and skip guidance precede provider links.",
        f"Every unverified commercial link remains {DIRECT_STATE}.",
        "Responsive, accessibility, metadata, structured-data, sitemap, internal-link, and rollback checks pass.",
    ])
    build_pdf(path, "Setup Sahla Business Launch Plan", story)


def create_contact_sheets(pdf_path: Path, rendered_dir: Path, out_prefix: str) -> list[Path]:
    pngs = sorted(rendered_dir.glob(f"{out_prefix}-*.png"), key=lambda p: int(re.search(r"-(\d+)\.png$", p.name).group(1)))
    outputs = []
    CONTACTS.mkdir(parents=True, exist_ok=True)
    for group_index in range(0, len(pngs), 2):
        group = pngs[group_index:group_index + 2]
        opened = []
        for page_path in group:
            with PILImage.open(page_path) as source_image:
                opened.append(source_image.convert("RGB").copy())
        thumb_width = 900
        resized = []
        for img in opened:
            ratio = thumb_width / img.width
            resized.append(img.resize((thumb_width, int(img.height * ratio)), PILImage.Resampling.LANCZOS))
        canvas_height = max(i.height for i in resized) + 100
        canvas = PILImage.new("RGB", (thumb_width * len(resized), canvas_height), "#D6D2C8")
        draw = ImageDraw.Draw(canvas)
        for idx, img in enumerate(resized):
            x = idx * thumb_width
            canvas.paste(img, (x, 50))
            draw.text((x + 18, 16), f"{pdf_path.name} / page {group_index + idx + 1}", fill="#101411")
        target = CONTACTS / f"{pdf_path.stem}-pages-{group_index + 1:02d}-{group_index + len(group):02d}.jpg"
        canvas.save(target, "JPEG", quality=90, subsampling=0)
        outputs.append(target)
    return outputs


def validate_pdfs(paths: list[Path]) -> dict:
    report = {}
    for path in paths:
        reader = PdfReader(str(path))
        text = "\n".join((page.extract_text() or "") for page in reader.pages)
        report[path.name] = {
            "bytes": path.stat().st_size,
            "pages": len(reader.pages),
            "text_chars": len(text),
            "has_setup_sahla": "SETUP SAHLA" in text.upper(),
            "has_direct_state": DIRECT_STATE in text,
            "has_noon_state": NOON_STATE in text,
            "empty_pages": [i + 1 for i, page in enumerate(reader.pages) if len((page.extract_text() or "").strip()) < 20],
        }
    return report


def main() -> None:
    DELIVERABLES.mkdir(parents=True, exist_ok=True)
    WORK.mkdir(parents=True, exist_ok=True)
    products = json.loads((ROOT / "data" / "products.json").read_text(encoding="utf-8"))
    editorial = json.loads((ROOT / "content" / "editorial-map.json").read_text(encoding="utf-8"))
    assets = prepare_assets(products)
    build_research_pdf(products, assets)
    build_brand_pdf(assets)
    build_business_pdf(products, editorial, assets)
    paths = [
        DELIVERABLES / "Setup-Sahla-Product-Research-Report.pdf",
        DELIVERABLES / "Setup-Sahla-Brand-Guide.pdf",
        DELIVERABLES / "Setup-Sahla-Business-Launch-Plan.pdf",
    ]
    validation = validate_pdfs(paths)
    (WORK / "pdf-validation.json").write_text(json.dumps(validation, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(validation, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
