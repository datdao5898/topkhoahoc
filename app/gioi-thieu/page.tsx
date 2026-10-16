import type { Metadata } from "next";
import Link from "next/link";
import { SITE, absoluteUrl, organizationJsonLd } from "@/lib/site";

export const metadata: Metadata = {
  title: "Giới thiệu & quy trình biên tập",
  description: `${SITE.name} giải nghĩa mỗi ngày một thuật ngữ trending trên mạng xã hội. Tìm hiểu cách chúng tôi chọn từ, kiểm chứng và cập nhật nội dung.`,
  alternates: { canonical: "/gioi-thieu" },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "AboutPage", url: absoluteUrl("/gioi-thieu"), name: `Giới thiệu ${SITE.name}`, about: { "@id": absoluteUrl("/#organization") } },
      organizationJsonLd(),
    ],
  };

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-3xl md:text-4xl font-extrabold">Giới thiệu {SITE.name}</h1>
      <div className="prose prose-stone prose-lg mt-6 max-w-none prose-a:text-brand-600">
        <p>
          <strong>{SITE.name}</strong> là từ điển tiếng lóng và thuật ngữ trending trên mạng xã hội tiếng Việt. Mỗi ngày
          chúng tôi chọn một từ đang được nhắc nhiều trên Facebook, TikTok, Threads… và giải thích ngắn gọn: nó nghĩa là gì,
          từ đâu ra, dùng thế nào.
        </p>
        <h2>Chúng tôi chọn từ như thế nào?</h2>
        <p>
          Từ được chọn khi xuất hiện dày đặc trong bình luận, caption, video ngắn và có nhiều người tìm “… là gì” trên Google.
        </p>
        <h2>Quy trình biên tập</h2>
        <ul>
          <li>Mỗi bài mở đầu bằng một câu định nghĩa trả lời thẳng câu hỏi “… là gì?”.</li>
          <li>Nguồn gốc và mốc thời gian được đối chiếu với từ điển, báo chí hoặc nguồn gốc của meme; nguồn được liệt kê cuối bài.</li>
          <li>Ví dụ sử dụng được viết theo cách người Việt thực sự dùng trên mạng.</li>
          <li>Khi nghĩa của từ thay đổi, bài được cập nhật và ghi rõ ngày cập nhật.</li>
        </ul>
        <h2>Góp ý, báo sai</h2>
        <p>
          Thấy giải thích chưa đúng hoặc muốn đề xuất từ mới? Hãy nhắn cho fanpage của chúng tôi. Mọi góp ý đều được xem xét
          trước lần cập nhật tiếp theo.
        </p>
        <p>
          <Link href="/thuat-ngu">Xem tất cả thuật ngữ →</Link>
        </p>
      </div>
    </article>
  );
}
