import backgroundAsset from "@/assets/music-background.jpg.asset.json";

/**
 * Telegram's Android webview can promote a remote <video> to its native media
 * viewer while the SPA changes routes. A still from the same brand footage
 * keeps the visual identity without exposing any playable media element.
 */

export function BoomerangVideoBg() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background">
      <div className="bg-bloom bg-bloom-a" />
      <div className="bg-bloom bg-bloom-b" />
      <img
        className="background-still absolute inset-0 h-full w-full object-cover opacity-45"
        src={backgroundAsset.url}
        alt=""
        decoding="async"
        fetchPriority="high"
        draggable={false}
        aria-hidden="true"
      />
    </div>
  );
}
