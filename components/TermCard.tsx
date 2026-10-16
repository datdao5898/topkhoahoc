import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { Term } from "@/lib/terms";

export default function TermCard({ term }: { term: Pick<Term, "slug" | "term" | "short" | "date" | "category"> }) {
  return (
    <Link
      href={`/thuat-ngu/${term.slug}`}
      className="group block rounded-2xl border border-stone-200 bg-white p-5 hover:border-brand-500 hover:shadow-md transition"
    >
      <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
        <span className="font-semibold text-brand-600">{term.category}</span>
        <time dateTime={term.date}>{formatDate(term.date, "short")}</time>
      </div>
      <h3 className="text-lg font-bold group-hover:text-brand-600 transition">{term.term} là gì?</h3>
      <p className="mt-1 text-sm text-stone-600 line-clamp-2">{term.short}</p>
    </Link>
  );
}
