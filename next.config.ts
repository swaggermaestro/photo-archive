import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true
  },
  basePath: "/photo-archive",
};

export default nextConfig;
