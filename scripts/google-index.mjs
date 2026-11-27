// Báo Google có bài mới, bằng service account (không cần thư viện ngoài).
//   node scripts/google-index.mjs              → gửi lại sitemap lên Search Console
//   node scripts/google-index.mjs a b          → như trên, và nếu bật Indexing API thì báo thêm từng bài a, b
//   node scripts/google-index.mjs --check a    → hỏi URL Inspection API xem bài a đã được index chưa (chỉ đọc)
//
// Thông tin đăng nhập: biến GOOGLE_SERVICE_ACCOUNT (nội dung file JSON của service account),
// hoặc GOOGLE_APPLICATION_CREDENTIALS (đường dẫn tới file JSON đó). Không có thì bỏ qua, không báo lỗi.
// GOOGLE_INDEXING_API=1 bật thêm Indexing API. Google chỉ hỗ trợ chính thức API này cho trang tuyển dụng
// và livestream, nên mặc định tắt (xem README phần "Google").
// Chạy tự động bởi .github/workflows/indexnow.yml, ngay sau bước IndexNow.
import crypto from "node:crypto";
import fs from "node:fs";

const SITE_URL = (process.env.SITE_URL ?? "https://topkhoahoc.online").replace(/\/$/, "");
const args = process.argv.slice(2);
const check = args.includes("--check");
const slugs = args.filter((arg) => !arg.startsWith("--"));

const raw =
  process.env.GOOGLE_SERVICE_ACCOUNT ||
  (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf8"));
if (!raw) {
  console.log("Chưa có GOOGLE_SERVICE_ACCOUNT, bỏ qua bước báo Google.");
  process.exit(0);
}
const account = JSON.parse(raw);

const b64url = (data) => Buffer.from(data).toString("base64url");

async function accessToken(scope) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({ iss: account.client_email, scope, aud: account.token_uri, iat: now, exp: now + 3600 }),
  );
  const signature = crypto.sign("RSA-SHA256", Buffer.from(`${header}.${claims}`), account.private_key).toString("base64url");
  const res = await fetch(account.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${signature}`,
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Không lấy được token Google: ${JSON.stringify(body)}`);
  return body.access_token;
}

async function call(token, method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body && { "Content-Type": "application/json" }) },
    body: body && JSON.stringify(body),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : {} };
}

// Property trong Search Console: dạng domain (sc-domain:) hoặc dạng URL. Lấy cái service account được cấp quyền.
async function findProperty(token) {
  const { ok, data } = await call(token, "GET", "https://www.googleapis.com/webmasters/v3/sites");
  if (!ok) throw new Error(`Không đọc được danh sách site trong Search Console: ${JSON.stringify(data)}`);
  const host = new URL(SITE_URL).host;
  const wanted = [`sc-domain:${host}`, `${SITE_URL}/`];
  const site = (data.siteEntry ?? []).find((s) => wanted.includes(s.siteUrl) && s.permissionLevel !== "siteUnverifiedUser");
  if (!site) {
    throw new Error(
      `Service account ${account.client_email} chưa được thêm vào Search Console của ${host}. ` +
        "Vào Search Console → Cài đặt → Người dùng và quyền → Thêm người dùng, quyền Chủ sở hữu.",
    );
  }
  return site.siteUrl;
}

let failed = false;
const webmasters = await accessToken(
  check ? "https://www.googleapis.com/auth/webmasters.readonly" : "https://www.googleapis.com/auth/webmasters",
);
const property = await findProperty(webmasters);
const base = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}`;

if (check) {
  for (const slug of slugs) {
    const url = `${SITE_URL}/thuat-ngu/${slug}`;
    const { ok, data } = await call(webmasters, "POST", "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
      inspectionUrl: url,
      siteUrl: property,
      languageCode: "vi",
    });
    const r = data.inspectionResult?.indexStatusResult;
    console.log(ok ? `${r?.coverageState ?? "?"} (lần crawl cuối: ${r?.lastCrawlTime ?? "chưa"}) ${url}` : `Lỗi ${JSON.stringify(data)}`);
  }
  process.exit(0);
}

const sitemap = `${SITE_URL}/sitemap.xml`;
const submitted = await call(webmasters, "PUT", `${base}/sitemaps/${encodeURIComponent(sitemap)}`);
console.log(`Search Console: gửi sitemap ${sitemap} → HTTP ${submitted.status}`);
if (!submitted.ok) {
  console.error(JSON.stringify(submitted.data));
  failed = true;
}

if (process.env.GOOGLE_INDEXING_API === "1" && slugs.length) {
  const indexing = await accessToken("https://www.googleapis.com/auth/indexing");
  for (const slug of slugs) {
    const url = `${SITE_URL}/thuat-ngu/${slug}`;
    const { ok, status, data } = await call(indexing, "POST", "https://indexing.googleapis.com/v3/urlNotifications:publish", {
      url,
      type: "URL_UPDATED",
    });
    console.log(`Indexing API: HTTP ${status} ${url}`);
    if (!ok) {
      console.error(JSON.stringify(data));
      failed = true;
    }
  }
}

if (failed) process.exit(1);
