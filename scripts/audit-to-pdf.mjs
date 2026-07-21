#!/usr/bin/env node
/* ============================================================
   Nishana Airguns · audit-to-pdf
   ------------------------------------------------------------
   Reads nishanaairguns.com-audit/{audit-data.json,
   FULL-AUDIT-REPORT.md, ACTION-PLAN.md, findings/*.md}
   and generates a single A4 PDF with a styled cover +
   score chart + full report + findings appendix.

   Zero npm dependencies. Uses your local Chrome or Edge in
   headless mode to render the PDF. Detects browser path
   automatically on Windows, macOS, and Linux.

   Usage:
     node scripts/audit-to-pdf.mjs
     node scripts/audit-to-pdf.mjs --open      (auto-open the PDF after generation)
     node scripts/audit-to-pdf.mjs --keep-html (leave the temp HTML alongside for inspection)

   Output:
     nishanaairguns.com-audit/FULL-AUDIT-REPORT.pdf
   ============================================================ */

import { readFile, writeFile, readdir, mkdir, access, unlink } from "node:fs/promises";
import { existsSync, constants } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, basename } from "node:path";
import { tmpdir, platform } from "node:os";
import { argv, exit } from "node:process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const AUDIT_DIR = join(ROOT, "nishanaairguns.com-audit");
const OUT_PDF = join(AUDIT_DIR, "FULL-AUDIT-REPORT.pdf");
const TMP_HTML = join(tmpdir(), `nishana-audit-${Date.now()}.html`);

const flags = new Set(argv.slice(2));
const OPEN = flags.has("--open");
const KEEP_HTML = flags.has("--keep-html");

// ---- Browser detection --------------------------------------------------
function findChrome() {
  const env = process.env;
  const candidates = [];
  if (platform() === "win32") {
    candidates.push(
      `${env["PROGRAMFILES"]}\\Google\\Chrome\\Application\\chrome.exe`,
      `${env["PROGRAMFILES(X86)"]}\\Google\\Chrome\\Application\\chrome.exe`,
      `${env["LOCALAPPDATA"]}\\Google\\Chrome\\Application\\chrome.exe`,
      `${env["PROGRAMFILES"]}\\Microsoft\\Edge\\Application\\msedge.exe`,
      `${env["PROGRAMFILES(X86)"]}\\Microsoft\\Edge\\Application\\msedge.exe`
    );
  } else if (platform() === "darwin") {
    candidates.push(
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
    );
  } else {
    candidates.push(
      "/usr/bin/google-chrome",
      "/usr/bin/google-chrome-stable",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
      "/snap/bin/chromium",
      "/usr/bin/microsoft-edge"
    );
  }
  for (const p of candidates) if (existsSync(p)) return p;
  return null;
}

