# Nhiệm vụ: viết thuật ngữ trending của ngày hôm nay

Bạn đang chạy tự động (không có người trả lời câu hỏi). Ngày hôm nay (giờ VN) được ghi trong lời nhắn kèm theo.

## 1. Chọn thuật ngữ

### Hôm nay viết loại nào?

Luân phiên hai loại: **trending** và **tâm lý học**. Tìm bài có `date` gần nhất trước hôm nay trong `content/terms/*.md` (bỏ qua bài có `bonus: true`):

- Nếu bài đó có `category: Tâm lý học` thì hôm nay viết **trending**.
- Ngược lại thì hôm nay viết **tâm lý học**.

### Loại trending

- Dùng WebSearch tìm thuật ngữ, tiếng lóng, cụm từ đang **trending trên mạng xã hội Việt Nam** (Facebook, TikTok, Threads, YouTube) trong khoảng 7 ngày gần đây, loại người Việt hay search “… là gì”.
- Gợi ý truy vấn: `"là gì" trend mạng xã hội`, `từ lóng gen z mới`, `trend tiktok tuần này`, `"là gì mà" hot`. Nên tham khảo Kenh14, VnExpress, Znews, Tuổi Trẻ, Thanh Niên, Know Your Meme, Google Trends.

### Loại tâm lý học

- Chọn một hiện tượng, hiệu ứng, khái niệm tâm lý học mà người Việt hay search “… là gì”, ví dụ: déjà vu, FOMO, hiệu ứng Dunning-Kruger, hội chứng kẻ mạo danh (imposter syndrome), gaslighting, hiệu ứng giả dược (placebo), thiên kiến xác nhận, hội chứng Stockholm, hiệu ứng Baader-Meinhof, trì hoãn, overthinking, burnout.
- Ưu tiên khái niệm đang được nhắc nhiều trên mạng (WebSearch thử `"là gì" tâm lý học`, `hiệu ứng tâm lý`, `hội chứng ... là gì`).
- `category` luôn là `Tâm lý học`.
- Giải thích theo kiến thức tâm lý học đã được công nhận, nêu nhà nghiên cứu/thí nghiệm gốc nếu có. Kèm ví dụ đời thường người Việt dễ hiểu, và nói rõ nó hay được dùng thế nào trên mạng.
- Không chẩn đoán, không khuyên điều trị. Với khái niệm gần với rối loạn tâm lý (burnout, lo âu…), thêm một câu khuyên tìm chuyên gia nếu ảnh hưởng nhiều đến cuộc sống.
- Nguồn nên dùng: APA Dictionary of Psychology, Britannica, Psychology Today, Verywell Mind, Simply Psychology, các bệnh viện/báo lớn ở Việt Nam (Vinmec, Tâm Anh, VnExpress Sức khoẻ).

### Chung cho cả hai loại

- **Không trùng bài cũ**: đọc tên file và `aliases` trong `content/terms/*.md`.
- Tránh: chính trị, tôn giáo nhạy cảm, nội dung 18+, từ mang tính xúc phạm/kỳ thị, tin đồn về người thật chưa kiểm chứng.
- Nếu không chắc nghĩa của một từ thì chọn từ khác. Thà chọn từ hơi cũ nhưng giải thích đúng.

## 2. Tạo file

Chạy đúng một lần: `npm run new -- "<Thuật ngữ>" <ngày hôm nay>`

Lệnh này tạo `content/terms/<slug>.md` từ mẫu `content/terms/_template.md`.

## 3. Viết nội dung

Đọc `content/terms/rizz.md` để lấy giọng văn và định dạng mẫu. Sau đó điền file vừa tạo:

- Xoá toàn bộ dòng comment `#` trong frontmatter, giữ đúng các trường.
- `term`: viết đúng như người ta gõ trên MXH.
- `short`: 1–2 câu, tối đa khoảng 160 ký tự, bắt đầu bằng “<Thuật ngữ> là …”, trả lời thẳng câu hỏi.
- `category`: một trong Gen Z, Mạng xã hội, Công nghệ, Tài chính, Marketing, Đời sống, Giải trí, Tâm lý học (bài loại tâm lý học luôn dùng Tâm lý học).
- `aliases`: các cách viết, biến thể người ta cũng search.
- `origin`: nguồn gốc ngắn gọn, có mốc thời gian nếu biết chắc.
- `examples`: 2–3 câu ví dụ tự nhiên như người Việt dùng trên mạng.
- `related`: slug các bài **đã có** trong `content/terms` có liên quan (có thể để `[]`).
- `faq`: 2–4 câu hỏi người ta hay search kèm, trả lời ngắn.
- `sources`: 2–3 nguồn **có thật** lấy từ kết quả WebSearch/WebFetch của bạn. Tuyệt đối không bịa URL.
- Thân bài: Markdown 300–600 chữ, dùng heading `##`. Gồm: nghĩa là gì, vì sao viral, cách dùng/lưu ý.
- Viết tiếng Việt có dấu, rõ ràng, trung lập, không câu kéo.

## 4. Kết thúc

- Chỉ tạo/sửa đúng một file thuật ngữ mới. Không sửa file khác, không chạy git.
- Dòng cuối cùng in ra: `DONE <slug>`
