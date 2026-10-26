# Video thuật ngữ (Reels / Shorts / TikTok)

Video dọc 1080×1920, 55–85 giây, giọng nam VieNeu-TTS "Quang Sơn", dựng bằng HyperFrames.

## Luồng

1. **Storyboard**: file JSON mô tả từng cảnh và từng câu đọc (`logs/video/<ngày>-<slug>.json`). Mỗi sáng Claude viết theo `scripts/daily-video-prompt.md`; định dạng và các loại cảnh cũng ghi trong đó.
2. **Dựng**: `video/make.py` đọc từng câu bằng VieNeu, tính thời gian, rồi sinh project HyperFrames (cảnh, phụ đề, âm thanh) vào `C:\Users\datda\Videos\topkhoahoc\<ngày>-<slug>`.
3. **Render**: `npx hyperframes@0.8.201 render --output video.mp4` trong thư mục đó (4–10 phút).
4. **Đăng**: `node scripts/facebook-video.mjs <thư mục>` đăng Reel qua tool chung, ghi `logs/facebook-videos.json`.

`scripts/daily-video.ps1` chạy cả 4 bước; `daily-term.ps1` gọi nó sau khi đăng bài 8:30.

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
- Font Be Vietnam Pro (SIL OFL, `video/fonts/OFL.txt`).
