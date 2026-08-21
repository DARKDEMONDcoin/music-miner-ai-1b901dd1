import { useEffect, useRef, useState } from "react";
import backgroundAsset from "@/assets/music-background.jpg.asset.json";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260611_183632_c311af08-e4b7-458f-81e7-79847a49b3d3.mp4";

const MAX_W = 960;
const FPS = 30;

/**
 * Captures every frame of the source clip into off-screen canvases, then drops
 * the <video> element entirely and ping-pongs the frames on a <canvas>.
 * No media element survives in the DOM, so Telegram's webview can never promote
 * the background into its native player during route changes.
 */
export function BoomerangVideoBg() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduced) return;

    let cancelled = false;
    let raf = 0;
    let timer = 0;
    const frames: HTMLCanvasElement[] = [];

    const video = document.createElement("video");
    videoRef.current = video;
    video.src = VIDEO_SRC;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.playsInline = true;
    video.preload = "auto";

    let w = 0;
    let h = 0;

    const grab = () => {
      if (cancelled || video.videoWidth === 0) return;
      if (!w) {
        const scale = Math.min(1, MAX_W / video.videoWidth);
        w = Math.round(video.videoWidth * scale);
        h = Math.round(video.videoHeight * scale);
      }
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      c.getContext("2d")?.drawImage(video, 0, 0, w, h);
      frames.push(c);
    };

    type RVFC = HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
    };
    const rvfc = (video as RVFC).requestVideoFrameCallback?.bind(video);

    const pump = () => {
      if (cancelled || video.ended) return;
      grab();
      if (rvfc) rvfc(pump);
      else raf = requestAnimationFrame(pump);
    };

    const onPlay = () => pump();

    const startLoop = () => {
      if (cancelled || frames.length < 2) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      canvas.width = w;
      canvas.height = h;
      setReady(true);

      let i = 0;
      let dir = 1;
      const step = () => {
        if (cancelled) return;
        const frame = frames[i];
        if (frame) ctx.drawImage(frame, 0, 0);
        i += dir;
        if (i >= frames.length - 1) {
          i = frames.length - 1;
          dir = -1;
        } else if (i <= 0) {
          i = 0;
          dir = 1;
        }
        timer = window.setTimeout(step, 1000 / FPS);
      };
      step();
    };

    const onEnded = () => {
      grab();
      startLoop();
    };

    video.addEventListener("playing", onPlay);
    video.addEventListener("ended", onEnded);
    void video.play().catch(() => {
      /* autoplay blocked: keep the still image */
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      video.removeEventListener("playing", onPlay);
      video.removeEventListener("ended", onEnded);
      video.pause();
      video.removeAttribute("src");
      video.load();
      frames.length = 0;
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background">
      <div className="absolute inset-0 origin-center scale-[1.08] overflow-hidden">
        <img
          className="background-still absolute inset-0 h-full w-full object-cover"
          src={backgroundAsset.url}
          alt=""
          decoding="async"
          fetchPriority="high"
          draggable={false}
          aria-hidden="true"
          style={{ opacity: ready ? 0 : 1, transition: "opacity 600ms ease" }}
        />
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: ready ? 1 : 0, transition: "opacity 600ms ease" }}
        />
      </div>
    </div>
  );
}
