import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

function getR2PublicHostInfo(): { origin: string; hostname: string } | null {
  const raw = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim() ?? "";
  if (!raw) {
    return null;
  }
  try {
    const parsed = new URL(raw);
    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      !parsed.hostname
    ) {
      return null;
    }
    return { origin: parsed.origin, hostname: parsed.hostname };
  } catch {
    return null;
  }
}

const r2HostInfo = getR2PublicHostInfo();
const extraMediaOrigins = [
  "https://*.r2.dev",
  ...(r2HostInfo && !r2HostInfo.hostname.endsWith(".r2.dev")
    ? [r2HostInfo.origin]
    : []),
].join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://*.blob.vercel-storage.com ${extraMediaOrigins}`,
  `media-src 'self' blob: https://*.public.blob.vercel-storage.com https://*.blob.vercel-storage.com ${extraMediaOrigins}`,
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]
    : []),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const noIndexHeaders = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      ...(r2HostInfo && !r2HostInfo.hostname.endsWith(".r2.dev")
        ? [
            {
              protocol: "https" as const,
              hostname: r2HostInfo.hostname,
            },
          ]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/admin/:path*",
        headers: noIndexHeaders,
      },
      {
        source: "/login",
        headers: noIndexHeaders,
      },
      {
        source: "/api/:path*",
        headers: noIndexHeaders,
      },
    ];
  },
};

export default nextConfig;
