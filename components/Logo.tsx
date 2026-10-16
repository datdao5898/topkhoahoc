import Image from "next/image";

export default function Logo({ size = 36, withTagline = false }: { size?: number; withTagline?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <Image src="/logo-mark.svg" alt="" width={size} height={size} priority />
      <span className="flex flex-col leading-none">
        <span className="text-xl font-extrabold tracking-tight text-stone-900">
          Top<span className="text-brand-600">KhoaHoc</span>
        </span>
        {withTagline && (
          <span className="mt-1 text-[11px] font-medium text-stone-500 max-sm:hidden">Mỗi ngày một thuật ngữ</span>
        )}
      </span>
    </span>
  );
}
