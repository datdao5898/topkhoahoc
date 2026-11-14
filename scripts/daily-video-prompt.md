# Viết storyboard video cho thuật ngữ

Bạn viết kịch bản cho một video dọc 55–80 giây giới thiệu tản mạn một thuật ngữ, đăng Facebook Reels / TikTok / YouTube Shorts.
Giọng đọc là giọng nam (VieNeu-TTS "Hải Đăng"). Video dựng kiểu **người que**: nét mực trên nền giấy tập, mỗi câu đọc là một cảnh nhỏ có nhân vật làm động tác hoặc tương tác với nhau (chạy, đập tay, nhắn tin, bấm hộp thoại, giơ biển…). Phía trên có thẻ chữ, phía dưới có phụ đề. Máy đọc từng câu `say` rồi dựng cảnh theo từng câu, nên bạn chỉ cần viết **một file JSON** đúng định dạng dưới đây, không làm gì khác.

## Nguồn

- Đọc file thuật ngữ `content/terms/<slug>.md` được nêu trong lệnh.
- **Mọi sự thật (năm, tên người, con số, nguồn gốc) phải có trong file đó.** Không bịa thêm số liệu, tên, sự kiện. Chuyện minh hoạ (tin nhắn, tình huống đời thường) thì được tự nghĩ, miễn hợp lý và không gắn với người thật.

## Văn phong

- Tiếng Việt, **trẻ trung, tếu, gần gũi**: "nha", "đó", "luôn", "kìa", "á", câu ngắn, có nhịp. Như kể cho bạn nghe chứ không đọc bài giảng.
- Mở bằng một câu hook (xem phần "Câu hook mở đầu" bên dưới) và một tình huống người xem nhận ra ngay (một khoảnh khắc đời thường), chưa nói tên thuật ngữ. Gọi tên ở cảnh 2.
- Kết bằng một câu nhẹ nhàng, có ý nghĩa, không giáo điều.
- Tổng cộng khoảng **170–230 chữ** trong các `say` (video 55–80 giây; dưới 160 chữ là quá ngắn). Mỗi `say` là **một câu** (tối đa ~25 chữ).
- Beat có cảnh `dialog` hoặc `chat`: câu `say` nên đọc luôn ý của hộp thoại / tin nhắn, chữ trên hình ngắn, nếu không người xem đọc không kịp.
- Trong `say`, viết số bằng chữ để máy đọc đúng ("năm một chín bảy tám", "hơn hai mươi lăm nghìn"); khi đó thêm `cap` là câu hiển thị phụ đề có số ("Năm 1978, …"). Từ tiếng Anh giữ nguyên (máy đọc được). Từ tiếng Pháp, Nhật, Hàn… thì viết phiên âm tiếng Việt trong `say` ("đề gia vu") và giữ chữ gốc trong `cap` ("déjà vu").

## Câu hook mở đầu

Người xem quyết định ở lại hay lướt qua trong 3 giây đầu, phần lớn đang tắt tiếng. **Beat đầu tiên phải là hook**, và 3 giây đầu phải đủ cả ba thứ:

- **Câu đọc:** tối đa 12 chữ, đọc xong trong 3 giây (máy đo, dài hơn sẽ bắt viết lại). Nói thẳng vào tình huống hoặc thắc mắc của người xem, chưa cần nói tên thuật ngữ.
- **Thẻ chữ:** bắt buộc có `title`, hiện ngay từ khung hình đầu. Tắt tiếng chỉ đọc thẻ này vẫn phải thấy tò mò, nên viết thành một ý trọn vẹn, không chỉ là nhãn chủ đề.
- **Cảnh:** người que làm đúng khoảnh khắc trong câu hook, nhìn là hiểu ngay (ví dụ: lướt điện thoại mà màn hình phóng to ra thấy chuyện lạ, hai người nhắn tin, cả đám cùng làm một việc). Không dùng cảnh ẩn dụ phải nghĩ mới ra.

Chọn câu hook hợp với thuật ngữ:

- **Hành vi, tâm lý, chuyện đời thường:** mở bằng khoảnh khắc người xem nhận ra mình (khung 1, 2, 3, 8).
- **Từ lóng, trend đang hot:** mở bằng sự tò mò về chữ đang thấy khắp nơi hoặc cách hiểu sai (khung 5, 10, 11).
- **Nguồn gốc bất ngờ (khung 13, 14):** chỉ dùng khi chi tiết đó tự nó gây bất ngờ và người xem hiểu ngay. Nếu cần giải thích mới thấy hay thì đưa tình huống đời thường lên trước.

