import Link from "next/link";
import Logo from "@/components/Logo";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white mt-16">
      <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6 md:items-center md:justify-between text-sm text-stone-500">
        <div>
          <Logo size={28} />
          <p className="mt-2">{SITE.tagline}. Thấy từ lạ trên mạng? Tra ở đây.</p>
        </div>
        <nav className="flex gap-5">
          <Link href="/thuat-ngu" className="hover:text-brand-600">
            Tất cả thuật ngữ
          </Link>
          <Link href="/gioi-thieu" className="hover:text-brand-600">
            Giới thiệu
          </Link>
          <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">
            Facebook
          </a>
          <Link href="/feed.xml" className="hover:text-brand-600">
            RSS
          </Link>
        </nav>
        <p>© {new Date().getFullYear()} {SITE.name}</p>
      </div>
    </footer>
  );
}
