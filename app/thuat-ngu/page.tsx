import type { Metadata } from "next";
import TermSearch from "@/components/TermSearch";
import { getPublishedTerms } from "@/lib/terms";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Từ điển thuật ngữ trending trên mạng xã hội",
  description:
    "Tra nghĩa tất cả thuật ngữ, tiếng lóng Gen Z, từ hot trên Facebook, TikTok, Threads. Cập nhật một từ mới mỗi ngày.",
  alternates: { canonical: "/thuat-ngu" },
};

export default function TermsIndexPage() {
  const terms = getPublishedTerms().map(({ slug, term, short, date, category, aliases }) => ({
    slug,
    term,
    short,
    date,
    category,
    aliases,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold">Từ điển thuật ngữ trending</h1>
      <p className="mt-2 mb-8 text-stone-600">{terms.length} thuật ngữ đã giải nghĩa. Mỗi ngày thêm một từ mới.</p>
      <TermSearch terms={terms} />
    </div>
  );
}
