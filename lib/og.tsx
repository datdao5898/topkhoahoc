import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const ogSize = { width: 1200, height: 630 };

// Font Be Vietnam Pro (subset latin + vietnamese) để ảnh hiển thị đúng dấu tiếng Việt.
async function loadFonts() {
  const dir = path.join(process.cwd(), "assets", "fonts");
  const file = (name: string) => readFile(path.join(dir, name));
  const [latin500, viet500, latin800, viet800] = await Promise.all([
    file("be-vietnam-pro-latin-500-normal.woff"),
    file("be-vietnam-pro-vietnamese-500-normal.woff"),
    file("be-vietnam-pro-latin-800-normal.woff"),
    file("be-vietnam-pro-vietnamese-800-normal.woff"),
  ]);
  return [
    { name: "BeVietnam", data: latin500, weight: 500 as const },
    { name: "BeVietnam", data: viet500, weight: 500 as const },
    { name: "BeVietnam", data: latin800, weight: 800 as const },
    { name: "BeVietnam", data: viet800, weight: 800 as const },
  ];
}

export async function renderOgImage({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
          color: "white",
          fontFamily: "BeVietnam",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, fontWeight: 500, opacity: 0.9 }}>{eyebrow}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: title.length > 18 ? 84 : 112, fontWeight: 800, lineHeight: 1.05 }}>
            {title}
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 36, fontWeight: 500, lineHeight: 1.35, opacity: 0.95 }}>
            {subtitle.length > 140 ? `${subtitle.slice(0, 137)}…` : subtitle}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, fontWeight: 800 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="44" height="44" viewBox="0 0 32 32">
              <path d="M7 2.5h18a5 5 0 0 1 5 5v13a5 5 0 0 1-5 5H15l-6.5 4.5v-4.5H7a5 5 0 0 1-5-5v-13a5 5 0 0 1 5-5z" fill="#fff" />
              <path d="M12.6 10.6a3.6 3.6 0 1 1 5.1 3.3c-1.1.5-1.7 1.3-1.7 2.5v.6" fill="none" stroke="#ea580c" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="16" cy="21" r="1.75" fill="#ea580c" />
            </svg>
            {SITE.url.replace(/^https?:\/\//, "")}
          </span>
          <span style={{ opacity: 0.85, fontWeight: 500 }}>{SITE.tagline}</span>
        </div>
      </div>
    ),
    { ...ogSize, fonts: await loadFonts() },
  );
}
