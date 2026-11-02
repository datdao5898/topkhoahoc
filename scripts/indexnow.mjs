// Báo URL mới cho IndexNow (Bing, Yandex, Seznam…; ChatGPT Search và Copilot dùng index của Bing).
//   node scripts/indexnow.mjs          → thuật ngữ lên trang hôm nay (giờ VN) + trang chủ, danh sách
//   node scripts/indexnow.mjs --all    → mọi thuật ngữ đã đăng
//   node scripts/indexnow.mjs a b      → bài a, b vừa push: chờ Vercel deploy xong rồi mới gửi. Bài hẹn ngày tương lai thì bỏ qua.
// Chạy tự động bởi .github/workflows/indexnow.yml: mỗi lần push bài mới, và mỗi đêm cho bài hẹn ngày.
import fs from "node:fs";
import path from "node:path";

const SITE_URL = (process.env.SITE_URL ?? "https://topkhoahoc.online").replace(/\/$/, "");
const KEY = fs.readFileSync(path.join(process.cwd(), "lib", "site.ts"), "utf8").match(/indexNowKey:\s*"([0-9a-f]+)"/)[1];
const args = process.argv.slice(2);
const all = args.includes("--all");
const only = args.filter((arg) => !arg.startsWith("--"));

const dir = path.join(process.cwd(), "content", "terms");
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());

const slugs = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
  .filter((f) => {
    const date = fs.readFileSync(path.join(dir, f), "utf8").match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
    if (only.length) return only.includes(f.replace(/\.md$/, "")) && date <= today;
    return all ? date <= today : date === today;
  })
  .map((f) => f.replace(/\.md$/, ""));

if (only.length && !slugs.length) {
  console.log(`Chưa có bài nào lên trang trong: ${only.join(", ")}. Bài hẹn ngày sẽ được gửi đêm đúng ngày đó.`);
  process.exit(0);
}

// Bài vừa push chỉ lên sau khi Vercel deploy xong.
let timedOut = false;
if (only.length) {
  for (const slug of slugs) {
    const url = `${SITE_URL}/thuat-ngu/${slug}`;
    let up = false;
    for (let i = 0; i < 30 && !up; i++) {
      if (i > 0) await new Promise((resolve) => setTimeout(resolve, 30_000));
      up = (await fetch(url, { headers: { "Cache-Control": "no-cache" } }).catch(() => null))?.ok ?? false;
    }
    if (!up) {
      console.error(`${url} chưa truy cập được sau 15 phút.`);
      timedOut = true;
    }
  }
}

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
if ((!res.ok && res.status !== 202) || timedOut) process.exit(1);
