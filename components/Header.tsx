import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/logotkh.png" alt="TopKhoaHoc" width={130} height={36} className="object-contain" priority />
        </Link>
        <nav className="flex items-center gap-5 text-sm font-semibold text-stone-700">
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