// ---- Minimal Markdown → HTML converter -----------------------------------
// Handles the features the audit files actually use: h1-h4, paragraphs,
// bullet + numbered lists, tables (GFM), fenced code, inline code, bold,
// italic, links, blockquotes, horizontal rules. No plugins, no edge cases.
function md2html(src) {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  let out = [];
  let i = 0;

  const escape = (s) => s.replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
  const inline = (s) => {
    // Code first so its contents aren't further processed
    let r = "";
    let j = 0;
    while (j < s.length) {
      if (s[j] === "`") {
        const end = s.indexOf("`", j + 1);
        if (end > j) {
          r += `<code>${escape(s.slice(j + 1, end))}</code>`;
          j = end + 1;
          continue;
        }
      }
      // Escape then apply bold/italic/link on the rest of the char
      // We batch until the next special
      let next = s.length;
      for (const ch of ["`"]) {
        const k = s.indexOf(ch, j);
        if (k >= 0 && k < next) next = k;
      }
      let chunk = escape(s.slice(j, next));
      chunk = chunk
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
      r += chunk;
      j = next;
    }
    return r;
  };

  while (i < lines.length) {
    const line = lines[i];

    // Horizontal rule
    if (/^---+\s*$/.test(line)) { out.push("<hr>"); i++; continue; }

    // Fenced code block
    if (/^```/.test(line)) {
      const lang = line.slice(3).trim();
      i++;
      const buf = [];
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++; // consume closing fence
      out.push(`<pre><code${lang ? ` class="language-${lang}"` : ""}>${escape(buf.join("\n"))}</code></pre>`);
      continue;
    }

    // Headings
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const lvl = h[1].length;
      out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`);
      i++;
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      out.push(`<blockquote>${inline(buf.join(" "))}</blockquote>`);
      continue;
    }

    // Table (GFM: header row, separator, body)
    if (line.includes("|") && i + 1 < lines.length && /^\s*\|?[\s|:-]+\|[\s|:-]+/.test(lines[i + 1])) {
      const parseRow = (l) => l.replace(/^\||\|$/g, "").split("|").map(c => c.trim());
      const header = parseRow(line);
      const sep = parseRow(lines[i + 1]);
      const aligns = sep.map(s => /^:-+:$/.test(s) ? "center" : /:-+$/.test(s) ? "right" : /^-+:$/.test(s) ? "right" : /^:-+$/.test(s) ? "left" : "");
      i += 2;
      const body = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        body.push(parseRow(lines[i])); i++;
      }
      let t = "<table><thead><tr>";
      header.forEach((c, k) => t += `<th${aligns[k] ? ` style="text-align:${aligns[k]}"` : ""}>${inline(c)}</th>`);
      t += "</tr></thead><tbody>";
      body.forEach(row => {
        t += "<tr>";
        row.forEach((c, k) => t += `<td${aligns[k] ? ` style="text-align:${aligns[k]}"` : ""}>${inline(c)}</td>`);
        t += "</tr>";
      });
      t += "</tbody></table>";
      out.push(t);
      continue;
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(inline(lines[i].replace(/^\s*[-*]\s+/, "")));
        i++;
      }
      out.push(`<ul>${items.map(x => `<li>${x}</li>`).join("")}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(inline(lines[i].replace(/^\s*\d+\.\s+/, "")));
        i++;
      }
      out.push(`<ol>${items.map(x => `<li>${x}</li>`).join("")}</ol>`);
      continue;
    }

    // Blank line
    if (line.trim() === "") { i++; continue; }

    // Paragraph — accumulate until blank line
    const buf = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !/^(#{1,6}|>|\s*[-*]\s+|\s*\d+\.\s+|```|---+\s*$|\|)/.test(lines[i])) {
      buf.push(lines[i]); i++;
    }
    out.push(`<p>${inline(buf.join(" "))}</p>`);
  }

  return out.join("\n");
}

// ---- SVG chart: score-by-category horizontal bars -----------------------
function scoreBarChart(categories, headline) {
  const width = 660, rowH = 46, padTop = 20, padBottom = 20;
  const height = padTop + categories.length * rowH + padBottom;
  const barX = 200, barW = 400;
  const rows = categories.map((c, k) => {
    const y = padTop + k * rowH + rowH / 2;
    const pct = Math.max(0, Math.min(100, c.score));
    const color = pct >= 80 ? "#2f7d4f" : pct >= 60 ? "#c9a227" : "#c8102e";
    return `
      <g transform="translate(0, ${y})">
        <text x="16" y="4" font-size="13" fill="#1c1a17" font-weight="600" font-family="ui-sans-serif, system-ui, sans-serif">${c.name}</text>
        <text x="${barX - 8}" y="4" font-size="13" fill="#6b645a" text-anchor="end" font-family="ui-monospace, monospace">${c.score}/100</text>
        <rect x="${barX}" y="-9" width="${barW}" height="18" rx="4" fill="#f0ebde" />
        <rect x="${barX}" y="-9" width="${barW * pct / 100}" height="18" rx="4" fill="${color}" />
        <text x="${barX + barW + 8}" y="4" font-size="12" fill="#6b645a" font-family="ui-monospace, monospace">${(c.score * c.weight / 100).toFixed(2)} pts</text>
      </g>`;
  }).join("");
  return `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto">
      ${rows}
    </svg>`;
}

// ---- Cover / score circle -----------------------------------------------
function scoreCircle(score) {
  const size = 220, r = 92, cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const dash = circumference * pct / 100;
  const color = pct >= 80 ? "#2f7d4f" : pct >= 60 ? "#c9a227" : "#c8102e";
  return `
    <svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e8e2d0" stroke-width="14" />
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="14"
              stroke-linecap="round"
              stroke-dasharray="${dash} ${circumference}"
              transform="rotate(-90 ${cx} ${cy})" />
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="52" font-weight="800" fill="#1c1a17" font-family="Georgia, serif">${score}</text>
      <text x="${cx}" y="${cy + 28}" text-anchor="middle" font-size="14" fill="#6b645a" font-family="ui-sans-serif, system-ui">/ 100</text>
    </svg>`;
}

