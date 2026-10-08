import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Lets phones on the same Wi-Fi load the dev server via the laptop's LAN IP (game testing).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  async redirects() {
    return [
      { source: "/multiplayer/:path*", destination: "/games", permanent: false },
      // Student sign-in used to live under /ctf. Old links and printed QR codes keep their ?next=,
      // otherwise they head back to the CTF.
      ...["login", "register"].flatMap((page) => [
        { source: `/ctf/${page}`, has: [{ type: "query" as const, key: "next" }], destination: `/${page}`, permanent: false },
        { source: `/ctf/${page}`, destination: `/${page}?next=/ctf`, permanent: false },
      ]),
    ];
  },
};

export default nextConfig;
