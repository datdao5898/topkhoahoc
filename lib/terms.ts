import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { TIME_ZONE } from "@/lib/format";

const TERMS_DIR = path.join(process.cwd(), "content", "terms");

export type Faq = { q: string; a: string };
export type Source = { title: string; url: string };

export type Term = {
  slug: string;
  term: string;
  date: string; // YYYY-MM-DD
  updated?: string;
  short: string;
  category: string;
  aliases: string[];
  pronunciation?: string;
  origin?: string;
  examples: string[];
  related: string[];
  faq: Faq[];
  sources: Source[];
  seoTitle?: string;
  /** Bài bổ sung kho từ: không phải "thuật ngữ của ngày". */
  bonus: boolean;
  html: string;
  /** Nội dung Markdown gốc (dùng cho llms-full.txt). */
  body: string;
};

function toDateString(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  return undefined;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function readTerm(file: string): Term {
  const slug = file.replace(/\.md$/, "");
  const { data, content } = matter(fs.readFileSync(path.join(TERMS_DIR, file), "utf8"));

  const date = toDateString(data.date);
  if (!data.term || !data.short || !date) {
    throw new Error(`content/terms/${file}: thiếu "term", "short" hoặc "date" (YYYY-MM-DD)`);
  }

  return {
    slug,
    term: String(data.term),
    date,
    updated: toDateString(data.updated),
    short: String(data.short),
    category: data.category ? String(data.category) : "Mạng xã hội",
    aliases: toStringArray(data.aliases),
    pronunciation: data.pronunciation ? String(data.pronunciation) : undefined,
    origin: data.origin ? String(data.origin) : undefined,
    examples: toStringArray(data.examples),
    related: toStringArray(data.related),
    faq: Array.isArray(data.faq)
      ? data.faq.map((f: { q: unknown; a: unknown }) => ({ q: String(f.q), a: String(f.a) }))
      : [],
    sources: Array.isArray(data.sources)
      ? data.sources.map((s: { title: unknown; url: unknown }) => ({ title: String(s.title), url: String(s.url) }))
      : [],
    seoTitle: data.seoTitle ? String(data.seoTitle) : undefined,
    bonus: data.bonus === true,
    html: marked.parse(content, { async: false }),
    body: content.trim(),
  };
}

function loadAllTerms(): Term[] {
  return fs
    .readdirSync(TERMS_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map(readTerm)
    .sort((a, b) => b.date.localeCompare(a.date) || a.term.localeCompare(b.term));
}

export function todayInVietnam(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
}

/** Thuật ngữ đã tới ngày đăng, mới nhất trước. File có date trong tương lai sẽ tự lên trang đúng ngày. */
export function getPublishedTerms(): Term[] {
  const today = todayInVietnam();
  return loadAllTerms().filter((t) => t.date <= today);
}

export function getTermBySlug(slug: string): Term | undefined {
  return getPublishedTerms().find((t) => t.slug === slug);
}

export function getRelatedTerms(term: Term, limit = 4): Term[] {
  const published = getPublishedTerms().filter((t) => t.slug !== term.slug);
  const picked = term.related
    .map((slug) => published.find((t) => t.slug === slug))
    .filter((t): t is Term => Boolean(t));
  for (const t of published) {
    if (picked.length >= limit) break;
    if (!picked.includes(t) && t.category === term.category) picked.push(t);
  }
  return picked.slice(0, limit);
}

/** Thuật ngữ của ngày gần nhất (bỏ qua bài bổ sung). */
export function getTermOfTheDay(): Term | undefined {
  const published = getPublishedTerms();
  return published.find((t) => !t.bonus) ?? published[0];
}

export function getAdjacentTerms(term: Term) {
  const published = getPublishedTerms();
  const i = published.findIndex((t) => t.slug === term.slug);
  return { newer: published[i - 1], older: published[i + 1] };
}