// ---- Assemble HTML -------------------------------------------------------
async function buildHtml() {
  const data = JSON.parse(await readFile(join(AUDIT_DIR, "audit-data.json"), "utf8"));
  const report = await readFile(join(AUDIT_DIR, "FULL-AUDIT-REPORT.md"), "utf8");
  const plan   = await readFile(join(AUDIT_DIR, "ACTION-PLAN.md"), "utf8");

  const findingsDir = join(AUDIT_DIR, "findings");
  const findings = [];
  try {
    const files = await readdir(findingsDir);
    for (const f of files.filter(x => x.endsWith(".md")).sort()) {
      findings.push({ name: f.replace(/\.md$/, ""), body: await readFile(join(findingsDir, f), "utf8") });
    }
  } catch {}

  const sum = data.summary || {};
  const cats = (data.categories || []).map(c => ({
    name: c.name, score: c.score, weight: c.weight
  }));
  const totalContribution = cats.reduce((s, c) => s + (c.score * c.weight / 100), 0);

  const css = `
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 20mm 16mm;
      @bottom-right {
        content: counter(page) " / " counter(pages);
        font-family: ui-monospace, monospace;
        font-size: 9pt;
        color: #999;
      }
      @bottom-left {
        content: "nishanaairguns.com · SEO audit · ${data.meta?.audit_date || ""}";
        font-family: ui-monospace, monospace;
        font-size: 9pt;
        color: #999;
      }
    }
    @page :first { margin: 0; @bottom-right { content: ""; } @bottom-left { content: ""; } }

    :root {
      --ink: #1c1a17;
      --muted: #6b645a;
      --faint: #9a9184;
      --brass: #c9a227;
      --line: #e8e2d0;
      --paper: #fbf8f1;
      --paperAlt: #fffdf8;
      --green: #2f7d4f;
      --amber: #c9a227;
      --red: #c8102e;
    }

    * { box-sizing: border-box; }
    html, body {
      margin: 0; padding: 0;
      font-family: Georgia, "Iowan Old Style", "Times New Roman", serif;
      font-size: 11pt;
      line-height: 1.55;
      color: var(--ink);
      -webkit-font-smoothing: antialiased;
      background: white;
    }

    /* ---- Cover ---- */
    .cover {
      page-break-after: always;
      height: 297mm; width: 210mm;
      background: linear-gradient(135deg, #fbf8f1 0%, #f6f1e7 100%);
      padding: 32mm 24mm;
      display: flex; flex-direction: column; justify-content: space-between;
      position: relative;
    }
    .cover::before {
      content: ""; position: absolute; top: 0; left: 0; right: 0; height: 8px;
      background: linear-gradient(90deg, var(--brass), transparent 80%);
    }
    .cover .brand-mark {
      font-family: "Big Shoulders Display", ui-sans-serif, Impact, sans-serif;
      font-size: 14pt; letter-spacing: .28em; color: var(--brass);
      text-transform: uppercase; font-weight: 800;
    }
    .cover h1 {
      font-family: Georgia, serif;
      font-size: 48pt; margin: 8mm 0 4mm; letter-spacing: -1px;
      line-height: 1.05; color: var(--ink);
    }
    .cover .subtitle {
      font-size: 14pt; color: var(--muted); margin-bottom: 12mm;
    }
    .cover .score-row {
      display: flex; align-items: center; gap: 12mm; margin: 8mm 0 12mm;
    }
    .cover .score-meta {
      font-family: ui-sans-serif, system-ui, sans-serif;
      color: var(--muted); font-size: 11pt; line-height: 1.7;
    }
    .cover .score-meta strong { color: var(--ink); }
    .cover .findings-preview {
      font-family: ui-sans-serif, system-ui, sans-serif;
      background: white; border: 1px solid var(--line);
      border-left: 4px solid var(--brass);
      padding: 6mm 8mm; border-radius: 3mm;
    }
    .cover .findings-preview h3 {
      font-family: Georgia, serif;
      margin: 0 0 3mm; font-size: 12pt;
    }
    .cover .findings-preview ol { margin: 0; padding-left: 5mm; font-size: 10pt; line-height: 1.7; }
    .cover .footer-meta {
      font-family: ui-monospace, monospace;
      color: var(--faint); font-size: 9pt; letter-spacing: .05em;
    }

    /* ---- Content pages ---- */
    h1 { font-family: Georgia, serif; font-size: 24pt; margin: 0 0 6mm; letter-spacing: -0.3px; color: var(--ink); }
    h2 { font-family: Georgia, serif; font-size: 18pt; margin: 10mm 0 4mm; letter-spacing: -0.2px; color: var(--ink); border-bottom: 2px solid var(--line); padding-bottom: 2mm; }
    h3 { font-family: Georgia, serif; font-size: 14pt; margin: 8mm 0 3mm; color: var(--ink); }
    h4 { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 11pt; margin: 6mm 0 2mm; color: var(--muted); text-transform: uppercase; letter-spacing: .12em; font-weight: 700; }
    p, li { font-size: 10.5pt; }
    p { margin: 0 0 3mm; }
    ul, ol { margin: 0 0 4mm; padding-left: 6mm; }
    li { margin-bottom: 1.5mm; }
    strong { color: var(--ink); }
    em { color: var(--ink); }
    a { color: #3a5a7a; text-decoration: none; border-bottom: 1px solid #d5c9a8; }

    hr { border: none; border-top: 1px solid var(--line); margin: 6mm 0; }

    blockquote {
      margin: 3mm 0; padding: 3mm 6mm;
      background: #fbf8f1; border-left: 3px solid var(--brass);
      font-style: italic; color: var(--muted); font-size: 10pt;
    }

    /* ---- Tables ---- */
    table {
      border-collapse: collapse; width: 100%; margin: 3mm 0 5mm;
      font-family: ui-sans-serif, system-ui, sans-serif;
      font-size: 9pt;
      page-break-inside: avoid;
    }
    thead tr { background: #f6f1e7; }
    th, td {
      padding: 2.2mm 3mm; text-align: left;
      border-bottom: 1px solid var(--line);
      vertical-align: top;
    }
    th {
      font-weight: 700; color: var(--ink); font-size: 9pt;
      letter-spacing: .04em; text-transform: uppercase;
      border-bottom: 2px solid var(--ink);
    }
    tbody tr:nth-child(even) { background: #fbf8f100; }

    /* ---- Code ---- */
    code {
      font-family: ui-monospace, "SF Mono", Menlo, monospace;
      background: #f6f1e7; padding: 0.5mm 1.5mm;
      border-radius: 1mm; font-size: 9pt; color: var(--ink);
    }
    pre {
      background: #1c1a17; color: #f6f1e7;
      padding: 4mm 5mm; border-radius: 2mm;
      overflow-x: hidden; page-break-inside: avoid;
      font-size: 8pt; line-height: 1.5;
    }
    pre code { background: transparent; color: inherit; padding: 0; font-size: 8pt; }

    /* ---- Section title pages / dividers ---- */
    .section-title {
      page-break-before: always;
      padding-top: 6mm;
    }
    .section-title h1 { margin-bottom: 2mm; }
    .section-title .lead {
      font-size: 11pt; color: var(--muted);
      font-family: ui-sans-serif, system-ui, sans-serif;
      margin-bottom: 6mm;
    }

    /* ---- Score summary block ---- */
    .score-summary {
      background: white; border: 1px solid var(--line);
      padding: 6mm; margin: 4mm 0 6mm; border-radius: 3mm;
      page-break-inside: avoid;
    }
    .score-summary h3 { margin-top: 0; }

    /* ---- Chip / severity badges ---- */
    .sev { display: inline-block; padding: 0.3mm 2mm; border-radius: 1.5mm;
           font-family: ui-sans-serif, system-ui, sans-serif;
           font-size: 8pt; letter-spacing: .04em; text-transform: uppercase;
           font-weight: 700; }
    .sev-critical { background: #f4dcdf; color: #c8102e; }
    .sev-high     { background: #f3e8cf; color: #a9781c; }
    .sev-medium   { background: #e2efe6; color: #2f7d4f; }
    .sev-low      { background: #eee; color: #666; }
    .sev-info     { background: #e6f0f7; color: #3a5a7a; }
  </style>`;

  const findingsHtml = (data.categories || []).map(cat => {
    const rows = (cat.findings || []).map(f => `
      <tr>
        <td style="width:22%"><span class="sev sev-${(f.severity||'info').toLowerCase()}">${f.severity || "Info"}</span></td>
        <td><strong>${f.title || ""}</strong><br><span style="color:#6b645a;font-size:9pt">${f.description || ""}</span>${f.recommendation ? `<br><span style="color:#2f7d4f;font-size:9pt"><strong>Fix:</strong> ${f.recommendation}</span>` : ""}</td>
      </tr>`).join("");
    const worksHtml = (cat.what_works || []).length
      ? `<h4>What's working</h4><ul>${cat.what_works.map(w => `<li>${w}</li>`).join("")}</ul>`
      : "";
    const findingsTbl = rows
      ? `<h4>Findings</h4><table><thead><tr><th style="width:22%">Severity</th><th>Detail</th></tr></thead><tbody>${rows}</tbody></table>`
      : "";
    return `
      <div style="page-break-inside:avoid;margin-bottom:8mm">
        <h3>${cat.name} — ${cat.score} / 100  <span style="font-family:ui-monospace,monospace;font-size:10pt;color:#6b645a">(weight ${cat.weight}%)</span></h3>
        ${worksHtml}
        ${findingsTbl}
      </div>`;
  }).join("");

  const phasesHtml = ((data.action_plan || {}).phases || []).map(ph => {
    const items = (ph.items || []).map(i => `<li>${i}</li>`).join("");
    return `
      <div style="page-break-inside:avoid;margin-bottom:6mm">
        <h3>${ph.name}</h3>
        <p style="color:#6b645a;font-size:10pt;margin:0 0 2mm">${ph.timeframe || ""}</p>
        <ol>${items}</ol>
      </div>`;
  }).join("");

  const top = sum.top_findings || [];
  const quick = sum.quick_wins || [];

  const findingsAppendix = findings.map(f => `
    <div style="page-break-before:always">
      ${md2html(f.body)}
    </div>`).join("");

  return `<!doctype html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <title>SEO Audit — nishanaairguns.com — ${data.meta?.audit_date || ""}</title>
  ${css}
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div>
    <div class="brand-mark">SEO + GEO Audit</div>
    <h1>nishanaairguns<span style="color:var(--brass)">.com</span></h1>
    <div class="subtitle">Independent structural review · ${data.meta?.audit_date || ""}</div>
  </div>

  <div class="score-row">
    ${scoreCircle(sum.health_score || 0)}
    <div class="score-meta">
      <div style="font-family:Georgia,serif;font-size:22pt;color:var(--ink);margin-bottom:3mm">Health score</div>
      <strong>Business type:</strong> ${sum.business_type || "—"}<br>
      <strong>URLs analyzed:</strong> ${data.meta?.urls_analyzed || "—"}<br>
      <strong>Previous audit:</strong> ${data.meta?.previous_audit_date || "n/a"}<br>
      ${data.meta?.score_delta_vs_previous ? `<strong>Delta vs previous:</strong> ${data.meta.score_delta_vs_previous}` : ""}
    </div>
  </div>

  <div class="findings-preview">
    <h3>Top findings</h3>
    <ol>
      ${top.slice(0, 5).map(x => `<li>${x}</li>`).join("")}
    </ol>
  </div>

  <div class="footer-meta">
    Auditor: ${data.meta?.auditor || "Claude Code · seo-audit skill"}<br>
    Report companion files: ACTION-PLAN.md · findings/*.md · audit-data.json
  </div>
</div>

<!-- EXECUTIVE SUMMARY -->
<div class="section-title">
  <h1>Executive Summary</h1>
  <p class="lead">The score, what's working, what to do first.</p>

  <div class="score-summary">
    <h3 style="margin-top:0">Score by category</h3>
    ${scoreBarChart(cats)}
    <p style="font-family:ui-monospace,monospace;font-size:9pt;color:#6b645a;margin-top:4mm">
      Weighted total: ${totalContribution.toFixed(2)} → ${sum.health_score || 0} / 100
    </p>
  </div>

  <h3>Top findings (ordered by urgency)</h3>
  <ol>${top.map(x => `<li>${x}</li>`).join("")}</ol>

  ${quick.length ? `
    <h3>Quick wins</h3>
    <ol>${quick.map(x => `<li>${x}</li>`).join("")}</ol>
  ` : ""}

  ${sum.what_improved_since_2026_07_19 ? `
    <h3>What improved since ${data.meta?.previous_audit_date || "last audit"}</h3>
    <ul>${sum.what_improved_since_2026_07_19.map(x => `<li>${x}</li>`).join("")}</ul>
  ` : ""}

  ${sum.what_regressed_or_new_since_2026_07_19 ? `
    <h3>What regressed or was newly introduced</h3>
    <ul>${sum.what_regressed_or_new_since_2026_07_19.map(x => `<li>${x}</li>`).join("")}</ul>
  ` : ""}
</div>

<!-- CATEGORY FINDINGS TABLES -->
<div class="section-title">
  <h1>Findings by Category</h1>
  <p class="lead">Every finding, with severity, evidence, and recommended fix.</p>
  ${findingsHtml}
</div>

<!-- ACTION PLAN -->
<div class="section-title">
  <h1>Action Plan</h1>
  <p class="lead">Phased priorities. Ship top-to-bottom; each phase compounds on the previous.</p>
  ${phasesHtml}
</div>

<!-- FULL REPORT -->
<div class="section-title">
  <h1>Full Audit Report</h1>
  <p class="lead">The complete markdown report, converted to PDF.</p>
  ${md2html(report)}
</div>

<!-- ACTION PLAN (full markdown) -->
<div class="section-title">
  <h1>Action Plan Detail</h1>
  <p class="lead">Time-estimated backlog with dependencies.</p>
  ${md2html(plan)}
</div>

<!-- FINDINGS APPENDIX -->
${findings.length ? `
  <div class="section-title">
    <h1>Findings Appendix</h1>
    <p class="lead">Per-category deep dives.</p>
  </div>
  ${findingsAppendix}
` : ""}

</body>
</html>`;
}

