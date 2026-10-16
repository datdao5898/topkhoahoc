import Link from "next/link";
import Logo from "@/components/Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label="TopKhoaHoc – trang chủ">
          <Logo withTagline />
        </Link>
        <nav className="flex items-center gap-5 text-sm font-semibold text-stone-700 max-sm:gap-3 max-sm:text-xs">
          <Link href="/" className="hover:text-brand-600 transition">
            Hôm nay
          </Link>
          <Link href="/thuat-ngu" className="hover:text-brand-600 transition">
            Tất cả thuật ngữ
          </Link>
        </nav>
      </div>
    </header>
  );
}
