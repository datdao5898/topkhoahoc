# Viết storyboard video cho thuật ngữ

Bạn viết kịch bản cho một video dọc 60–80 giây giới thiệu tản mạn một thuật ngữ, đăng Facebook Reels / TikTok / YouTube Shorts.
Giọng đọc là giọng nam (VieNeu-TTS "Hải Đăng"). Video dựng kiểu **ảnh thật**: mỗi cảnh là ảnh chụp toàn khung (máy tự tìm ảnh CC0 trên Wikimedia Commons theo từ khoá tiếng Anh bạn ghi), zoom chậm, chuyển cảnh hoà tan, phía trên có thẻ chữ + icon. Máy đọc từng câu `say` và dựng hình theo từng câu, nên bạn chỉ cần viết **một file JSON** đúng định dạng dưới đây, không làm gì khác.

## Nguồn

- Đọc file thuật ngữ `content/terms/<slug>.md` được nêu trong lệnh.
- **Mọi sự thật (năm, tên người, con số, nguồn gốc) phải có trong file đó.** Không bịa thêm số liệu, tên, sự kiện. Chuyện minh hoạ (tin nhắn, tình huống đời thường) thì được tự nghĩ, miễn hợp lý và không gắn với người thật.

## Văn phong

- Tiếng Việt, **trẻ trung, tếu, gần gũi**: "nha", "đó", "luôn", "kìa", "á", câu ngắn, có nhịp. Như kể cho bạn nghe chứ không đọc bài giảng.
- Mở bằng một câu hook (xem phần "Câu hook mở đầu" bên dưới) và một tình huống người xem nhận ra ngay (một khoảnh khắc đời thường), chưa nói tên thuật ngữ. Gọi tên ở cảnh 2.
- Kết bằng một câu nhẹ nhàng, có ý nghĩa, không giáo điều.
- Tổng cộng khoảng **170–230 chữ** trong các `say` (video 55–80 giây; dưới 160 chữ là quá ngắn). Mỗi `say` là **một câu** (tối đa ~25 chữ).
- Beat có `dialog`: câu `say` nên đọc luôn nội dung hộp thoại, và chữ trong hộp thoại ngắn (≤ 10 chữ), nếu không người xem đọc không kịp.
- Trong `say`, viết số bằng chữ để máy đọc đúng ("năm một chín bảy tám", "hơn hai mươi lăm nghìn"); khi đó thêm `cap` là câu hiển thị phụ đề có số ("Năm 1978, …"). Từ tiếng Anh giữ nguyên (máy đọc được). Từ tiếng Pháp, Nhật, Hàn… thì viết phiên âm tiếng Việt trong `say` ("đề gia vu") và giữ chữ gốc trong `cap` ("déjà vu").

## Câu hook mở đầu

