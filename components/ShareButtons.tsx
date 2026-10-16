"use client";

import { useState } from "react";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Người dùng huỷ chia sẻ – chuyển sang copy link.
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const btn = "rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold hover:border-brand-500 hover:text-brand-600 transition";

  return (
    <div className="flex flex-wrap gap-2">
      <a
        className={btn}
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Chia sẻ Facebook
      </a>
      <button type="button" className={btn} onClick={share}>
        {copied ? "Đã copy link ✓" : "Copy link"}
      </button>
    </div>
  );
}
