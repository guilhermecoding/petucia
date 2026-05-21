import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["serialport", "@serialport/parser-readline"],
};

export default nextConfig;
