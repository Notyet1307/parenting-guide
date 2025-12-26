import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // Disabled to support Supabase SSR & Server Actions
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
