// Báo URL mới cho IndexNow (Bing, Yandex, Seznam…; ChatGPT Search và Copilot dùng index của Bing).
//   node scripts/indexnow.mjs          → thuật ngữ lên trang hôm nay (giờ VN) + trang chủ, danh sách
//   node scripts/indexnow.mjs --all    → mọi thuật ngữ đã đăng
// Chạy tự động mỗi ngày bởi .github/workflows/indexnow.yml.
import fs from "node:fs";
import path from "node:path";

const SITE_URL = (process.env.SITE_URL ?? "https://topkhoahoc.online").replace(/\/$/, "");
const KEY = fs.readFileSync(path.join(process.cwd(), "lib", "site.ts"), "utf8").match(/indexNowKey:\s*"([0-9a-f]+)"/)[1];
const all = process.argv.includes("--all");

const dir = path.join(process.cwd(), "content", "terms");
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());

const slugs = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
  .filter((f) => {
    const date = fs.readFileSync(path.join(dir, f), "utf8").match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
    return all ? date <= today : date === today;
  })
  .map((f) => f.replace(/\.md$/, ""));

const urls = [
  `${SITE_URL}/`,
  `${SITE_URL}/thuat-ngu`,
  `${SITE_URL}/llms.txt`,
  ...slugs.map((s) => `${SITE_URL}/thuat-ngu/${s}`),
];

// Gọi thử từng URL trước: vừa đảm bảo trang đã lên (200), vừa làm mới cache ISR.
const live = [];
for (const url of urls) {
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
  console.log(`${res.status} ${url}`);
  if (res.ok) live.push(url);
}

if (!slugs.length) console.log("Hôm nay không có thuật ngữ mới, chỉ gửi trang chủ/danh sách.");

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(SITE_URL).host,
    key: KEY,
    keyLocation: `${SITE_URL}/${KEY}.txt`,
    urlList: live,
  }),
});
console.log(`IndexNow: HTTP ${res.status} (${live.length} URL)`);
if (!res.ok && res.status !== 202) process.exit(1);
