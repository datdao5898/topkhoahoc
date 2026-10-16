import { formatDate } from "@/lib/format";
import { getPublishedTerms } from "@/lib/terms";
import { SITE, absoluteUrl } from "@/lib/site";

// Toàn bộ nội dung dạng Markdown để mô hình AI đọc một lần.
export const revalidate = 3600;

const list = (items: string[]) => items.map((i) => `- ${i}`).join("\n");

export function GET() {
  const sections = getPublishedTerms().map((t) => {
    const meta = [
      `URL: ${absoluteUrl(`/thuat-ngu/${t.slug}`)}`,
      `Ngày đăng: ${formatDate(t.date, "short")}${t.updated ? ` (cập nhật ${formatDate(t.updated, "short")})` : ""}`,
      `Chủ đề: ${t.category}`,
      ...(t.aliases.length ? [`Biến thể: ${t.aliases.join(", ")}`] : []),
    ];
    return [
      `## ${t.term} là gì?`,
      list(meta),
      `**Định nghĩa:** ${t.short}`,
      t.origin && `**Nguồn gốc:** ${t.origin}`,
      // Hạ cấp heading trong bài để nằm dưới "## <term> là gì?".
      t.body.replace(/^(#{2,5}) /gm, "#$1 "),
      t.examples.length && `**Ví dụ:**\n\n${list(t.examples.map((e) => `"${e}"`))}`,
      t.faq.length && `**Câu hỏi thường gặp:**\n\n${list(t.faq.map((f) => `${f.q} ${f.a}`))}`,
      t.sources.length && `**Nguồn:**\n\n${list(t.sources.map((s) => `[${s.title}](${s.url})`))}`,
    ]
      .filter(Boolean)
      .join("\n\n");
  });

  const body = [`# ${SITE.name}: toàn bộ thuật ngữ`, `> ${SITE.description}`, ...sections].join("\n\n") + "\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
