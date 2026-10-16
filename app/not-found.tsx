import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 className="text-3xl font-extrabold">Chưa có thuật ngữ này</h1>
      <p className="mt-3 text-stone-600">Có thể từ này sắp được giải nghĩa. Trong lúc chờ, xem các thuật ngữ đã có nhé.</p>
      <Link href="/thuat-ngu" className="mt-6 inline-block rounded-full bg-brand-600 text-white px-6 py-3 font-bold hover:bg-brand-700">
        Xem tất cả thuật ngữ
      </Link>
    </div>
  );
}
