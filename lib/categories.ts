// Màu riêng cho từng chủ đề. Viết đủ tên class để Tailwind nhận ra.
const STYLES: Record<string, string> = {
  "Gen Z": "bg-violet-50 text-violet-700",
  "Mạng xã hội": "bg-blue-50 text-blue-700",
  "Tâm lý học": "bg-rose-50 text-rose-700",
  "Đời sống": "bg-green-50 text-green-700",
  "Giải trí": "bg-fuchsia-50 text-fuchsia-700",
  "Tài chính": "bg-amber-50 text-amber-700",
  "Công nghệ": "bg-teal-50 text-teal-700",
};

export function categoryClass(category: string) {
  return STYLES[category] ?? "bg-brand-50 text-brand-700";
}
