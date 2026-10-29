// Đăng video thuật ngữ (Reel) lên Facebook Page TopKhoaHoc, qua tool đăng bài chung bên VN Web Studio.
//   node scripts/facebook-video.mjs <thư mục video>            → đăng <thư mục>/video.mp4, mô tả lấy từ storyboard.json
//   node scripts/facebook-video.mjs <thư mục video> --dry-run  → chỉ in mô tả
//   node scripts/facebook-video.mjs <thư mục video> --schedule 2026-10-30T20:00:00+07:00  → Facebook tự đăng đúng giờ
// Thư mục video do video/make.py tạo (có storyboard.json). Mỗi thuật ngữ chỉ đăng video một lần,
// ghi ở logs/facebook-videos.json (tách khỏi logs/facebook-posted.json của bài thuật ngữ hằng ngày).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = process.argv.slice(2).find((arg, i, all) => !arg.startsWith("--") && all[i - 1] !== "--schedule");
const dryRun = process.argv.includes("--dry-run");
const scheduleIndex = process.argv.indexOf("--schedule");
const schedule = scheduleIndex >= 0 ? process.argv[scheduleIndex + 1] : undefined;
if (!dir) {
  console.error("Cách dùng: node scripts/facebook-video.mjs <thư mục video> [--dry-run]");
  process.exit(1);
}
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://topkhoahoc.online").replace(/\/$/, "");
const toolDir = path.resolve(process.env.FB_PUBLISHER_DIR ?? path.join(repo, "..", "VN Web Studio", "automation-post-articles"));

const board = JSON.parse(fs.readFileSync(path.join(dir, "storyboard.json"), "utf8"));
const video = path.resolve(dir, "video.mp4");
if (!fs.existsSync(video)) {
  console.error(`Chưa có ${video}, render trước đã.`);
  process.exit(1);
}

const stateFile = path.join(repo, "logs", "facebook-videos.json");
const posted = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, "utf8")) : {};
if (posted[board.slug]) {
  console.log(`${board.slug}: đã đăng video trước đó (${posted[board.slug].facebookPostId}), bỏ qua.`);
  process.exit(0);
}

const hashtag = (text) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D")
  .split(/[^a-z0-9]+/i).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("");
const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
const link = `${siteUrl}/thuat-ngu/${board.slug}?utm_source=facebook&utm_medium=reel&utm_campaign=${date}`;
const tags = ["#TopKhoaHoc", "#ThuatNguTrending", "#MoiNgayMotThuatNgu", `#${hashtag(board.term)}`]
  .filter((tag, i, all) => all.indexOf(tag) === i);
const message = `${board.caption.trim()}\n\n📖 Đọc đầy đủ: ${link}\n\n${tags.join(" ")}`;

if (dryRun) {
  console.log(`--- ${board.slug} (${video}) ---\n${message}`);
  process.exit(0);
}

const messageFile = path.join(repo, "logs", `fb-video-${board.slug}.txt`);
fs.mkdirSync(path.dirname(messageFile), { recursive: true });
fs.writeFileSync(messageFile, message);
const out = execFileSync("node", ["server/scripts/post.mjs", "--project", "topkhoahoc", "--message-file", messageFile,
  "--video", video, "--title", `Video: ${board.term}`, ...(schedule ? ["--schedule", schedule] : [])], { cwd: toolDir, encoding: "utf8" });
const result = JSON.parse(out.trim().split("\n").filter((line) => line.startsWith("{")).at(-1));
posted[board.slug] = { facebookPostId: result.facebookPostId, postedAt: new Date().toISOString(), ...(result.scheduledFor ? { scheduledFor: result.scheduledFor } : {}) };
fs.writeFileSync(stateFile, JSON.stringify(posted, null, 2));
fs.rmSync(messageFile, { force: true });
console.log(result.scheduledFor
  ? `${board.slug}: đã lên lịch Reel ${result.facebookPostId}, Facebook tự đăng lúc ${schedule}`
  : `${board.slug}: đã đăng Reel https://www.facebook.com/reel/${result.facebookPostId}`);
