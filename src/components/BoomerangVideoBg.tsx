/**
 * Ambient app background.
 *
 * Deliberately GPU-cheap: two slow CSS gradient blooms instead of a decoded
 * video + per-frame canvas blitting, which used to stutter navigation on
 * mid-range phones inside Telegram.
 */
export function BoomerangVideoBg() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background">
      <div className="bg-bloom bg-bloom-a" />
      <div className="bg-bloom bg-bloom-b" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/55 to-background/80" />
    </div>
  );
}
