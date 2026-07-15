import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { guideRouteAliases } from "@/app/lib/site";

function normalizeSource(source: string) {
  const withoutFrontmatter = source.startsWith("---")
    ? source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "")
    : source;
  return withoutFrontmatter
    .replaceAll("â€™", "’")
    .replaceAll("â€œ", "“")
    .replaceAll("â€", "”")
    .replaceAll("â€“", "–")
    .replaceAll("â€”", "—");
}

function remapHref(href: string) {
  return guideRouteAliases[href] ?? href;
}

function inline(text: string, key: string): ReactNode[] {
  const parts = text.split(/(<span lang="ar" dir="rtl">[^<]*<\/span>|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return parts.map((part, index) => {
    const tokenKey = `${key}-${index}`;
    const arabic = part.match(/^<span lang="ar" dir="rtl">([^<]*)<\/span>$/);
    if (arabic) return <span key={tokenKey} lang="ar" dir="rtl">{arabic[1]}</span>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={tokenKey}>{part.slice(2, -2)}</strong>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = remapHref(link[2]);
      if (/^https?:\/\//.test(href)) {
        return <a key={tokenKey} href={href} target="_blank" rel="nofollow noopener noreferrer">{link[1]}<span className="sr-only"> (opens in a new tab)</span></a>;
      }
      return <Link key={tokenKey} href={href}>{link[1]}</Link>;
    }
    return <Fragment key={tokenKey}>{part}</Fragment>;
  });
}

function headingId(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function tableCells(line: string) {
  return line.trim().slice(1, -1).split("|").map((cell) => cell.trim());
}

function isTableDivider(line: string | undefined) {
  return Boolean(line && /^\|(?:\s*:?-{3,}:?\s*\|)+$/.test(line.trim()));
}

export function MarkdownArticle({ source }: { source: string }) {
  const lines = normalizeSource(source).split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) { index += 1; continue; }
    if (line.startsWith("# ")) { index += 1; continue; }
    if (line.startsWith("|") && isTableDivider(lines[index + 1])) {
      const headings = tableCells(line);
      const tableStart = index;
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith("|") && lines[index].trim().endsWith("|")) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      blocks.push(
        <div className="article-table-wrap" role="region" aria-label={`Table: ${headings.join(", ")}`} tabIndex={0} key={`table-${tableStart}`}>
          <table>
            <thead><tr>{headings.map((heading, cellIndex) => <th scope="col" key={cellIndex}>{inline(heading, `th-${tableStart}-${cellIndex}`)}</th>)}</tr></thead>
            <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{inline(cell, `td-${tableStart}-${rowIndex}-${cellIndex}`)}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (line.startsWith("## ")) {
      const text = line.slice(3);
      blocks.push(<h2 id={headingId(text)} key={`h2-${index}`}>{inline(text, `h2-${index}`)}</h2>);
      index += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      const text = line.slice(4);
      blocks.push(<h3 id={headingId(text)} key={`h3-${index}`}>{inline(text, `h3-${index}`)}</h3>);
      index += 1;
      continue;
    }
    if (/^- /.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^- /.test(lines[index].trim())) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }
      blocks.push(<ul key={`ul-${index}`}>{items.map((item, itemIndex) => <li key={itemIndex}>{inline(item, `ul-${index}-${itemIndex}`)}</li>)}</ul>);
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\. /.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\. /, ""));
        index += 1;
      }
      blocks.push(<ol key={`ol-${index}`}>{items.map((item, itemIndex) => <li key={itemIndex}>{inline(item, `ol-${index}-${itemIndex}`)}</li>)}</ol>);
      continue;
    }
    const paragraph: string[] = [line];
    index += 1;
    while (index < lines.length) {
      const next = lines[index].trim();
      if (!next || /^#{1,3} |^- |^\d+\. |^\|/.test(next)) break;
      paragraph.push(next);
      index += 1;
    }
    const value = paragraph.join(" ");
    blocks.push(
      <p className={/^\[Evidence:/.test(value) ? "evidence-inline" : undefined} key={`p-${index}`}>
        {inline(value, `p-${index}`)}
      </p>,
    );
  }

  return <div className="article-body">{blocks}</div>;
}
