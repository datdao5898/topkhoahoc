# Viết storyboard video cho thuật ngữ

Bạn viết kịch bản cho một video dọc 60–80 giây giới thiệu tản mạn một thuật ngữ, đăng Facebook Reels / TikTok / YouTube Shorts.
Giọng đọc là giọng nam (VieNeu-TTS "Quang Sơn"). Máy sẽ đọc từng câu `say`, dựng hình theo từng câu, nên bạn chỉ cần viết **một file JSON** đúng định dạng dưới đây, không làm gì khác.

## Nguồn

- Đọc file thuật ngữ `content/terms/<slug>.md` được nêu trong lệnh.
- **Mọi sự thật (năm, tên người, con số, nguồn gốc) phải có trong file đó.** Không bịa thêm số liệu, tên, sự kiện. Chuyện minh hoạ (tin nhắn, tình huống đời thường) thì được tự nghĩ, miễn hợp lý và không gắn với người thật.

## Văn phong

- Tiếng Việt, **trẻ trung, tếu, gần gũi**: "nha", "đó", "luôn", "kìa", "á", câu ngắn, có nhịp. Như kể cho bạn nghe chứ không đọc bài giảng.
- Mở bằng một tình huống người xem nhận ra ngay (tin nhắn, thông báo, một khoảnh khắc đời thường), chưa nói tên thuật ngữ. Gọi tên ở cảnh 2.
- Kết bằng một câu nhẹ nhàng, có ý nghĩa, không giáo điều.
- Tổng cộng khoảng **170–230 chữ** trong các `say`. Mỗi `say` là **một câu** (tối đa ~25 chữ).
- Trong `say`, viết số bằng chữ để máy đọc đúng ("năm một chín bảy tám", "hơn hai mươi lăm nghìn"); khi đó thêm `cap` là câu hiển thị phụ đề có số ("Năm 1978, …"). Từ tiếng Anh giữ nguyên (máy đọc được).

## Định dạng

```json
{
  "term": "Tên thuật ngữ như trong file",
  "slug": "slug-file",
  "caption": "Mô tả bài Facebook: 1–3 câu, có 1 emoji, gợi tò mò. Không chèn link, không hashtag (máy tự thêm).",
  "scenes": [ { "type": "...", "tone": "(tuỳ chọn)", "beats": [ { "say": "...", "...": "..." } ] } ]
}
```

- 5–8 cảnh, cảnh cuối luôn là `outro`. Mỗi `beat` có `say` (bắt buộc), `cap` (tuỳ chọn) và các trường hiển thị của loại cảnh đó. Beat không có trường hiển thị thì chỉ đọc, hình giữ nguyên (đừng để quá 1 beat như vậy liền nhau).
- `tone` (tuỳ chọn): `amber`, `red`, `pink`, `green`, `sage`, `cream`. Hai cảnh liền nhau nên khác màu.
- Chữ trên màn hình **ngắn**: không chép nguyên câu `say` (phụ đề đã có), chỉ ghi ý chính 2–7 chữ.

### Các loại cảnh

| type | Dùng cho | Trường hiển thị trong beat (tối đa beat) |
|---|---|---|
| `phone` | Mở đầu: điện thoại có thông báo | `clock` + `date` (màn khoá, chỉ ở beat đầu; beat sau tự mở khoá) · `notify: {"from","text"}` (tối đa 3–4) · `scroll: true` (lướt feed) · `line` (câu lớn dưới điện thoại, tối đa 2, ≤ 16 ký tự) — 8 beat |
| `chat` | Tin nhắn, ví dụ cách dùng | `bubble: {"side": "left"/"right", "name": "(chỉ bên trái)", "text"}`; `"title"` của cảnh là tên nhóm/người — 7 beat |
| `reveal` | Gọi tên thuật ngữ | `kicker` (dòng nhỏ) · `word` (tên thuật ngữ, chữ to) · `full` (tên đầy đủ / tiếng Việt) · `meaning` (nghĩa ngắn ≤ 40 ký tự) — 5 beat |
| `timeline` | Nguồn gốc theo mốc thời gian | `year` + `note` (dòng nhỏ) + `title` (dòng đậm ≤ 24 ký tự), tối đa 3 mốc · `stamp` (con dấu đỏ) — 6 beat |
| `big` | Con số, ý chính, dấu hiệu, so sánh | `top` (+ `sub`): tiêu đề to ≤ 12 ký tự · `number: {"pre","value","label"}` · `head` · `line` · `up` / `down` (mũi tên lên/xuống + chữ) · `stamp` — 7 beat |
| `outro` | Kết | `line` (tối đa 2) — 3 beat; thẻ "Mỗi ngày một thuật ngữ · topkhoahoc.online" tự thêm |

Gợi ý mạch: `phone` hoặc `chat` (tình huống) → `reveal` → `timeline` (nguồn gốc) → `big` (vì sao hot / dấu hiệu / con số) → `chat` (ví dụ cách dùng) → `big` (lưu ý) → `outro`.

## Ví dụ (rút gọn)

```json
{
  "term": "Crash out",
  "slug": "crash-out",
  "caption": "Sắp \"crash out\" tới nơi rồi 😵‍💫 Gen Z nói vậy là sao? Nghĩa cũ, nghĩa mới, và khác \"lock in\" chỗ nào.",
  "scenes": [
    { "type": "phone", "beats": [
      { "say": "Deadline dí ba cái cùng lúc.", "notify": { "from": "Sếp", "text": "Em gửi luôn trong hôm nay nha" } },
      { "say": "Trận rank thua thứ năm liên tiếp.", "notify": { "from": "Game", "text": "Thua · chuỗi thua 5 trận" } },
      { "say": "Và rồi…", "line": "Và rồi…" },
      { "say": "Bùm!", "line": "BÙM!" } ] },
    { "type": "reveal", "beats": [
      { "say": "Gen Z gọi khoảnh khắc đó là:", "kicker": "Gen Z gọi khoảnh khắc đó là" },
      { "say": "Crash out.", "word": "Crash out" },
      { "say": "Mất kiểm soát, nổi điên hay làm liều, vì quá tức giận, quá áp lực.", "meaning": "mất kiểm soát vì quá tức, quá áp lực" } ] },
    { "type": "timeline", "beats": [
      { "say": "Nghĩa này được bài Stepped On của rapper NBA YoungBoy phổ biến năm hai nghìn không trăm mười bảy.", "cap": "Nghĩa này được bài Stepped On của NBA YoungBoy phổ biến năm 2017.", "year": "2017", "note": "rapper NBA YoungBoy", "title": "bài Stepped On" } ] },
    { "type": "big", "tone": "green", "beats": [
      { "say": "À, crash out gần như ngược với lock in nha.", "head": "Lock in ≠ crash out" },
      { "say": "Lock in là tập trung cao độ,", "up": "lock in: tập trung cao độ" },
      { "say": "còn crash out là mất bình tĩnh.", "down": "crash out: mất bình tĩnh" } ] },
    { "type": "outro", "beats": [
      { "say": "Than cho vui thì được, nhưng đừng gắn mác cho người khác.", "line": "Than cho vui thì được," },
      { "say": "Mệt quá thì nghỉ chút đi nha!", "line": "mệt quá thì nghỉ chút nha!" } ] }
  ]
}
```

Ghi file JSON vào đúng đường dẫn được nêu trong lệnh (UTF-8, JSON hợp lệ), rồi dừng.
