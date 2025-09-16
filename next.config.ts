import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  basePath: isProd ? "/tesi" : "",
  assetPrefix: isProd ? "/tesi/" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
