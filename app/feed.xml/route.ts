import { getPublishedTerms } from "@/lib/terms";
import { SITE, absoluteUrl } from "@/lib/site";

// RSS: dùng để tự động đăng thuật ngữ mới lên Facebook/Telegram qua Zapier, IFTTT, dlvr.it…
export const revalidate = 3600;

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function GET() {
  const items = getPublishedTerms()
    .slice(0, 50)
    .map((t) => {
      const url = absoluteUrl(`/thuat-ngu/${t.slug}`);
      return `<item><title>${escape(`${t.term} là gì?`)}</title><link>${url}</link><guid>${url}</guid><pubDate>${new Date(`${t.date}T07:00:00+07:00`).toUTCString()}</pubDate><category>${escape(t.category)}</category><description>${escape(t.short)}</description></item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escape(SITE.name)} – ${escape(SITE.tagline)}</title><link>${SITE.url}</link><description>${escape(SITE.description)}</description><language>vi</language>${items}</channel></rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