Người xem quyết định ở lại hay lướt qua trong 1–2 giây đầu, nên **beat đầu tiên phải là hook**: một câu ngắn (≤ 12 chữ), nói thẳng vào tình huống hoặc thắc mắc của người xem, chưa cần nói tên thuật ngữ. Ảnh và thẻ chữ của cảnh mở đầu phải minh hoạ đúng câu hook.

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
  "style": "photo",
  "term": "Tên thuật ngữ như trong file",
  "slug": "slug-file",
  "caption": "Mô tả bài Facebook: 1–3 câu, có 1 emoji, gợi tò mò. Không chèn link, không hashtag (máy tự thêm).",
  "photos": { "p1": ["english keywords", "từ khoá dự phòng"], "p2": ["..."] },
  "scenes": [ { "beats": [ { "say": "...", "photo": "p1", "card": { "...": "..." } } ] }, { "outro": true, "beats": [ { "say": "...", "photo": "p9" } ] } ]
}
```

- **5–8 cảnh**, mỗi cảnh 1–4 beat. Cảnh cuối là `{"outro": true}` với **đúng 1 beat** có `photo` và không có `card` (thẻ "Mỗi ngày một thuật ngữ · topkhoahoc.online" tự thêm).
- Mỗi `beat` có `say` (bắt buộc), `cap` (tuỳ chọn), `photo` (tuỳ chọn), `card` (tuỳ chọn).
- **Beat đầu của mỗi cảnh phải có `photo`.** Beat sau có `photo` thì đổi sang ảnh mới (hoà tan); không có thì giữ ảnh cũ. Đổi ảnh khoảng mỗi 3–7 giây (mỗi 1–2 beat).

### Ảnh (`photos`)

- 8–12 ảnh, id `p1`, `p2`, …; ảnh nào khai báo cũng phải được dùng, mỗi ảnh dùng một lần.
- Giá trị là danh sách 2–3 từ khoá **tiếng Anh, đơn giản, cụ thể, chụp được**: người + hành động + nơi chốn ("woman looking at phone", "friends laughing", "coffee shop", "laptop chart"). Từ khoá sau là phương án dự phòng, chung hơn ("woman phone", "friends").
- Máy lấy vài ảnh ứng viên cho mỗi từ khoá (kho Pexels nếu có key, rồi Wikimedia Commons), sau đó **Claude xem từng ảnh và chọn ảnh hợp câu đọc nhất**; không ảnh nào hợp thì bạn sẽ được yêu cầu viết lại từ khoá, kèm lý do. Nên từ khoá phải tả **đúng cảnh trong câu đọc** (ai, đang làm gì, ở đâu, cảm xúc gì).
- Với Commons: máy tìm trong kho ảnh Unsplash trên Wikimedia Commons trước (ảnh đời thường, phần lớn ở phương Tây), không có thì tìm ảnh CC0 khác trên Commons. **Tên file ảnh phải chứa mọi chữ trong từ khoá**, nên viết từ khoá như tên một bức ảnh mô tả thẳng: "woman sitting alone", "couple holding hands", "pills in blister pack", "doctor stethoscope", "friends laughing". Đừng ghép tính từ cảm xúc khó có trong tên ảnh ("woman reading paper worried" sẽ không ra).
- Không tìm được khái niệm trừu tượng ("gaslighting", "anxiety"), người nổi tiếng, logo, chữ, ảnh chụp màn hình, ảnh tin tức. Hãy chọn ảnh **gợi tâm trạng/tình huống**: buồn → "woman sitting alone"; áp lực → "stressed woman"; tình yêu → "couple holding hands".
- Mỗi ảnh nên có 2–3 từ khoá: từ khoá chính cụ thể, từ khoá sau chung hơn nhưng **vẫn giữ danh từ chính** (đừng lùi về một chữ trơ trọi như "woman", "doctor": dễ ra ảnh lạc đề). Hết từ khoá mà không ra ảnh thì máy báo lỗi và bạn sẽ được yêu cầu viết lại.
- Ảnh bị cắt dọc 9:16 và có lớp tối phía trên (chỗ đặt thẻ chữ), nên chọn ảnh có chủ thể rõ.

### Thẻ chữ (`card`)

Một thẻ hiện ở nửa trên màn hình cho tới khi thẻ sau thay. Phụ đề (câu `say`) đã có ở giữa màn hình, nên chữ trên thẻ **ngắn**, chỉ ý chính.

| Trường | Ý nghĩa |
|---|---|
| `icon` | Icon vẽ nét trong vòng tròn: `question` `eye` `spark` `book` `brain` `users` `battery` `smile` `heart` `flag` `alert` `chat` `phone` `clock` `check` `cross` `bulb` `star` `money` `chart` `fire` `globe` `lock` `shield` `music` `coffee` `search` |
| `kicker` | Dòng nhỏ màu vàng phía trên (≤ 30 ký tự): "Thuật ngữ hôm nay", "Nguồn gốc", "Vì sao vậy?", "Lưu ý" |
| `title` | Chữ to, **mỗi dòng ≤ 14 ký tự**, xuống dòng bằng `\n`, tối đa 3 dòng |
| `sub` | Dòng phụ dưới tiêu đề (≤ 44 ký tự) |
| `echo` | `true`: thêm bóng chữ viền vàng. **Chỉ dùng cho thẻ gọi tên thuật ngữ** (cảnh 2) |
| `keep` | `{"sub": "...", "keep": true}`: không thay thẻ, chỉ thêm một dòng vàng dưới thẻ đang hiện (phải có thẻ khác trước nó trong cùng cảnh) |
| `dialog` | Hộp thoại kiểu máy tính thay cho thẻ: `{"title": "≤ 20 ký tự", "text": "≤ 10 chữ", "buttons": ["Nút phụ", "Nút chính"], "note": "(tuỳ chọn) dòng ghi chú hiện sau"}`. Dùng tối đa 1 lần, cho một ví von vui |

- Beat không có `card` thì giữ thẻ cũ (đừng để quá 2 beat liền như vậy).
- Thẻ gọi tên: `{"icon": "spark", "kicker": "Thuật ngữ hôm nay", "title": "TÊN IN HOA", "echo": true}`, beat sau dùng `keep` để thêm nghĩa ngắn.

Gợi ý mạch: tình huống (hook, 1–2 ảnh) → gọi tên + nghĩa → nguồn gốc (năm, người) → vì sao hot / con số → dấu hiệu / ví dụ (có thể một `dialog` vui) → lưu ý → `outro` (lời mời bình luận nhẹ).

## Ví dụ (rút gọn)

```json
{
  "style": "photo",
  "term": "Déjà vu",
  "slug": "deja-vu",
  "caption": "Lạ mà quen, như đã sống qua một lần rồi? 🌀 Cảm giác đó có tên đó nha.",
  "photos": {
    "p1": ["visiting paris street", "city street"],
    "p2": ["hallway of marble arches", "hallway"],
    "p3": ["hallway with pillars", "corridor"],
    "p4": ["confused neon", "neon sign"],
    "p5": ["reading mail at night", "laptop night"],
    "p6": ["young explorer", "person smiling outdoors"]
  },
  "scenes": [
    {"beats": [
      {"say": "Bạn đã bao giờ bước vào một nơi hoàn toàn lạ, mà thấy quen quen chưa?", "photo": "p1",
       "card": {"icon": "question", "kicker": "Bạn có từng…", "title": "Lạ mà quen?"}},
      {"say": "Kiểu như cảnh này, mình đã sống qua một lần rồi á.", "photo": "p2",
       "card": {"icon": "eye", "kicker": "Khoan đã…", "title": "Cảnh này\nquen lắm nha"}}
    ]},
    {"beats": [
      {"say": "Cảm giác đó có tên hẳn hoi nha: đề gia vu.", "cap": "Cảm giác đó có tên hẳn hoi nha: déjà vu.", "photo": "p3",
       "card": {"icon": "spark", "kicker": "Thuật ngữ hôm nay", "title": "DÉJÀ VU", "echo": true}},
      {"say": "Tiếng Pháp, nghĩa là: đã thấy rồi.", "card": {"sub": "tiếng Pháp · “đã thấy rồi”", "keep": true}}
    ]},
    {"beats": [
      {"say": "Giả thuyết phổ biến là: não bạn bật nhầm tín hiệu quen thuộc, dù chẳng có ký ức nào thật.", "photo": "p4",
       "card": {"icon": "brain", "kicker": "Vì sao vậy?", "title": "Não bật nhầm\nnút “quen”"}},
      {"say": "Giống máy tính báo file đã tồn tại, mà mở thư mục ra thì trống trơn.", "photo": "p5",
       "card": {"dialog": {"title": "Tệp đã tồn tại", "text": "“cảnh-này.jpg” đã có rồi?", "buttons": ["Bỏ qua", "Thay thế"], "note": "Thư mục: 0 mục"}}}
    ]},
    {"outro": true, "beats": [
      {"say": "Còn bạn, lần gần nhất bị đề gia vu là ở đâu? Kể nghe với!", "cap": "Còn bạn, lần gần nhất bị déjà vu là ở đâu? Kể nghe với!", "photo": "p6"}
    ]}
  ]
}
```

(Ví dụ đã rút gọn còn 4 cảnh; bài thật cần 5–8 cảnh, 8–12 ảnh.)

Ghi file JSON vào đúng đường dẫn được nêu trong lệnh (UTF-8, JSON hợp lệ), rồi dừng.
