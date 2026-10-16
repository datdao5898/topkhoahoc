export const SITE = {
  name: "TopKhoaHoc",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://topkhoahoc.online").replace(/\/$/, ""),
  tagline: "Mỗi ngày một thuật ngữ trending",
  description:
    "Giải nghĩa nhanh, dễ hiểu các thuật ngữ, tiếng lóng đang hot trên mạng xã hội. Mỗi ngày một từ mới.",
};

export function absoluteUrl(path = "/") {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
