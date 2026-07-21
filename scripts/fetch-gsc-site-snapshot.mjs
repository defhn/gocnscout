import fs from "fs";
import path from "path";
import process from "process";
import { google } from "googleapis";
import { config as loadDotenv } from "dotenv";

const DEFAULT_ENV_FILE = "C:/Users/Administrator/Documents/GitHub/aisolohr/.env.local";
const DEFAULT_SITE_URL = "sc-domain:gocnscout.com";
const SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const WINDOWS = [5, 7, 28, 90];

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function pct(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function number(value) {
  return new Intl.NumberFormat("en-US").format(Math.round(value || 0));
}

function cleanPath(url) {
  return url
    .replace(/^https?:\/\/(www\.)?gocnscout\.com/i, "")
    .replace(/^$/, "/");
}

function readArg(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : fallback;
}

function loadEnvFile() {
  const envFile = readArg("env", process.env.GSC_ENV_FILE || DEFAULT_ENV_FILE);
  if (!fs.existsSync(envFile)) {
    throw new Error(`Env file not found: ${envFile}`);
  }
  loadDotenv({ path: envFile, override: false });
  return envFile;
}

function normalizePrivateKey(key) {
  return key.replace(/^"|"$/g, "").replace(/\\n/g, "\n");
}

function getServiceAccountCredentials() {
  let json = process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON;
  if (json) {
    let parsed;
    try {
      parsed = JSON.parse(json);
    } catch {
      try {
        const decoded = Buffer.from(json, "base64").toString("utf-8");
        parsed = JSON.parse(decoded);
      } catch (err) {
        throw new Error("Failed to parse GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON as JSON or base64 JSON");
      }
    }
    if (!parsed.client_email || !parsed.private_key) {
      throw new Error("GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON must include client_email and private_key");
    }
    return {
      client_email: parsed.client_email,
      private_key: normalizePrivateKey(parsed.private_key),
    };
  }

  if (
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL &&
    process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY
  ) {
    return {
      client_email: process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL,
      private_key: normalizePrivateKey(process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY),
    };
  }

  return null;
}

function getOauthClient() {
  const clientId = process.env.GOOGLE_SEARCH_CONSOLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_SEARCH_CONSOLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_SEARCH_CONSOLE_OAUTH_REFRESH_TOKEN;
  const redirectUri =
    process.env.GOOGLE_SEARCH_CONSOLE_OAUTH_REDIRECT_URI ||
    "http://localhost:3001/api/admin/search-console/oauth/callback";

  if (!clientId || !clientSecret || !refreshToken) return null;

  const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  auth.setCredentials({ refresh_token: refreshToken });
  return auth;
}

function getAuthClient() {
  const preferSa = process.argv.includes("--sa") || process.env.PREFER_SERVICE_ACCOUNT === "true";
  
  if (preferSa) {
    const credentials = getServiceAccountCredentials();
    if (credentials) {
      return {
        auth: new google.auth.JWT({
          email: credentials.client_email,
          key: credentials.private_key,
          scopes: [SEARCH_CONSOLE_SCOPE],
        }),
        mode: "service_account",
      };
    }
  }

  const oauth = getOauthClient();
  if (oauth && !preferSa) {
    return { auth: oauth, mode: "oauth" };
  }

  const credentials = getServiceAccountCredentials();
  if (!credentials) {
    throw new Error("Missing GSC credentials: OAuth refresh token or service account credentials required.");
  }

  return {
    auth: new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: [SEARCH_CONSOLE_SCOPE],
    }),
    mode: "service_account",
  };
}

