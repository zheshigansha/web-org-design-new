import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'mmbiz.qpic.cn' },
      { protocol: 'https', hostname: 'mp.weixin.qq.com' },
    ],
  },
};

export default nextConfig;
