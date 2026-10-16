"use client";

import { useMemo, useState } from "react";
import TermCard from "@/components/TermCard";
import type { Term } from "@/lib/terms";

type Item = Pick<Term, "slug" | "term" | "short" | "date" | "category" | "aliases">;

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

export default function TermSearch({ terms }: { terms: Item[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const categories = useMemo(() => [...new Set(terms.map((t) => t.category))].sort(), [terms]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    return terms.filter(
      (t) =>
        (!category || t.category === category) &&
        (!q || normalize([t.term, t.short, ...t.aliases].join(" ")).includes(q)),
    );
  }, [terms, query, category]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Gõ thuật ngữ bạn vừa thấy… (vd: rizz, delulu)"
          className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 focus:outline-none focus:border-brand-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-stone-300 bg-white px-4 py-3 focus:outline-none focus:border-brand-500"
        >
          <option value="">Tất cả chủ đề</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      {results.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((t) => (
            <TermCard key={t.slug} term={t} />
          ))}
        </div>
      ) : (
        <p className="text-stone-500">Chưa có thuật ngữ này. Quay lại vào ngày mai nhé!</p>
      )}
    </div>
  );
}
