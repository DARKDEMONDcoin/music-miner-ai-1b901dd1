import type { LucideIcon } from "lucide-react";
import { Cpu, Server, HardDrive, Sparkles, Gem, Crown } from "lucide-react";

/** A rented mining server. Power adds directly to your rig level. */
export type ServerDef = {
  id: string;
  name: string;
  desc: string;
  power: number; // rig levels added per unit
  stars: number; // Telegram Stars per unit
  gram: number; // GRAM per unit
  icon: LucideIcon;
  badge?: string;
};

export const SERVERS: ServerDef[] = [
  {
    id: "starter-node",
    name: "Starter Node",
    desc: "A small shared node. The cheapest way to start mining.",
    power: 2,
    stars: 120,
    gram: 0.6,
    icon: HardDrive,
  },
  {
    id: "turbo-rack",
    name: "Turbo Rack",
    desc: "A dedicated rack with four times the hash power of a node.",
    power: 8,
    stars: 420,
    gram: 2.1,
    icon: Server,
    badge: "Popular",
  },
  {
    id: "quantum-cluster",
    name: "Quantum Cluster",
    desc: "Top-tier cluster for serious miners. Best power per Star.",
    power: 25,
    stars: 1100,
    gram: 5.4,
    icon: Cpu,
    badge: "Best power",
  },
];

/** A collectible NFT card. Owning it multiplies everything you mine, forever. */
export type NftDef = {
  id: string;
  name: string;
  desc: string;
  multiplier: number; // multiplies all mining
  power: number; // extra rig levels
  stars: number;
  gram: number;
  icon: LucideIcon;
  tone: string; // tailwind gradient classes
};

export const NFTS: NftDef[] = [
  {
    id: "vinyl-nft",
    name: "Golden Vinyl",
    desc: "Common card. A permanent lift on every coin you mine.",
    multiplier: 1.25,
    power: 3,
    stars: 350,
    gram: 1.7,
    icon: Sparkles,
    tone: "from-amber-500/30 to-amber-200/10",
  },
  {
    id: "crystal-nft",
    name: "Crystal Mic",
    desc: "Rare card. Big multiplier plus extra hash power.",
    multiplier: 1.6,
    power: 8,
    stars: 900,
    gram: 4.4,
    icon: Gem,
    tone: "from-sky-500/30 to-cyan-200/10",
  },
  {
    id: "crown-nft",
    name: "Platinum Crown",
    desc: "Legendary card. The strongest permanent boost in the game.",
    multiplier: 2.2,
    power: 18,
    stars: 2200,
    gram: 10.8,
    icon: Crown,
    tone: "from-fuchsia-500/30 to-violet-300/10",
  },
];

export function serverById(id: string) {
  return SERVERS.find((s) => s.id === id) ?? null;
}

export function nftById(id: string) {
  return NFTS.find((n) => n.id === id) ?? null;
}
