import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ShareButtons from "@/components/ShareButtons";
import TermCard from "@/components/TermCard";
import { formatDate } from "@/lib/format";
import { getAdjacentTerms, getPublishedTerms, getRelatedTerms, getTermBySlug, type Term } from "@/lib/terms";
import { SITE, absoluteUrl, organizationJsonLd } from "@/lib/site";

// Thuật ngữ hẹn giờ chưa có trong build sẽ được render khi tới ngày (ISR).
export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPublishedTerms().map((t) => ({ slug: t.slug }));
}

function pageTitle(term: Term) {
  return term.seoTitle ?? `${term.term} là gì? Ý nghĩa của "${term.term}" trên mạng xã hội`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const term = getTermBySlug((await params).slug);
  if (!term) return {};
  const url = `/thuat-ngu/${term.slug}`;
  return {
    title: pageTitle(term),
    description: term.short,
    keywords: [term.term, `${term.term} là gì`, `${term.term} nghĩa là gì`, ...term.aliases],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: SITE.name,
      locale: "vi_VN",
      title: `${term.term} là gì?`,
      description: term.short,
      publishedTime: term.date,
      modifiedTime: term.updated ?? term.date,
      section: term.category,
    },
  };
}

export default async function TermPage({ params }: Props) {
  const term = getTermBySlug((await params).slug);
  if (!term) notFound();

  const url = absoluteUrl(`/thuat-ngu/${term.slug}`);
  const related = getRelatedTerms(term);
  const { newer, older } = getAdjacentTerms(term);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTerm",
        name: term.term,
        alternateName: term.aliases,
        description: term.short,
        url,
        "@id": `${url}#term`,
        inDefinedTermSet: {
          "@type": "DefinedTermSet",
          name: "Từ điển thuật ngữ trending",
          url: absoluteUrl("/thuat-ngu"),
        },
      },
      {
        "@type": "Article",
        headline: pageTitle(term),
        description: term.short,
        datePublished: term.date,
        dateModified: term.updated ?? term.date,
        inLanguage: "vi-VN",
        image: `${url}/opengraph-image`,
        mainEntityOfPage: url,
        about: { "@id": `${url}#term` },
        keywords: [term.term, ...term.aliases].join(", "),
        articleSection: term.category,
        author: { "@id": absoluteUrl("/#organization") },
        publisher: { "@id": absoluteUrl("/#organization") },
        ...(term.sources.length
          ? { citation: term.sources.map((s) => ({ "@type": "CreativeWork", name: s.title, url: s.url })) }
          : {}),
      },
      organizationJsonLd(),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Thuật ngữ", item: absoluteUrl("/thuat-ngu") },
          { "@type": "ListItem", position: 3, name: term.term, item: url },
        ],
      },
      ...(term.faq.length
        ? [
            {
              "@type": "FAQPage",
              mainEntity: term.faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <nav className="text-sm text-stone-500 mb-6">
        <Link href="/" className="hover:text-brand-600">
          Trang chủ
        </Link>
        {" / "}
        <Link href="/thuat-ngu" className="hover:text-brand-600">
          Thuật ngữ
        </Link>
        {" / "}
        <span className="text-stone-800">{term.term}</span>
      </nav>

      <header>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-brand-100 text-brand-700 px-3 py-1 font-semibold">{term.category}</span>
          <time dateTime={term.date} className="text-stone-500">
            {formatDate(term.date)}
          </time>
          {term.updated && term.updated !== term.date && (
            <span className="text-stone-500">
              · Cập nhật <time dateTime={term.updated}>{formatDate(term.updated, "short")}</time>
            </span>
          )}
        </div>
        <h1 className="mt-4 text-4xl md:text-5xl font-extrabold">{term.term} là gì?</h1>
        {(term.pronunciation || term.aliases.length > 0) && (
          <p className="mt-3 text-stone-500">
            {term.pronunciation && <span className="mr-3">Phát âm: {term.pronunciation}</span>}
            {term.aliases.length > 0 && <span>Biến thể: {term.aliases.join(", ")}</span>}
          </p>
        )}
      </header>

      {/* Định nghĩa ngắn ở đầu trang: người đọc từ MXH sang cần câu trả lời ngay. */}
      <section className="mt-6 rounded-2xl border-l-4 border-brand-500 bg-brand-50 p-5 md:p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-700">Định nghĩa nhanh</h2>
        <p className="mt-2 text-lg md:text-xl font-medium leading-relaxed">{term.short}</p>
      </section>
      <p className="mt-3 text-sm text-stone-500">
        Biên soạn bởi{" "}
        <Link href="/gioi-thieu" className="font-semibold text-stone-700 hover:text-brand-600">
          Ban biên tập {SITE.name}
        </Link>
      </p>

      {term.origin && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold">Nguồn gốc</h2>
          <p className="mt-2 text-stone-700 leading-relaxed">{term.origin}</p>
        </section>
      )}

      <div
        className="prose prose-stone prose-lg mt-8 max-w-none prose-headings:font-bold prose-a:text-brand-600"
        dangerouslySetInnerHTML={{ __html: term.html }}
      />

      {term.examples.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold">Ví dụ cách dùng &ldquo;{term.term}&rdquo;</h2>
          <ul className="mt-4 space-y-3">
            {term.examples.map((ex) => (
              <li key={ex} className="rounded-xl bg-white border border-stone-200 px-4 py-3 italic text-stone-700">
                &ldquo;{ex}&rdquo;
              </li>
            ))}
          </ul>
        </section>
      )}

      {term.faq.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold">Câu hỏi thường gặp</h2>
          <div className="mt-4 space-y-3">
            {term.faq.map((f) => (
              <details key={f.q} className="group rounded-xl bg-white border border-stone-200 px-4 py-3" open>
                <summary className="cursor-pointer font-semibold">{f.q}</summary>
                <p className="mt-2 text-stone-700 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {term.sources.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold">Nguồn tham khảo</h2>
          <ul className="mt-3 list-disc pl-5 space-y-1 text-stone-700">
            {term.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener" className="text-brand-600 hover:underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10 border-t border-stone-200 pt-6">
        <p className="mb-3 font-semibold">Bạn bè cũng đang thắc mắc? Gửi cho họ:</p>
        <ShareButtons url={url} title={`${term.term} là gì?`} />
      </section>

      {(newer || older) && (
        <nav className="mt-10 grid grid-cols-2 gap-4 text-sm">
          <div>
            {older && (
              <Link href={`/thuat-ngu/${older.slug}`} className="block rounded-xl border border-stone-200 bg-white p-4 hover:border-brand-500">
                <span className="text-stone-500">← Hôm trước</span>
                <span className="block font-bold">{older.term}</span>
              </Link>
            )}
          </div>
          <div className="text-right">
            {newer && (
              <Link href={`/thuat-ngu/${newer.slug}`} className="block rounded-xl border border-stone-200 bg-white p-4 hover:border-brand-500">
                <span className="text-stone-500">Hôm sau →</span>
                <span className="block font-bold">{newer.term}</span>
              </Link>
            )}
          </div>
        </nav>
      )}

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Thuật ngữ liên quan</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {related.map((t) => (
              <TermCard key={t.slug} term={t} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