Lấy chi tiết hấp dẫn nhất của kịch bản đưa lên câu đầu, đừng để dành cho câu sau. Sau hook, beat thứ hai và cảnh 2 phải trả lời điều vừa gợi ra, không câu kéo.

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

- **Đổi khung mỗi ngày.** Đọc 7 file mới nhất trong `logs/video/` (theo tên) và không dùng lại khung hay cách mở câu của các video đó.
- Không dùng cụm “dính rồi”: đã lặp quá nhiều (máy sẽ bắt viết lại).
- Cảnh 1 có ít nhất 2 beat: câu hook rồi tới tình huống.
- Hook không được bịa: không số liệu, không "tôi đã thử", không hứa hẹn kết quả. Mọi chi tiết thật vẫn phải có trong file thuật ngữ.
- Không dùng hook kiểu bán hàng ("ưu đãi", "đặt ngay", "inbox").
- Có thể kết video bằng một lời mời bình luận nhẹ ở beat cuối, ví dụ "Bạn từng gặp chưa, kể nghe với!". Không hứa sẽ làm video trả lời.

## Định dạng

```json
{
  "style": "stick",
  "term": "Tên thuật ngữ như trong file",
  "slug": "slug-file",
  "caption": "Mô tả bài Facebook: 1–3 câu, có 1 emoji, gợi tò mò. Không chèn link, không hashtag (máy tự thêm).",
  "scenes": [ { "beats": [ { "say": "...", "card": { "...": "..." }, "scene": { "type": "...", "...": "..." } } ] }, { "outro": true, "beats": [ { "say": "..." } ] } ]
}
```

- **5–8 cảnh**, mỗi cảnh 1–4 beat. Cảnh cuối là `{"outro": true}` với **đúng 1 beat** chỉ có `say` (và `cap` nếu cần). Máy tự dựng cảnh về đích, pháo giấy, nhân vật vẫy tay, thẻ "Mỗi ngày một thuật ngữ · topkhoahoc.online".
- Mỗi `beat` có `say` (bắt buộc), `cap` (tuỳ chọn), `card` (tuỳ chọn), `scene` (tuỳ chọn).
- **Beat đầu của mỗi cảnh phải có `scene`.** Beat sau có `scene` thì đổi sang cảnh mới; không có thì giữ cảnh cũ (nhân vật vẫn tiếp tục động tác). Nên đổi cảnh ở **hầu hết các beat** (khoảng 3–5 giây một lần) cho video sinh động.
- **Đa dạng loại cảnh:** cả video dùng ít nhất 5 loại `type` khác nhau, `act` không quá một nửa số cảnh. Ưu tiên cảnh có **tương tác**: `duo`, `chat`, `phone`, `dialog`, `panels`, `versus`.

### Thẻ chữ (`card`)

Thẻ hiện ở nửa trên màn hình cho tới thẻ sau, hết cảnh thì tắt. Phụ đề (câu `say`) đã có ở dưới, nên chữ trên thẻ **ngắn**, chỉ ý chính.

| Trường | Ý nghĩa |
|---|---|
| `kicker` | Dòng nhỏ màu đỏ phía trên (≤ 30 ký tự): "Thuật ngữ hôm nay", "Nguồn gốc", "Vì sao vậy?", "Lưu ý" |
| `title` | Chữ to, **mỗi dòng ≤ 14 ký tự**, xuống dòng bằng `\n`, tối đa 3 dòng. Dòng cuối được tô vàng (khi có từ 2 dòng) |
| `sub` | Dòng phụ dưới tiêu đề (≤ 44 ký tự) |
| `big` | `true`: tiêu đề chữ khối Anton rơi từng chữ + vệt vàng. **Chỉ dùng cho thẻ gọi tên thuật ngữ** (cảnh 2), 1 dòng, ≤ 12 ký tự (tên dài thì bỏ `big`, viết `title` 2 dòng) |
| `keep` | `{"sub": "...", "keep": true}`: không thay thẻ, chỉ thêm một dòng đỏ dưới thẻ đang hiện (≤ 40 ký tự; phải có thẻ khác trước nó trong cùng cảnh) |

- Beat có `scene` loại `dialog` thì **không có `card`** (hộp thoại chiếm chỗ thẻ, thẻ đang hiện sẽ tạm ẩn).
- Thẻ gọi tên: `{"kicker": "Thuật ngữ hôm nay", "title": "TÊN IN HOA", "big": true}`, beat sau dùng `keep` để thêm nghĩa ngắn.

