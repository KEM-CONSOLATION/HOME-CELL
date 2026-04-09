import type { MetadataRoute } from "next";

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export default function manifest(): MetadataRoute.Manifest {
  const base = appBaseUrl();

  return {
    id: `${base}/`,
    name: "HOME-CELL — Salvation Ministries",
    short_name: "HOME-CELL",
    description:
      "Home Fellowship attendance and communication management for Salvation Ministries.",
    lang: "en",
    dir: "ltr",
    scope: "/",
    start_url: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#0b6fb3",
    categories: ["productivity", "business"],
    launch_handler: {
      client_mode: "navigate-existing",
    },
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Open the leadership dashboard",
        url: "/app",
        icons: [{ src: "/logo.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Members",
        short_name: "Members",
        description: "Cell member directory",
        url: "/app/members",
        icons: [{ src: "/logo.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "New converts",
        short_name: "Converts",
        description: "Follow up new converts",
        url: "/app/converts",
        icons: [{ src: "/logo.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