// ---- Chrome launch -------------------------------------------------------
function runChrome(chrome, htmlPath, pdfPath) {
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-software-rasterizer",
    "--hide-scrollbars",
    "--no-margins",
    "--virtual-time-budget=5000",
    "--run-all-compositor-stages-before-draw",
    `--print-to-pdf=${pdfPath}`,
    "--no-pdf-header-footer",
    `file:///${htmlPath.replace(/\\/g, "/")}`,
  ];
  const res = spawnSync(chrome, args, { stdio: ["ignore", "pipe", "pipe"] });
  if (res.status !== 0) {
    // Fallback: try older headless flag
    const args2 = args.map(a => a === "--headless=new" ? "--headless" : a);
    const res2 = spawnSync(chrome, args2, { stdio: ["ignore", "pipe", "pipe"] });
    if (res2.status !== 0) {
      throw new Error(`Chrome exited with status ${res2.status}\nstderr: ${res2.stderr?.toString().slice(0, 400)}`);
    }
  }
}

// ---- Main ----------------------------------------------------------------
async function main() {
  console.log("Nishana Airguns · audit → PDF");

  const chrome = findChrome();
  if (!chrome) {
    console.error("\n✗ Couldn't find Chrome or Edge. Install Google Chrome, or edit this script to point at your browser binary.");
    exit(1);
  }
  console.log(`  browser: ${chrome}`);

  try { await access(join(AUDIT_DIR, "audit-data.json"), constants.R_OK); }
  catch { console.error("\n✗ Missing " + join(AUDIT_DIR, "audit-data.json") + " — run /seo-audit first."); exit(1); }

  const html = await buildHtml();
  await writeFile(TMP_HTML, html, "utf8");
  console.log(`  html:    ${TMP_HTML}  (${(html.length / 1024).toFixed(0)} KB)`);

  await mkdir(AUDIT_DIR, { recursive: true });
  runChrome(chrome, TMP_HTML, OUT_PDF);

  if (!KEEP_HTML) { try { await unlink(TMP_HTML); } catch {} }
  else console.log(`  html:    kept at ${TMP_HTML}`);

  console.log(`\n✓ PDF written to ${OUT_PDF}`);

  if (OPEN) {
    const opener = platform() === "win32" ? "cmd" : (platform() === "darwin" ? "open" : "xdg-open");
    const openArgs = platform() === "win32" ? ["/c", "start", "", OUT_PDF] : [OUT_PDF];
    spawnSync(opener, openArgs, { stdio: "ignore", detached: true });
  }
}

main().catch(e => { console.error("\n✗ Fatal: " + (e?.message || e)); exit(1); });
