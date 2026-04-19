import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for the Docker multi-stage build: copies only the minimal server
  // bundle into the runtime image (~10x smaller than a full install).
  output: "standalone",
};

export default nextConfig;
