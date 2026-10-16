// Đăng thuật ngữ của ngày lên Facebook Page TopKhoaHoc, qua tool đăng bài chung bên dự án VN Web Studio
// (automation-post-articles). Bài có ô xem trước link tới trang thuật ngữ (ảnh preview tự sinh).
//   node scripts/facebook-post.mjs                 → thuật ngữ hôm nay (giờ VN)
//   node scripts/facebook-post.mjs 2026-10-20      → ngày cụ thể
//   node scripts/facebook-post.mjs --dry-run       → chỉ in nội dung bài, không đăng
//   node scripts/facebook-post.mjs --all           → mọi thuật ngữ đã lên web (kể cả bài bonus), cũ trước, cách nhau 1 phút
// Đường dẫn tool: biến môi trường FB_PUBLISHER_DIR, mặc định ../VN Web Studio/automation-post-articles
// Mỗi thuật ngữ chỉ đăng một lần, ghi lại ở logs/facebook-posted.json.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");
const all = process.argv.includes("--all");
const date = process.argv.slice(2).find((arg) => /^\d{4}-\d{2}-\d{2}$/.test(arg))
  ?? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://topkhoahoc.online").replace(/\/$/, "");
const toolDir = path.resolve(process.env.FB_PUBLISHER_DIR ?? path.join(repo, "..", "VN Web Studio", "automation-post-articles"));

const termsDir = path.join(repo, "content", "terms");
const dateOf = (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? "").slice(0, 10));
const terms = fs.readdirSync(termsDir)
  .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
  .map((file) => ({ slug: file.slice(0, -3), ...matter(fs.readFileSync(path.join(termsDir, file), "utf8")).data }))
  .filter((term) => (all ? dateOf(term.date) <= date : dateOf(term.date) === date && !term.bonus))
  // Cũ trước; cùng ngày thì bài bonus trước, thuật ngữ của ngày sau cùng để nằm trên đầu Page.
  .sort((a, b) => dateOf(a.date).localeCompare(dateOf(b.date)) || Number(!a.bonus) - Number(!b.bonus) || String(a.term).localeCompare(String(b.term)));
if (!terms.length) {
  console.log(`Không có thuật ngữ cho ngày ${date}, bỏ qua.`);
  process.exit(0);
}

const logsDir = path.join(repo, "logs");
const stateFile = path.join(logsDir, "facebook-posted.json");
const posted = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, "utf8")) : {};

const hashtag = (text) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D")
  .split(/[^a-z0-9]+/i).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("");

function caption(term, link) {
  const tags = ["#TopKhoaHoc", "#ThuatNguTrending", `#${hashtag(String(term.category ?? "MangXaHoi"))}`, `#${hashtag(String(term.term))}`]
    .filter((tag, i, all) => tag.length > 2 && all.indexOf(tag) === i);
  const example = Array.isArray(term.examples) && term.examples[0] ? `\n\n💬 Ví dụ: “${term.examples[0]}”` : "";
  return `🔥 ${term.term} là gì?\n\n${term.short}${example}\n\n👉 Nguồn gốc, cách dùng và câu hỏi hay gặp: ${link}\n\n${tags.join(" ")}`;
}

// Trang mới chỉ lên sau khi Vercel deploy xong; Facebook lấy ảnh preview ngay lúc đăng nên phải chờ trang sống.
async function waitLive(url, minutes = 15) {
  for (let i = 0; i < minutes * 2; i++) {
    const res = await fetch(url, { redirect: "follow" }).catch(() => null);
    if (res?.ok) return true;
    await new Promise((resolve) => setTimeout(resolve, 30_000));
  }
  return false;
}

let failed = false;
let postedThisRun = 0;
for (const term of terms) {
  if (posted[term.slug]) {
    console.log(`${term.slug}: đã đăng Facebook trước đó (${posted[term.slug].facebookPostId}), bỏ qua.`);
    continue;
  }
  const page = `${siteUrl}/thuat-ngu/${term.slug}`;
  const link = `${page}?utm_source=facebook&utm_campaign=${date}`;
  const message = caption(term, link);
  if (dryRun) {
    console.log(`--- ${term.slug} (link preview: ${link}) ---\n${message}\n`);
    continue;
  }
  if (!(await waitLive(page))) {
    console.error(`${term.slug}: ${page} chưa truy cập được sau 15 phút, chưa đăng Facebook.`);
    failed = true;
    continue;
  }
  // Giãn cách khi đăng nhiều bài liền nhau để Facebook không coi là spam.
  if (postedThisRun > 0) await new Promise((resolve) => setTimeout(resolve, 60_000));
  postedThisRun++;
  fs.mkdirSync(logsDir, { recursive: true });
  const messageFile = path.join(logsDir, `facebook-${term.slug}.txt`);
  fs.writeFileSync(messageFile, message);
  try {
    const out = execFileSync(process.execPath, ["server/scripts/post.mjs", "--project", "topkhoahoc", "--message-file", messageFile, "--link", link, "--title", `${term.term} là gì?`], { cwd: toolDir, encoding: "utf8" });
    const result = JSON.parse(out.trim().split("\n").at(-1));
    // Bài chạy thử (tool đang DRY_RUN=true) không tính là đã đăng, để lần chạy thật vẫn đăng.
    if (!result.dryRun) {
      posted[term.slug] = { date, facebookPostId: result.facebookPostId, postedAt: new Date().toISOString() };
      fs.writeFileSync(stateFile, JSON.stringify(posted, null, 2));
    }
    console.log(`${term.slug}: đã đăng Facebook ${result.facebookPostId}${result.dryRun ? " (DRY_RUN)" : ""}`);
  } catch (err) {
    console.error(`${term.slug}: đăng Facebook thất bại. ${err.stderr || err.message}`);
    failed = true;
  } finally {
    fs.rmSync(messageFile, { force: true });
  }
}
process.exit(failed ? 1 : 0);