### Cảnh (`scene`)

Sân khấu nằm giữa thẻ chữ và phụ đề. Nhân vật là người que; `mood` đổi nét mặt; `look`: `"nam"` (mặc định), `"nu"` (có tóc buộc), `"kinh"` (đeo kính đen).

**Động tác** (`do`, dùng trong nhiều loại cảnh):
`stand` đứng · `walk` đi bộ · `run` chạy (đổ mồ hôi) · `jump` nhảy · `cheer` giơ hai tay ăn mừng · `think` tay chống cằm + bong bóng suy nghĩ · `idea` nghĩ rồi bật bóng đèn · `shrug` nhún vai · `facepalm` ôm mặt · `wave` vẫy tay · `point` chỉ lên tiêu đề · `phone` cầm điện thoại · `selfie` chụp ảnh tự sướng · `laptop` ngồi gõ máy tính · `sit` ngồi ghế · `read` đọc sách · `sleep` nằm ngủ (zzz) · `cry` khóc · `lift` nâng tạ · `push` đẩy xe trượt · `pull` kéo dây · `carry` bê thùng · `dance` nhảy múa (nốt nhạc) · `angry` tức (bốc khói) · `love` thả tim · `shock` giật mình "!!" · `scared` run sợ · `tired` mệt rã rời · `money` cầm tiền (đồng xu bay) · `eat` ăn

**Mood:** `happy` `grin` `sad` `shock` `tired` `angry` `neutral` `love` `scared` `proud`

| `type` | Trường | Dùng khi |
|---|---|---|
| `act` | `do` (bắt buộc), `mood`, `look`, `bubble` (lời nói ≤ 24 ký tự), `think` (chữ trong bong bóng suy nghĩ ≤ 18, khi `do` là `think`), `label` (nhãn dưới chân ≤ 22) | Một nhân vật làm một việc |
| `duo` | `do`: `talk` nói chuyện · `argue` cãi nhau · `ignore` một người nói, người kia cắm mặt vào điện thoại · `highfive` đập tay · `hug` ôm · `give` đưa món quà (`item` ≤ 14 ký tự) · `chase` rượt nhau · `doctor` bác sĩ khám; `left` / `right`: `{"say": "≤ 24 ký tự", "mood": "...", "look": "...", "label": "≤ 16"}` | Hai người tương tác. Người trái nói trước, người phải đáp sau |
| `phone` | `msgs`: tối đa 3 tin nhắn `{"text": "≤ 40", "me": true/false}` **hoặc** `show`: một động tác; `top`: dòng chữ đỏ trên màn hình (≤ 18), `mood` | Một người lướt điện thoại, màn hình phóng to ra bên phải. Rất hợp cho hook |
| `chat` | `name` (tên cuộc trò chuyện ≤ 20), `msgs`: 2–4 tin `{"text": "≤ 60", "me": true/false}` | Khung chat to, tin nhắn hiện lần lượt (me = bên phải, nền vàng) |
| `panels` | `items`: 2–4 ô `{"do": "...", "label": "≤ 18", "mood": "..."}` | Liệt kê các bước, dấu hiệu, ví dụ: mỗi ô một nhân vật làm một việc, hiện lần lượt |
| `dialog` | `title` (≤ 24), `text` (≤ 40), `buttons`: 1–2 nút (≤ 10 ký tự, nút chính để cuối), `note` (≤ 28), `mood` | Hộp thoại kiểu máy tính; nhân vật với tay bấm nút phụ, có `note` thì nút phụ bị gạch + hiện ghi chú, rồi bấm nút chính. Tối đa 1 lần, cho một ví von vui |
| `sign` | `text` (≤ 24), `color`: `"yellow"` / `"red"` (tuỳ chọn), `mood` | Nhân vật giơ biển: một câu khẩu hiệu, tên gọi, con số ngắn |
| `calendar` | `month` (≤ 16, ví dụ "THÁNG 3 · 2027"), `day` (≤ 7, ví dụ "6–7", "1964"), `stamp` (≤ 12, ví dụ "DỰ KIẾN") | Ngày tháng, năm ra đời |
| `stat` | `value` (≤ 9 ký tự: "38", "25.000+", "70%"), `label` (≤ 40), `do` (mặc định `shock`) | Một con số có trong file thuật ngữ (số chạy tăng dần) |
| `versus` | `left` / `right`: `{"label": "≤ 16", "do": "...", "mood": "..."}` | So sánh hai phía, hai cách làm, đúng/sai |
| `crowd` | `do`, `count` (3–7), `label` (≤ 24), `mood` | Cả đám cùng làm một việc: trend lan rộng, ai cũng vậy |
| `icons` | `items`: 1–3 `{"icon": "...", "label": "≤ 14"}`, `do` | Vài ý ngắn kèm icon: `question` `eye` `spark` `book` `brain` `users` `battery` `smile` `heart` `flag` `alert` `chat` `phone` `clock` `check` `cross` `bulb` `star` `money` `chart` `fire` `globe` `lock` `shield` `music` `coffee` `search` |
| `board` | `lines`: 1–4 dòng (≤ 22 ký tự) | Nhân vật đeo kính cầm que chỉ bảng: định nghĩa, các bước, mẹo |

