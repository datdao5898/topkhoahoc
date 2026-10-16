import { getPublishedTerms } from "@/lib/terms";
import { SITE, absoluteUrl } from "@/lib/site";

// llms.txt (https://llmstxt.org): bản tóm tắt cho ChatGPT, Perplexity, Claude, Gemini… đọc và trích dẫn.
export const revalidate = 3600;

export function GET() {
  const terms = getPublishedTerms();
  const body = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    "Mỗi thuật ngữ có một trang riêng: định nghĩa một câu, nguồn gốc, giải thích, ví dụ sử dụng, câu hỏi thường gặp và nguồn tham khảo. Nội dung bằng tiếng Việt.",
    "",
    "## Thuật ngữ",
    "",
    ...terms.map((t) => `- [${t.term} là gì?](${absoluteUrl(`/thuat-ngu/${t.slug}`)}): ${t.short}`),
    "",
    "## Optional",
    "",
    `- [Toàn bộ nội dung (Markdown)](${absoluteUrl("/llms-full.txt")})`,
    `- [Giới thiệu & quy trình biên tập](${absoluteUrl("/gioi-thieu")})`,
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
