import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "agent-browser",
    "playwright-core",
    "@browserbasehq/sdk",
  ],
  images: {
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
      {
        protocol: "https",
        //https://nextjs.org/docs/messages/next-image-unconfigured-host
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