function aggregateRows(rows, keyIndex = 0) {
  const map = new Map();
  for (const row of rows) {
    const key = row.keys?.[keyIndex] || "(unknown)";
    const current =
      map.get(key) ||
      {
        key,
        clicks: 0,
        impressions: 0,
        ctrNumerator: 0,
        positionNumerator: 0,
      };

    const impressions = row.impressions || 0;
    current.clicks += row.clicks || 0;
    current.impressions += impressions;
    current.ctrNumerator += (row.ctr || 0) * impressions;
    current.positionNumerator += (row.position || 0) * impressions;
    map.set(key, current);
  }

  return [...map.values()]
    .map((item) => ({
      key: item.key,
      clicks: item.clicks,
      impressions: item.impressions,
      ctr: item.impressions ? item.clicks / item.impressions : 0,
      position: item.impressions ? item.positionNumerator / item.impressions : 0,
    }))
    .sort((a, b) => b.impressions - a.impressions);
}

async function queryGsc(client, siteUrl, startDate, endDate, dimensions) {
  const response = await client.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions,
      rowLimit: 25000,
      searchType: "web",
      dataState: "all",
    },
  });

  return response.data.rows || [];
}

function summarize(rows) {
  const clicks = rows.reduce((sum, row) => sum + (row.clicks || 0), 0);
  const impressions = rows.reduce((sum, row) => sum + (row.impressions || 0), 0);
  const weightedPosition = rows.reduce(
    (sum, row) => sum + (row.position || 0) * (row.impressions || 0),
    0,
  );
  return {
    clicks,
    impressions,
    ctr: impressions ? clicks / impressions : 0,
    position: impressions ? weightedPosition / impressions : 0,
    rowCount: rows.length,
  };
}

