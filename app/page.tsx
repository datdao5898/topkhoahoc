import Link from "next/link";
import TermCard from "@/components/TermCard";
import { formatDate } from "@/lib/format";
import { getPublishedTerms, getTermOfTheDay } from "@/lib/terms";
import { SITE, absoluteUrl, organizationJsonLd } from "@/lib/site";

// Kiểm tra lại mỗi giờ để thuật ngữ hẹn giờ tự lên trang chủ khi tới ngày.
export const revalidate = 3600;

export default function HomePage() {
  const today = getTermOfTheDay();
  const recent = getPublishedTerms().filter((t) => t !== today);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        name: SITE.name,
        url: absoluteUrl("/"),
        description: SITE.description,
        inLanguage: "vi-VN",
        publisher: { "@id": absoluteUrl("/#organization") },
      },
      organizationJsonLd(),
    ],
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="text-center mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">{SITE.tagline}</p>
        <h1 className="mt-2 text-3xl md:text-5xl font-extrabold">Thấy từ lạ trên mạng? Tra ngay ở đây.</h1>
        <p className="mt-3 text-stone-600 max-w-2xl mx-auto">
          Mỗi ngày giải nghĩa một thuật ngữ, tiếng lóng đang trending trên Facebook, TikTok, Threads… ngắn gọn, dễ hiểu,
          có ví dụ.
        </p>
      </section>

      {today ? (
        <Link
          href={`/thuat-ngu/${today.slug}`}
          className="group block rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-white p-8 md:p-12 shadow-lg hover:shadow-xl transition"
        >
          <p className="text-sm font-semibold opacity-90">
            Thuật ngữ hôm nay · {formatDate(today.date)}
          </p>
          <h2 className="mt-3 text-4xl md:text-6xl font-extrabold">{today.term}</h2>
          <p className="mt-4 text-lg md:text-xl max-w-3xl opacity-95">{today.short}</p>
          <span className="mt-6 inline-block rounded-full bg-white text-brand-700 px-5 py-2 font-bold group-hover:bg-brand-50">
            Xem giải thích đầy đủ →
          </span>
        </Link>
      ) : (
        <p className="text-center text-stone-500">Thuật ngữ đầu tiên sắp lên sóng!</p>
      )}

      {recent.length > 0 && (
        <section className="mt-12">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-2xl font-bold">Thuật ngữ gần đây</h2>
            <Link href="/thuat-ngu" className="text-sm font-semibold text-brand-600 hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {recent.slice(0, 10).map((t) => (
              <TermCard key={t.slug} term={t} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
