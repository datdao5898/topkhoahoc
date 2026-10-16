// Tạo nhanh file thuật ngữ mới.
//   npm run new -- "Vibe coding"              → tự xếp vào ngày trống tiếp theo
//   npm run new -- "Vibe coding" 2026-10-20   → hẹn đúng ngày
import fs from "node:fs";
import path from "node:path";

const [name, dateArg] = process.argv.slice(2);
if (!name) {
  console.error('Cách dùng: npm run new -- "Tên thuật ngữ" [YYYY-MM-DD]');
  process.exit(1);
}

const dir = path.join(process.cwd(), "content", "terms");
const slug = name
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "")
  .replace(/đ/gi, "d")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
const file = path.join(dir, `${slug}.md`);
if (fs.existsSync(file)) {
  console.error(`Đã có file content/terms/${slug}.md`);
  process.exit(1);
}

const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
const usedDates = new Set(
  fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => fs.readFileSync(path.join(dir, f), "utf8").match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1])
    .filter(Boolean),
);

let date = dateArg;
if (!date) {
  const d = new Date(`${today}T00:00:00Z`);
  while (usedDates.has(d.toISOString().slice(0, 10))) d.setUTCDate(d.getUTCDate() + 1);
  date = d.toISOString().slice(0, 10);
}

const template = fs
  .readFileSync(path.join(dir, "_template.md"), "utf8")
  .replace(/^term:.*$/m, `term: "${name.replace(/"/g, '\\"')}"`)
  .replace(/^date:.*$/m, `date: ${date}`);

fs.writeFileSync(file, template);
console.log(`Đã tạo content/terms/${slug}.md (lên trang ngày ${date})`);
console.log(`URL: /thuat-ngu/${slug}`);
