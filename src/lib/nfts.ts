import type { Composition } from "@/lib/synth";

export type MinerKey = "gram" | "usdt";

/**
 * A Music NFT. Every NFT is a real, playable track that also runs as a mining
 * rig: it raises hash power, multiplies output and can unlock crypto miners.
 */
export type NftDef = {
  id: string;
  name: string;
  artist: string;
  desc: string;
  multiplier: number; // permanent multiplier on everything you mine
  power: number; // permanent hash power
  unlocks: MinerKey[]; // crypto miners this NFT switches on forever
  stars: number; // Telegram Stars price (0 = not for sale)
  gram: number; // GRAM price (0 = not for sale)
  tone: string; // tailwind gradient for the disc label
  rarity: "Free" | "Rare" | "Epic" | "Legendary";
  /** Reward-only cards are never listed for sale. */
  reward?: "welcome" | "referral";
  track: Composition;
};

function song(
  title: string,
  genre: string,
  mood: string,
  bpm: number,
  chords: string[],
  melody: number[],
): Composition {
  return { title, genre, mood, bpm, key: chords[0] ?? "Am", chords, melody, description: genre };
}

export const NFTS: NftDef[] = [
  {
    id: "welcome-nft",
    name: "First Press",
    artist: "Music AI",
    desc: "Your free welcome record. It keeps a small rig running from day one.",
    multiplier: 1.1,
    power: 1,
    unlocks: [],
    stars: 0,
    gram: 0,
    tone: "from-zinc-300/40 to-zinc-500/10",
    rarity: "Free",
    reward: "welcome",
    track: song("First Press", "Lo-fi", "Warm", 84, ["Am", "F", "C", "G"], [69, 72, 71, 69, 67, 69, 0, 64]),
  },
  {
    id: "friends-nft",
    name: "Friends Gold",
    artist: "Music AI",
    desc: "Given free when 5 friends join. Switches on GRAM and USDT mining forever.",
    multiplier: 1.35,
    power: 5,
    unlocks: ["gram", "usdt"],
    stars: 0,
    gram: 0,
    tone: "from-amber-300/50 to-amber-600/10",
    rarity: "Rare",
    reward: "referral",
    track: song("Friends Gold", "Disco", "Bright", 112, ["C", "Am", "F", "G"], [72, 76, 79, 76, 74, 72, 71, 72]),
  },
  {
    id: "crystal-nft",
    name: "Crystal Mic",
    artist: "Neon Atlas",
    desc: "Epic record. Strong multiplier, extra power and GRAM mining unlocked.",
    multiplier: 1.7,
    power: 10,
    unlocks: ["gram"],
    stars: 900,
    gram: 4.4,
    tone: "from-sky-400/50 to-cyan-500/10",
    rarity: "Epic",
    track: song("Crystal Mic", "Synthwave", "Cold", 98, ["Em", "C", "G", "D"], [76, 79, 83, 79, 78, 76, 74, 71]),
  },
  {
    id: "crown-nft",
    name: "Platinum Crown",
    artist: "Vega Prime",
    desc: "Legendary record. The strongest rig in the game, both coins unlocked.",
    multiplier: 2.4,
    power: 24,
    unlocks: ["gram", "usdt"],
    stars: 2200,
    gram: 10.8,
    tone: "from-fuchsia-400/50 to-violet-600/10",
    rarity: "Legendary",
    track: song("Platinum Crown", "Cinematic", "Epic", 128, ["Dm", "Bb", "F", "C"], [74, 77, 81, 84, 81, 77, 74, 69]),
  },
];

export function nftById(id: string) {
  return NFTS.find((n) => n.id === id) ?? null;
}

/** NFTs the user can actually buy. */
export const SHOP_NFTS = NFTS.filter((n) => !n.reward);
