import { ogSize, renderOgImage } from "@/lib/og";
import { SITE } from "@/lib/site";

export const size = ogSize;
export const contentType = "image/png";
export const alt = SITE.tagline;

export default function Image() {
  return renderOgImage({
    eyebrow: SITE.name,
    title: "Thấy từ lạ trên mạng?",
    subtitle: "Tra nghĩa ngay. Mỗi ngày giải thích một thuật ngữ trending trên mạng xã hội.",
  });
}
