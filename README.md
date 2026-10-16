# TopKhoaHoc – Mỗi ngày một thuật ngữ trending

Ai lướt mạng xã hội gặp một từ lạ (rizz, delulu, aura…) rồi Google “… là gì” sẽ vào được trang giải nghĩa của từ đó. Mỗi ngày đăng một thuật ngữ, mỗi thuật ngữ có một trang riêng tại `/thuat-ngu/<slug>`.

**Công nghệ:** Next.js 16 (App Router, trang tĩnh + ISR), Tailwind CSS 4, nội dung là các file Markdown trong `content/terms/`. Không cần database hay CMS.

## Đăng thuật ngữ mới

```bash
npm run new -- "Vibe coding"              # tự xếp vào ngày còn trống tiếp theo
npm run new -- "Vibe coding" 2026-10-20   # hoặc chọn ngày cụ thể
```

Lệnh trên tạo `content/terms/vibe-coding.md` từ mẫu `content/terms/_template.md`. Điền nội dung, commit rồi push là xong.

- **Hẹn giờ đăng:** file có `date` ở tương lai sẽ bị ẩn, đến đúng ngày đó (giờ Việt Nam) sẽ tự lên trang trong vòng khoảng 1 giờ, không cần deploy lại. Có thể viết trước cả tuần.
- **Tên file = URL:** `aura.md` → `/thuat-ngu/aura`. Đã đăng thì đừng đổi tên file (mất thứ hạng Google).
- **`short` là trường quan trọng nhất:** nó vừa là đoạn định nghĩa đầu trang, vừa là mô tả trên Google, vừa nằm trên ảnh preview khi share lên Facebook.

## Tự động viết bài mỗi sáng

Task Scheduler của Windows chạy task **"TopKhoaHoc - Thuat ngu hang ngay"** lúc 8:30 mỗi sáng. Nếu lúc đó máy đang tắt, task chạy ngay khi mở máy. Script `scripts/daily-term.ps1` sẽ:

1. `git pull`. Nếu hôm nay đã có bài (anh tự viết hoặc hẹn trước) thì dừng.
2. Gọi Claude Code (headless) làm theo `scripts/daily-term-prompt.md`: tìm từ trending, viết bài kèm nguồn.
3. `npm run build` để kiểm tra, rồi commit + push. Vercel tự deploy.

- Log: `logs/daily-term-YYYY-MM.log`. Nếu lỗi sẽ có popup báo trên màn hình.
- Chạy thử không đăng: `powershell -ExecutionPolicy Bypass -File scripts\daily-term.ps1 -Date 2026-10-20 -DryRun`
- Muốn đổi cách chọn từ hay giọng văn: sửa `scripts/daily-term-prompt.md`.
- Tắt: mở Task Scheduler, chuột phải vào task, chọn Disable.

## Mẹo viết để lên top Google

- `term` viết đúng như người ta gõ trên mạng. Nếu có nhiều cách viết, đưa vào `aliases`.
- `faq` nên là những câu người ta search kèm, ví dụ “+1000 aura nghĩa là gì?”.
- Điền `related` để các trang liên kết với nhau, giúp Google index nhanh hơn.
- Khi sửa nội dung bài cũ, thêm `updated: YYYY-MM-DD`.

## Có sẵn cho SEO & GEO

**SEO (Google):**
- Tiêu đề dạng “X là gì? Ý nghĩa của "X" trên mạng xã hội”, canonical, Open Graph và ảnh preview tự sinh cho từng thuật ngữ
- JSON-LD: DefinedTerm, Article (kèm `citation` lấy từ `sources`), FAQPage, BreadcrumbList, Organization, DefinedTermSet
- `/sitemap.xml`, `/robots.txt`, trang `/gioi-thieu` (quy trình biên tập, tăng độ tin cậy E-E-A-T)

**GEO (ChatGPT, Perplexity, Gemini, Google AI Overviews):**
- Mỗi bài mở đầu bằng một câu định nghĩa trả lời thẳng, có nguồn tham khảo và ngày cập nhật: dạng nội dung AI hay trích dẫn
- `/llms.txt` (mục lục cho AI) và `/llms-full.txt` (toàn bộ nội dung Markdown)
- IndexNow: GitHub Action `.github/workflows/indexnow.yml` chạy 01:30 sáng mỗi ngày, báo bài mới cho Bing (ChatGPT Search dùng index của Bing). Chạy tay: `node scripts/indexnow.mjs --all`
- `/feed.xml` (RSS): nối vào Zapier/IFTTT/dlvr.it để tự đăng lên Facebook mỗi ngày

## Chạy local

```bash
npm install
npm run dev
```

Đặt biến môi trường `NEXT_PUBLIC_SITE_URL` nếu domain khác `https://topkhoahoc.online`.

## Deploy

Khuyên dùng Vercel: import repo, mỗi lần push lên `main` sẽ tự deploy. Sau khi chạy, khai báo `https://<domain>/sitemap.xml` trong Google Search Console.
