import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LandGuard – Ghana Land Registry",
    short_name: "LandGuard",
    description:
      "Ghana's trusted digital land registry. Verify, buy, and protect land ownership.",
    start_url: "/",
    display: "standalone",
    background_color: "#0F172A",
    theme_color: "#F59E0B",
    orientation: "portrait-primary",
    categories: ["government", "finance", "productivity"],
    lang: "en-GH",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [],
    shortcuts: [
      {
        name: "Search Land",
        url: "/search",
        description: "Search and verify land records",
      },
      {
        name: "Verify Document",
        url: "/verify",
        description: "Verify a land document",
      },
    ],
  };
}
