import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.RENDER_DEPLOY === "1" ? { output: "standalone" as const } : {}),
};

export default nextConfig;
