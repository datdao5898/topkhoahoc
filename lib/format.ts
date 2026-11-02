// Không import fs ở đây: file này được dùng cả trong client component.
export const TIME_ZONE = "Asia/Ho_Chi_Minh";

/** Bỏ dấu, viết thường: để so khớp "rizz", "Đừng" với "dung"... */
export const normalizeText = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

export function formatDate(date: string, style: "long" | "short" = "long") {
  const d = new Date(`${date}T00:00:00+07:00`);
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: TIME_ZONE,
    ...(style === "long"
      ? { weekday: "long", day: "numeric", month: "long", year: "numeric" }
      : { day: "2-digit", month: "2-digit", year: "numeric" }),
  }).format(d);
}