Gợi ý mạch: tình huống (hook: `phone` / `chat` / `crowd` / `duo`) → gọi tên + nghĩa (`act` với `point` hoặc `cheer`, thẻ `big`) → nguồn gốc (`calendar`, `sign`, `stat`) → vì sao hot / dấu hiệu / ví dụ (`panels`, `icons`, `versus`, `duo`, có thể một `dialog` vui) → lưu ý (`board`, `duo` `doctor`, `act` `think`) → `outro` (lời mời bình luận nhẹ).

Chọn động tác **khớp nghĩa câu đọc**: câu nói về mệt thì `tired` / `run`, nhắn tin thì `chat` / `phone`, tức giận thì `argue` / `angry`, vui thì `cheer` / `dance`… Đừng dùng `stand` cho mọi thứ.

## Ví dụ (rút gọn)

```json
{
  "style": "stick",
  "term": "Déjà vu",
  "slug": "deja-vu",
  "caption": "Lạ mà quen, như đã sống qua một lần rồi? 🌀 Cảm giác đó có tên đó nha.",
  "scenes": [
    {"beats": [
      {"say": "Bạn đã bao giờ bước vào một nơi hoàn toàn lạ, mà thấy quen quen chưa?",
       "card": {"kicker": "Bạn có từng…", "title": "Lạ mà quen?"},
       "scene": {"type": "act", "do": "think", "think": "Ủa, quen quen?", "mood": "shock"}},
      {"say": "Kiểu như cảnh này, mình đã sống qua một lần rồi á.",
       "scene": {"type": "duo", "do": "talk", "left": {"say": "Hình như mình tới đây rồi", "mood": "shock"}, "right": {"say": "Lần đầu mà?", "look": "nu"}}}
    ]},
    {"beats": [
      {"say": "Cảm giác đó có tên hẳn hoi nha: đề gia vu.", "cap": "Cảm giác đó có tên hẳn hoi nha: déjà vu.",
       "card": {"kicker": "Thuật ngữ hôm nay", "title": "DÉJÀ VU", "big": true},
       "scene": {"type": "act", "do": "point"}},
      {"say": "Tiếng Pháp, nghĩa là: đã thấy rồi.", "card": {"sub": "tiếng Pháp · “đã thấy rồi”", "keep": true},
       "scene": {"type": "sign", "text": "Đã thấy rồi!", "color": "yellow"}}
    ]},
    {"beats": [
      {"say": "Giả thuyết phổ biến là: não bạn bật nhầm tín hiệu quen thuộc, dù chẳng có ký ức nào thật.",
       "card": {"kicker": "Vì sao vậy?", "title": "Não bật nhầm\nnút “quen”"},
       "scene": {"type": "icons", "items": [{"icon": "brain", "label": "não"}, {"icon": "spark", "label": "bật nhầm"}, {"icon": "question", "label": "quen ở đâu?"}], "do": "shrug"}},
      {"say": "Giống máy tính báo file đã tồn tại, mà mở thư mục ra thì trống trơn.",
       "scene": {"type": "dialog", "title": "Tệp đã tồn tại", "text": "“cảnh-này.jpg” đã có rồi?", "buttons": ["Bỏ qua", "Thay thế"], "note": "Thư mục: 0 mục"}}
    ]},
    {"outro": true, "beats": [
      {"say": "Còn bạn, lần gần nhất bị đề gia vu là ở đâu? Kể nghe với!", "cap": "Còn bạn, lần gần nhất bị déjà vu là ở đâu? Kể nghe với!"}
    ]}
  ]
}
```

(Ví dụ đã rút gọn còn 4 cảnh; bài thật cần 5–8 cảnh và ít nhất 5 loại `type`.)

Ghi file JSON vào đúng đường dẫn được nêu trong lệnh (UTF-8, JSON hợp lệ), rồi dừng.
