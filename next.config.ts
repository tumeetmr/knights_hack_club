import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Lets phones on the same Wi-Fi load the dev server via the laptop's LAN IP (game testing).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  async redirects() {
    return [{ source: "/multiplayer/:path*", destination: "/games", permanent: false }];
  },
};

export default nextConfig;
