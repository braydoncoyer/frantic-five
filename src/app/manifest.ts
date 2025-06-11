import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Frantic Five - Daily Word Game",
    short_name: "Frantic Five",
    description:
      "A daily word puzzle game where you find the secret word that falls alphabetically between two others.",
    start_url: "/",
    display: "standalone",
    background_color: "#0E172B",
    theme_color: "#FF8905",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
