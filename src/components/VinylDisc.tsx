import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { TrackPlayer, type Composition } from "@/lib/synth";

type Props = {
  track: Composition;
  tone: string;
  size?: number;
  label?: string;
};

/** A spinning record with a clean play control. Spins only while playing. */
export function VinylDisc({ track, tone, size = 132, label }: Props) {
  const [playing, setPlaying] = useState(false);
  const player = useRef<TrackPlayer | null>(null);

  useEffect(() => () => player.current?.stop(), []);

  const toggle = async () => {
    if (playing) {
      player.current?.stop();
      setPlaying(false);
      return;
    }
    player.current ??= new TrackPlayer();
    setPlaying(true);
    try {
      await player.current.play(track, () => setPlaying(false));
    } catch {
      setPlaying(false);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
      className="group relative shrink-0 rounded-full transition-transform duration-200 active:scale-95"
      style={{ width: size, height: size }}
    >
      <span
        className={`absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_0,rgba(0,0,0,0.9)_58%,rgba(0,0,0,0.75)_100%)] shadow-[0_16px_40px_-18px_rgba(0,0,0,0.9)] ${
          playing ? "animate-spin-vinyl" : ""
        }`}
      >
        <span className="absolute inset-[8%] rounded-full border border-white/10" />
        <span className="absolute inset-[18%] rounded-full border border-white/10" />
        <span className="absolute inset-[28%] rounded-full border border-white/10" />
        <span
          className={`absolute inset-[34%] rounded-full bg-gradient-to-br ${tone} ring-1 ring-white/20`}
        />
        <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background" />
      </span>

      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg backdrop-blur transition-transform duration-200 group-hover:scale-105">
          {playing ? (
            <Pause size={17} strokeWidth={2.2} className="fill-gray-900" />
          ) : (
            <Play size={17} strokeWidth={2.2} className="ml-0.5 fill-gray-900" />
          )}
        </span>
      </span>

      {label ? (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-foreground/45">
          {label}
        </span>
      ) : null}
    </button>
  );
}
