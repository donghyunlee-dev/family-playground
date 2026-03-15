import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@family-playground/game-memory-card",
    "@family-playground/game-word-chain",
    "@family-playground/supabase-client",
    "@family-playground/ui",
  ],
};

export default nextConfig;
