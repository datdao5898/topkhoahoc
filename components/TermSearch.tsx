"use client";

import { useMemo, useState } from "react";
import TermCard from "@/components/TermCard";
import { categoryClass } from "@/lib/categories";
import { normalizeText } from "@/lib/format";
import type { Term } from "@/lib/terms";

type Item = Pick<Term, "slug" | "term" | "short" | "date" | "category" | "aliases">;

/** compact (trang chủ): căn giữa, chỉ hiện kết quả khi đã gõ từ hoặc chọn chủ đề. */
export default function TermSearch({ terms, compact = false }: { terms: Item[]; compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  // Chủ đề nhiều bài đứng trước.
  const categories = useMemo(() => {
    const count = (c: string) => terms.filter((t) => t.category === c).length;
    return [...new Set(terms.map((t) => t.category))].sort((a, b) => count(b) - count(a) || a.localeCompare(b));
  }, [terms]);

  const q = normalizeText(query.trim());
  const results = useMemo(
    () =>
      terms.filter(
        (t) =>
          (!category || t.category === category) &&
          (!q || normalizeText([t.term, t.short, ...t.aliases].join(" ")).includes(q)),
      ),
    [terms, q, category],
  );

  return (
    <div>
      <div className={compact ? "max-w-2xl mx-auto" : ""}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Tra thuật ngữ"
          placeholder="Gõ thuật ngữ bạn vừa thấy… (vd: rizz, delulu)"
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 focus:outline-none focus:border-brand-500"
        />
        <div className={`mt-3 flex flex-wrap gap-2 ${compact ? "justify-center" : ""}`}>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(category === c ? "" : c)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${categoryClass(c)} ${
                category === c ? "ring-2 ring-current" : "hover:ring-1 hover:ring-current"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      {(!compact || q || category) &&
        (results.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {results.map((t) => (
              <TermCard key={t.slug} term={t} />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-center text-stone-500">Chưa có thuật ngữ này. Quay lại vào ngày mai nhé!</p>
        ))}
    </div>
  );
}
