# Viết storyboard video cho thuật ngữ

Bạn viết kịch bản cho một video dọc 60–80 giây giới thiệu tản mạn một thuật ngữ, đăng Facebook Reels / TikTok / YouTube Shorts.
Giọng đọc là giọng nam (VieNeu-TTS "Quang Sơn"). Máy sẽ đọc từng câu `say`, dựng hình theo từng câu, nên bạn chỉ cần viết **một file JSON** đúng định dạng dưới đây, không làm gì khác.

## Nguồn

- Đọc file thuật ngữ `content/terms/<slug>.md` được nêu trong lệnh.
- **Mọi sự thật (năm, tên người, con số, nguồn gốc) phải có trong file đó.** Không bịa thêm số liệu, tên, sự kiện. Chuyện minh hoạ (tin nhắn, tình huống đời thường) thì được tự nghĩ, miễn hợp lý và không gắn với người thật.

## Văn phong

- Tiếng Việt, **trẻ trung, tếu, gần gũi**: "nha", "đó", "luôn", "kìa", "á", câu ngắn, có nhịp. Như kể cho bạn nghe chứ không đọc bài giảng.
- Mở bằng một câu hook (xem phần "Câu hook mở đầu" bên dưới) và một tình huống người xem nhận ra ngay (tin nhắn, thông báo, một khoảnh khắc đời thường), chưa nói tên thuật ngữ. Gọi tên ở cảnh 2.
- Kết bằng một câu nhẹ nhàng, có ý nghĩa, không giáo điều.
- Tổng cộng khoảng **170–230 chữ** trong các `say`. Mỗi `say` là **một câu** (tối đa ~25 chữ).
- Beat có `bubble` hoặc `notify` mà chữ dài: câu `say` nên đọc luôn nội dung đó ("Hay là: đừng chan tôi, …"), đừng chỉ đọc "Hay là:", nếu không tin nhắn chỉ hiện chưa tới một giây.
- Trong `say`, viết số bằng chữ để máy đọc đúng ("năm một chín bảy tám", "hơn hai mươi lăm nghìn"); khi đó thêm `cap` là câu hiển thị phụ đề có số ("Năm 1978, …"). Từ tiếng Anh giữ nguyên (máy đọc được).

## Câu hook mở đầu

Người xem quyết định ở lại hay lướt qua trong 1–2 giây đầu, nên **beat đầu tiên phải là hook**: một câu ngắn (≤ 12 chữ), nói thẳng vào tình huống hoặc thắc mắc của người xem, chưa cần nói tên thuật ngữ. Hình của cảnh mở đầu (`phone` / `chat` / `big`) phải minh hoạ đúng câu hook.

Chọn **một** khung dưới đây, thay phần trong ngoặc vuông bằng chi tiết thật của thuật ngữ. Khung chỉ là gợi ý, viết lại cho tự nhiên, xưng "bạn", giữ giọng trẻ trung:

1. Nếu bạn từng [tình huống], thì bạn gặp [hiện tượng] rồi đó.
2. Đây có phải là bạn không: [tình huống quen thuộc]?
3. Vì sao [chuyện khó chịu] cứ lặp lại, dù bạn đã [cách xử lý phổ biến]?
4. [Đối tượng: dân văn phòng / Gen Z / người mới đi làm…] gặp chuyện này hoài mà ít ai gọi được tên.
5. Nghe [thuật ngữ] tưởng là [hiểu lầm phổ biến], nhưng không phải đâu.
6. Không phải [quan niệm phổ biến] lúc nào cũng đúng.
7. Vấn đề không nằm ở [điều dễ bị đổ lỗi], mà ở chỗ này.
8. Dấu hiệu cho thấy bạn đang [bị / làm] [hiện tượng] mà không biết.
9. Điều gì xảy ra nếu [tình huống] cứ lặp đi lặp lại?
10. Cả bảng tin đang nói [thuật ngữ], mà nó thật ra nghĩa là gì?
11. Trước khi dùng chữ [thuật ngữ], bạn nên biết điều này.
12. [Thuật ngữ A] với [thuật ngữ B] khác nhau chỗ nào? (chỉ khi file có nhắc thuật ngữ liên quan)
13. Một [câu nói / vở kịch / bài hát…] từ [năm] mà giờ cả mạng xã hội đang dùng.
14. Từ [nghĩa gốc bất ngờ] thành [nghĩa bây giờ]: chuyện của một chữ.

Quy tắc:

- **Đổi khung mỗi ngày.** Đọc 3 file mới nhất trong `logs/video/` (theo tên) và không dùng lại khung mà các video đó đã mở đầu.
- Hook không được bịa: không số liệu, không "tôi đã thử", không hứa hẹn kết quả. Mọi chi tiết thật vẫn phải có trong file thuật ngữ.
- Không dùng hook kiểu bán hàng ("ưu đãi", "đặt ngay", "inbox").
- Có thể kết video bằng một lời mời bình luận nhẹ ở beat cuối, ví dụ "Bạn từng gặp chưa, kể nghe với!". Không hứa sẽ làm video trả lời.

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
