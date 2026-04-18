import type { NextConfig } from "next";

const securityHeaders = [
  // Prevents clickjacking (embedding in iframes)
  { key: "X-Frame-Options", value: "DENY" },
  // Prevents MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Controls referrer info sent with requests
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disables access to browser features the app doesn't need
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Forces HTTPS for 1 year (only active in production via Vercel)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Basic XSS protection for older browsers
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
