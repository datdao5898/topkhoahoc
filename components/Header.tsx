import Link from "next/link";
import Logo from "@/components/Logo";
import { FollowButton } from "@/components/FollowFacebook";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label="TopKhoaHoc – trang chủ">
          <Logo withTagline />
        </Link>
        <nav className="flex items-center gap-5 text-sm font-semibold text-stone-700 max-sm:gap-3">
          {/* Trên điện thoại logo đã dẫn về trang chủ, bỏ bớt link cho khỏi tràn. */}
          <Link href="/" className="hover:text-brand-600 transition max-sm:hidden">
            Hôm nay
          </Link>
          <Link href="/thuat-ngu" className="hover:text-brand-600 transition">
            <span className="max-sm:hidden">Tất cả thuật ngữ</span>
            <span className="sm:hidden">Thuật ngữ</span>
          </Link>
          <FollowButton />
        </nav>
      </div>
    </header>
  );
}
