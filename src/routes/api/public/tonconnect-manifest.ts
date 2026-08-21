import { createFileRoute } from "@tanstack/react-router";
import icon from "@/assets/music-wallet-icon.png.asset.json";

/** Public site identity shown by TON wallets during connect. */
const SITE = "https://music.megsyai.com";

export const Route = createFileRoute("/api/public/tonconnect-manifest")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(
          JSON.stringify({
            url: SITE,
            name: "MUSIC",
            iconUrl: `${SITE}${icon.url}`,
          }),
          {
            headers: {
              "content-type": "application/json",
              "access-control-allow-origin": "*",
              "cache-control": "public, max-age=300",
            },
          },
        );
      },
    },
  },
});
