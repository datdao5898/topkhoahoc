import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white mt-16">
      <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6 md:items-center md:justify-between text-sm text-stone-500">
        <div>
          <p className="font-bold text-stone-800">{SITE.name}</p>
          <p>{SITE.tagline}. Thấy từ lạ trên mạng? Tra ở đây.</p>
        </div>
        <nav className="flex gap-5">
          <Link href="/thuat-ngu" className="hover:text-brand-600">
            Tất cả thuật ngữ
          </Link>
          <Link href="/feed.xml" className="hover:text-brand-600">
            RSS
          </Link>
        </nav>
        <p>© {new Date().getFullYear()} {SITE.name}</p>
      </div>
    </footer>
  );
}
