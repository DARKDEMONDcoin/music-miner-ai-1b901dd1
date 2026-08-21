import { useEffect, useState } from "react";
import stillAsset from "@/assets/music-background.jpg.asset.json";
import loopAsset from "@/assets/bg-loop.webp.asset.json";

/**
 * Boomerang background without any media element: the source clip was baked
 * into a silent, looping (forward + reverse) animated WebP served from our own
 * CDN. Telegram's webview can never promote it to a native player, there is no
 * audio track, no CORS work and no per-frame JavaScript — the compositor does
 * everything, so navigation stays smooth.
 */
export function BoomerangVideoBg() {
  const [loopReady, setLoopReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;
    let alive = true;
    const img = new Image();
    img.decoding = "async";
    img.src = loopAsset.url;
    const show = () => alive && setLoopReady(true);
    img.decode?.().then(show).catch(show);
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background">
      <div className="absolute inset-0 origin-center scale-[1.08] overflow-hidden">
        <img
          className="background-still absolute inset-0 h-full w-full object-cover"
          src={stillAsset.url}
          alt=""
          decoding="async"
          fetchPriority="high"
          draggable={false}
          aria-hidden="true"
        />
        {loopReady ? (
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src={loopAsset.url}
            alt=""
            draggable={false}
            aria-hidden="true"
            style={{ animation: "bg-fade-in 700ms ease forwards" }}
          />
        ) : null}
      </div>
    </div>
  );
}
