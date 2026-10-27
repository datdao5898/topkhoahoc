# Video thuật ngữ (Reels / Shorts / TikTok)

Video dọc 1080×1920, 55–85 giây, giọng nam VieNeu-TTS "Quang Sơn", dựng bằng HyperFrames.

## Luồng

1. **Storyboard**: file JSON mô tả từng cảnh và từng câu đọc (`logs/video/<ngày>-<slug>.json`). Mỗi sáng Claude viết theo `scripts/daily-video-prompt.md`; định dạng và các loại cảnh cũng ghi trong đó.
2. **Dựng**: `video/make.py` đọc từng câu bằng VieNeu, tính thời gian, rồi sinh project HyperFrames (cảnh, phụ đề, âm thanh) vào `C:\Users\datda\Videos\topkhoahoc\<ngày>-<slug>`.
3. **Render**: `npx hyperframes@0.8.201 render --output video.mp4` trong thư mục đó (4–10 phút).
4. **Đăng**: `node scripts/facebook-video.mjs <thư mục>` đăng Reel qua tool chung, ghi `logs/facebook-videos.json`.

`scripts/daily-video.ps1` chạy cả 4 bước; `daily-term.ps1` gọi nó sau khi đăng bài 8:30.

## Kiểu chuyển động "pop"

Thêm `"motion": "pop"` vào storyboard để dựng kiểu sinh động hơn (mặc định `classic`, job hằng ngày không đổi):

- Chuyển cảnh xoay vòng: sọc chéo quét, vòng tròn bung, cảnh cũ xoay thu nhỏ.
- Tim, sao, vòng tròn trang trí bay lơ lửng; khung hình zoom chậm suốt cảnh và rung nhẹ khi con dấu hay tên thuật ngữ đập xuống.
- Chữ nảy vào (back/elastic/bounce) thay vì hiện mờ dần; tên thuật ngữ rơi từ trên xuống từng chữ.
- Phụ đề hiện từng chữ, chữ đang đọc đổi màu vàng.

## Kiểu "tabloid" (báo lá cải / tạp chí showbiz)

`"motion": "tabloid"`: nền giấy báo chấm in, băng "TIN NÓNG" chạy chéo, chữ tên thuật ngữ in viền mờ chạy dưới đáy; tít dùng font Anton in hoa.

- Chuyển cảnh: trang báo mới đập lên, đèn flash, màn trập máy ảnh. Mỗi câu mới khung giật zoom vào/ra.
- Tên thuật ngữ ghép từ chữ cắt dán (kiểu thư nặc danh) kèm flash paparazzi.
- Phụ đề hộp đen bóng đỏ, chữ đang đọc nằm trên nền vàng.
- Cảnh `cover` (bìa tạp chí, tối đa 4 beat): `mast` (tên báo · ngày), `headline` (tít lớn), `emoji`, `note` (dải đỏ cuối bìa), `stamp`.

Ví dụ: `logs/video/2026-10-16-nepo-baby.json`.

Cảnh `morph` (dùng được ở mọi kiểu) minh hoạ đổi chữ/đọc lệch âm: `title` của cảnh; beat có `from` + `to` (tối đa 3 hàng: chữ gốc bị gạch, mũi tên, chữ mới rơi vào ô) hoặc `stamp`. Ví dụ: `logs/video/2026-10-16-ong-cha-hui-ba-cha-hom.json`.

## Lệnh tay

```powershell
$py = "C:\Users\datda\Videos\topkhoahoc\voice-samples\vieneu-env\Scripts\python.exe"
& $py -X utf8 video/make.py logs/video/2026-10-24-gaslighting.json C:\Users\datda\Videos\topkhoahoc\2026-10-24-gaslighting
# sửa chữ/cảnh mà giữ giọng đã tạo:
& $py -X utf8 video/make.py <storyboard> <thư mục> --no-voice
```

## Cài đặt

- VieNeu-TTS (miễn phí, chạy trên máy): venv ở `C:\Users\datda\Videos\topkhoahoc\voice-samples\vieneu-env` (`pip install vieneu`). Đổi đường dẫn bằng biến môi trường `VIENEU_PYTHON`.
- ffmpeg, Node 18+, HyperFrames chạy qua `npx` (bản ghim 0.8.201).
- Hiệu ứng âm thanh lấy từ skill media-use của HyperFrames (`~/.claude/skills/media-use/audio/assets/sfx`).
- Font Be Vietnam Pro và Anton (đều SIL OFL, `video/fonts/OFL.txt`).
