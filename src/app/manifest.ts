import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HOME-CELL",
    short_name: "HOME-CELL",
    description:
      "Home Fellowship attendance and communication management for Salvation Ministries.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0b6fb3",
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
