import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core"],
  async headers() {
    return [
      {
        // Layer 1 rule: static assets (JS/CSS/fonts/images) cached for 1 year at CDN/edge.
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Layer 1 rule: public assets served via CDN should also be long-lived.
        source: "/:path*\\.:ext(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Layer 1 baseline rule: API responses are edge-cacheable for 60 seconds.
        // Specific AI routes are overridden in middleware to 10 minutes.
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=120",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
