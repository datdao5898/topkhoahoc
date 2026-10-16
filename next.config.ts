import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Nội dung và font được đọc bằng fs khi render lại (ISR), cần đóng gói kèm.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*", "./assets/**/*"],
  },
};

export default nextConfig;
