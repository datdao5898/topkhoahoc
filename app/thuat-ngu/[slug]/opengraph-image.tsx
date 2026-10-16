import { notFound } from "next/navigation";
import { ogSize, renderOgImage } from "@/lib/og";
import { getPublishedTerms, getTermBySlug } from "@/lib/terms";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Giải nghĩa thuật ngữ trending";
export const revalidate = 3600;

export function generateStaticParams() {
  return getPublishedTerms().map((t) => ({ slug: t.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const term = getTermBySlug((await params).slug);
  if (!term) notFound();
  return renderOgImage({ eyebrow: `${term.category} · Thuật ngữ trending`, title: `${term.term} là gì?`, subtitle: term.short });
}