function makeWindow(end, days) {
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - days + 1);
  return {
    days,
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

function makeDailyTrend(rows) {
  return aggregateRows(rows)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((row) => ({
      date: row.key,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    }));
}

function trendSignal(dailyRows) {
  if (dailyRows.length < 4) return "数据天数太少，暂不判断趋势";
  const mid = Math.floor(dailyRows.length / 2);
  const first = dailyRows.slice(0, mid);
  const second = dailyRows.slice(mid);
  const avg = (items) => items.reduce((sum, row) => sum + row.impressions, 0) / items.length;
  const firstAvg = avg(first);
  const secondAvg = avg(second);
  const delta = firstAvg ? (secondAvg - firstAvg) / firstAvg : 0;

  if (delta > 0.25) return `后半段日均展现上升 ${pct(delta)}`;
  if (delta < -0.25) return `后半段日均展现下降 ${pct(Math.abs(delta))}`;
  return `后半段日均展现基本持平 (${pct(delta)})`;
}

function tableRows(rows, keyLabel, transformKey = (value) => value) {
  if (!rows.length) return "| - | - | - | - | - |\n";
  return rows
    .map(
      (row) =>
        `| ${transformKey(row.key)} | ${number(row.clicks)} | ${number(row.impressions)} | ${pct(row.ctr)} | ${row.position.toFixed(1)} |`,
    )
    .join("\n");
}

function buildMarkdown({ siteUrl, generatedAt, envFile, authMode, endDate, reports }) {
  let md = `# GSC Snapshot - gocnscout\n\n`;
  md += `- Generated at: ${generatedAt}\n`;
  md += `- GSC property: \`${siteUrl}\`\n`;
  md += `- Data end date: \`${formatDate(endDate)}\` (GSC usually has a few days of delay)\n`;
  md += `- Credential source: \`${envFile}\` (${authMode})\n\n`;

  md += `## Window Summary\n\n`;
  md += `| Window | Date Range | Clicks | Impressions | CTR | Avg Position | Rows | Trend Signal |\n`;
  md += `|---|---|---:|---:|---:|---:|---:|---|\n`;
  for (const report of reports) {
    md += `| ${report.days}d | ${report.startDate} to ${report.endDate} | ${number(report.summary.clicks)} | ${number(report.summary.impressions)} | ${pct(report.summary.ctr)} | ${report.summary.position.toFixed(1)} | ${number(report.summary.rowCount)} | ${report.trendSignal} |\n`;
  }

  for (const report of reports) {
    md += `\n## ${report.days} Days (${report.startDate} to ${report.endDate})\n\n`;
    md += `### Daily Trend\n\n`;
    md += `| Date | Clicks | Impressions | CTR | Avg Position |\n`;
    md += `|---|---:|---:|---:|---:|\n`;
    md += report.dailyTrend
      .map(
        (row) =>
          `| ${row.date} | ${number(row.clicks)} | ${number(row.impressions)} | ${pct(row.ctr)} | ${row.position.toFixed(1)} |`,
      )
      .join("\n");
    md += `\n\n### Top Queries\n\n`;
    md += `| Query | Clicks | Impressions | CTR | Avg Position |\n`;
    md += `|---|---:|---:|---:|---:|\n`;
    md += tableRows(report.topQueries.slice(0, 25), "Query");
    md += `\n\n### Top Pages\n\n`;
    md += `| Page | Clicks | Impressions | CTR | Avg Position |\n`;
    md += `|---|---:|---:|---:|---:|\n`;
    md += tableRows(report.topPages.slice(0, 25), "Page", (value) => `\`${cleanPath(value)}\``);
    md += `\n\n`;
  }

  md += `## Initial Read\n\n`;
  md += `- For a 6-7 day old site, GSC impression volatility is normal. Google often tests query/page fit in small batches before reallocating exposure.\n`;
  md += `- If 5d/7d daily averages are much lower than the 28d average, inspect the daily trend first: continuous decline matters more than one noisy day.\n`;
  md += `- If both impressions and query/page counts drop, check indexing, canonical tags, robots, sitemap, and recent metadata changes.\n`;
  md += `- If impressions drop while average position improves, Google may be narrowing the tested query set; that is not automatically a bad signal.\n`;

  return md;
}

async function main() {
  const envFile = loadEnvFile();
  const siteUrl = readArg("site", process.env.GSC_SITE_URL || DEFAULT_SITE_URL);
  const lagDays = Number(readArg("lag", process.env.GSC_LAG_DAYS || "3"));
  const outputDir = readArg("out", "seo-reports");

  const { auth, mode } = getAuthClient();
  const client = google.searchconsole({ version: "v1", auth });
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - lagDays);

  const reports = [];
  for (const days of WINDOWS) {
    const window = makeWindow(end, days);
    console.log(`Querying ${days}d: ${window.startDate} to ${window.endDate}`);
    const [dateRows, queryRows, pageRows] = await Promise.all([
      queryGsc(client, siteUrl, window.startDate, window.endDate, ["date"]),
      queryGsc(client, siteUrl, window.startDate, window.endDate, ["query"]),
      queryGsc(client, siteUrl, window.startDate, window.endDate, ["page"]),
    ]);
    const summary = summarize(dateRows);
    const dailyTrend = makeDailyTrend(dateRows);

    reports.push({
      ...window,
      summary,
      trendSignal: trendSignal(dailyTrend),
      dailyTrend,
      topQueries: aggregateRows(queryRows),
      topPages: aggregateRows(pageRows),
      queryTableSummary: summarize(queryRows),
      pageTableSummary: summarize(pageRows),
    });
  }

  const generatedAt = new Date().toISOString();
  const dateStamp = formatDate(new Date());
  const reportsDir = path.resolve(outputDir);
  fs.mkdirSync(reportsDir, { recursive: true });

  const payload = {
    generatedAt,
    siteUrl,
    dataEndDate: formatDate(end),
    authMode: mode,
    reports,
  };
  const base = `gsc-gocnscout-snapshot-${dateStamp}-lag${lagDays}`;
  const jsonPath = path.join(reportsDir, `${base}.json`);
  const mdPath = path.join(reportsDir, `${base}.md`);

  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), "utf8");
  fs.writeFileSync(
    mdPath,
    buildMarkdown({ siteUrl, generatedAt, envFile, authMode: mode, endDate: end, reports }),
    "utf8",
  );

  console.log(`Report written: ${mdPath}`);
  console.log(`Raw data written: ${jsonPath}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
