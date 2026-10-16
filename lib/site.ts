export const SITE = {
  name: "TopKhoaHoc",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://topkhoahoc.online").replace(/\/$/, ""),
  tagline: "Mỗi ngày một thuật ngữ trending",
  description:
    "Từ điển tiếng lóng và thuật ngữ trending trên mạng xã hội: giải nghĩa ngắn gọn, có nguồn gốc, ví dụ. Mỗi ngày một từ mới.",
  logo: "/logo-512.png",
  // Key xác thực IndexNow (Bing, Yandex… và ChatGPT Search vốn dùng index của Bing). File public/<key>.txt.
  indexNowKey: "8c8b665ff7631d60d24e4c6efcbb73b1",
};

export function absoluteUrl(path = "/") {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Đơn vị biên tập, dùng chung cho author/publisher trong JSON-LD. */
export function organizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: SITE.name,
    url: absoluteUrl("/"),
    logo: { "@type": "ImageObject", url: absoluteUrl(SITE.logo), width: 512, height: 512 },
    description: SITE.description,
  };
}
