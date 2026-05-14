import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AIDLA — Free Learning, Earn Coins & Win Prizes",
    short_name: "AIDLA",
    description: "Pakistan-based free education and rewards platform. Learn, earn coins, win real prizes.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0b1437",
    categories: ["education", "productivity"],
    lang: "en",
    scope: "/",
    icons: [
      { src: "/icon-192.png",  sizes: "192x192",  type: "image/png", purpose: "any" },
      { src: "/icon-512.png",  sizes: "512x512",  type: "image/png", purpose: "any" },
      { src: "/icon-512.png",  sizes: "512x512",  type: "image/png", purpose: "maskable" },
    ],
    screenshots: [
      { src: "/og-home.jpg", sizes: "1200x630", type: "image/jpeg", label: "AIDLA Homepage" },
    ],
  };
}
