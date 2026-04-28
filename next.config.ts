import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*"],
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Keep native / deep-file-IO deps external so Turbopack doesn't try to
  // statically resolve optional sub-deps (e.g. unzipper → @aws-sdk/client-s3).
  serverExternalPackages: ["adm-zip", "@prisma/client", "pdf-parse"],
};

export default nextConfig;
