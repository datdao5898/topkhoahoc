import { SITE } from "@/lib/site";

function FacebookIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.91v-8.43H7.08v-3.48h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.68.23 2.68.23v2.97h-1.51c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.48h-2.8V24C19.61 23.08 24 18.09 24 12.07z" />
    </svg>
  );
}

const linkProps = { href: SITE.facebook, target: "_blank", rel: "noopener noreferrer" } as const;

/** Nút nhỏ trên header. */
export function FollowButton() {
  return (
    <a
      {...linkProps}
      aria-label="Theo dõi fanpage Facebook"
      className="inline-flex items-center gap-1.5 rounded-full bg-[#1877F2] px-3 py-1.5 text-white hover:bg-[#166fe0] transition"
    >
      <FacebookIcon className="h-4 w-4" />
      <span className="max-sm:hidden">Theo dõi</span>
    </a>
  );
}

/** Khung kêu gọi theo dõi, đặt cuối bài và trang chủ. */
export function FollowCard({ title = "Không muốn bỏ lỡ từ mới?" }: { title?: string }) {
  return (
    <aside className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 md:p-6">
      <div className="flex-1">
        <p className="text-lg font-bold">{title}</p>
        <p className="text-stone-600">
          Theo dõi fanpage để mỗi ngày nhận một từ lóng mới ngay trên bảng tin, khỏi “quê” khi lướt mạng.
        </p>
      </div>
      <a
        {...linkProps}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#1877F2] px-5 py-3 font-bold text-white hover:bg-[#166fe0] transition"
      >
        <FacebookIcon />
        Theo dõi fanpage
      </a>
    </aside>
  );
}
