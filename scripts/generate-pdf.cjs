const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { execSync } = require('child_process');

const mdPath = path.join(__dirname, '../docs/200-short-video-topics-plan.md');
const htmlPath = path.join(__dirname, '../docs/200-short-video-topics-plan.html');
const pdfPath = path.join(__dirname, '../docs/200-short-video-topics-plan.pdf');

console.log('Reading markdown file...');
const mdContent = fs.readFileSync(mdPath, 'utf8');

console.log('Converting Markdown to HTML...');
const htmlBody = marked.parse(mdContent);

const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>GoCNScout 200个短视频矩阵选题规划方案</title>
<style>
  @page {
    size: A4;
    margin: 15mm 15mm 15mm 15mm;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    color: #1e293b;
    line-height: 1.6;
    font-size: 13px;
    padding: 20px;
    background: #ffffff;
  }
  h1 {
    font-size: 24px;
    color: #0f766e;
    border-bottom: 3px solid #0f766e;
    padding-bottom: 8px;
    margin-top: 0;
  }
  h2 {
    font-size: 18px;
    color: #0f766e;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 6px;
    margin-top: 24px;
    page-break-after: avoid;
  }
  h3 {
    font-size: 15px;
    color: #0f172a;
    margin-top: 18px;
    margin-bottom: 8px;
    page-break-after: avoid;
  }
  p, li {
    font-size: 12.5px;
    color: #334155;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 11.5px;
    page-break-inside: auto;
  }
  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
  th {
    background-color: #0f766e;
    color: #ffffff;
    font-weight: 600;
    text-align: left;
    padding: 8px;
    border: 1px solid #0f766e;
  }
  td {
    padding: 7px;
    border: 1px solid #cbd5e1;
    vertical-align: top;
  }
  tr:nth-child(even) {
    background-color: #f8fafc;
  }
  blockquote {
    border-left: 4px solid #0f766e;
    background: #f0fdf4;
    padding: 8px 12px;
    margin: 12px 0;
    color: #166534;
    font-size: 12px;
  }
  code {
    background: #f1f5f9;
    color: #0f766e;
    padding: 2px 5px;
    border-radius: 4px;
    font-family: Consolas, Monaco, monospace;
    font-size: 11.5px;
  }
  ul, ol {
    padding-left: 20px;
  }
</style>
</head>
<body>
${htmlBody}
</body>
</html>`;

fs.writeFileSync(htmlPath, fullHtml, 'utf8');
console.log('HTML written to:', htmlPath);

const edgeExecutable = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromeExecutable = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserPath = fs.existsSync(chromeExecutable) ? chromeExecutable : edgeExecutable;

console.log('Using browser for PDF generation:', browserPath);

const cmd = `"${browserPath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${htmlPath}"`;
console.log('Executing:', cmd);

try {
  execSync(cmd, { stdio: 'inherit' });
  console.log('PDF generated successfully at:', pdfPath);
  const stats = fs.statSync(pdfPath);
  console.log('PDF File Size:', stats.size, 'bytes');
} catch (err) {
  console.error('Error generating PDF:', err);
  process.exit(1);
}
