import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      // Sau này khi kết nối WordPress, bạn hãy thêm domain của web WordPress vào đây
      // {
      //   protocol: 'https',
      //   hostname: 'your-wordpress-site.com',
      // },
    ],
  },
};

export default nextConfig;
