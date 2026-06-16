import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    // Dev mode needs 'unsafe-eval' for the Next.js HMR runtime and must
    // allow loading the Google Fonts stylesheet that globals.css @imports.
    // Production keeps the strict baseline.
    const isDev = process.env.NODE_ENV !== "production";
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'unsafe-hashes'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-hashes'";
    const styleSrc = isDev
      ? "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"
      : "style-src 'self' 'unsafe-inline'";
    const fontSrc = isDev
      ? "font-src 'self' https://fonts.gstatic.com"
      : "font-src 'self'";
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              scriptSrc,
              styleSrc,
              "img-src 'self' data: https://images.unsplash.com",
              fontSrc,
              "connect-src 'self' https://*.supabase.co https://api.openai.com https://api.anthropic.com https://api.deepseek.com https://generativelanguage.googleapis.com",
              "worker-src 'self' blob:",
              "frame-src 'none'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
