# TopKhoaHoc

Từ điển thuật ngữ trending (Next.js, nội dung Markdown trong `content/terms/`). Chi tiết xem README.md.

## Quy trình mỗi ngày (Task Scheduler "TopKhoaHoc - Thuat ngu hang ngay", 8:30 sáng)

`scripts/daily-term.ps1` làm lần lượt:

1. Viết thuật ngữ, theo hướng dẫn trong `scripts/daily-term-prompt.md`.
2. Build, commit rồi push. Vercel tự deploy lên https://topkhoahoc.online.
3. Đăng lên Facebook Page **"Mỗi ngày một thuật ngữ trending"** (id 1477354225450684) bằng `scripts/facebook-post.mjs`.
4. Dựng sẵn video dọc cho thuật ngữ bằng `scripts/daily-video.ps1 -NoPost` (xem `video/README.md`). Lỗi ở bước này không ảnh hưởng 3 bước trên.
5. 20:00 tối, task **"TopKhoaHoc - Dang Reel 20h"** chạy `scripts/daily-video.ps1` để đăng Reel. Đã có `video.mp4` dựng sẵn thì đăng luôn, chưa có thì dựng rồi đăng.

## Video thuật ngữ

- Giọng: VieNeu-TTS, preset **"Quang Sơn"**, chạy trên máy, miễn phí. Văn phong trẻ trung, tếu.
- Storyboard JSON (`logs/video/`) → `video/make.py` → render HyperFrames → `scripts/facebook-video.mjs`.
- Mỗi thuật ngữ chỉ đăng video một lần, ghi ở `logs/facebook-videos.json`, tách khỏi `logs/facebook-posted.json` của bài viết.
- Sửa cách dựng cảnh: `video/make.py`. Sửa cách viết kịch bản: `scripts/daily-video-prompt.md`.

## Đăng Facebook

- Không gọi Facebook Graph API trực tiếp, và không lưu token trong repo này.
- Mọi bài đều đi qua **tool đăng bài chung** ở `../VN Web Studio/automation-post-articles` (dự án `topkhoahoc` trong tool). Tool giữ token Page, tự chèn link topkhoahoc.online và ghi lịch sử bài.
- Đăng thuật ngữ của một ngày:
  - `node scripts/facebook-post.mjs [YYYY-MM-DD]`
  - Script chờ trang thuật ngữ lên mạng rồi mới đăng, để bài có ảnh xem trước.
  - Mỗi thuật ngữ chỉ đăng một lần, ghi lại ở `logs/facebook-posted.json`.
- Xem trước nội dung bài, không đăng: `node scripts/facebook-post.mjs --dry-run`.
- Đăng bài tuỳ ý (không phải thuật ngữ):
  - Ghi nội dung vào một file rồi chạy trong thư mục tool:
    `node server/scripts/post.mjs --project topkhoahoc --message-file <file> [--link <url>] [--video <file.mp4>] [--title "..."] [--draft]`
  - `--video` đăng file mp4 dọc thành Reel.
  - Lệnh này **đăng công khai ngay**, nên chỉ chạy khi người dùng yêu cầu. Muốn thử thì dùng `--draft` (bài nằm trên Page nhưng không ai thấy).
- Sửa nội dung bài Facebook (câu mở, ví dụ, hashtag): sửa hàm `caption()` trong `scripts/facebook-post.mjs`.
- Lỗi "chưa có Facebook Page": mở tool (`npm start` trong automation-post-articles, vào http://localhost:8655) rồi bấm **Kết nối / xác thực lại Facebook**, tích Page TopKhoaHoc.
