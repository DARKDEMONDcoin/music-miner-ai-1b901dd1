/**
 * Ambient app background: the looping brand video, plus two slow CSS blooms
 * underneath so there is still colour while the video buffers.
 *
 * The old canvas frame-capture boomerang was what stuttered navigation, so the
 * video is played natively (muted, looping) which the browser handles on the
 * GPU for free.
 */
const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260611_183632_c311af08-e4b7-458f-81e7-79847a49b3d3.mp4";

export function BoomerangVideoBg() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background">
      <div className="bg-bloom bg-bloom-a" />
      <div className="bg-bloom bg-bloom-b" />
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-45"
        src={VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/45 via-background/60 to-background/85" />
    </div>
  );
}
