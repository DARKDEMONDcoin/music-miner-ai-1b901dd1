import type { LucideIcon } from "lucide-react";
import { Crown, Rocket, Zap } from "lucide-react";

export type PlanId = "starter" | "pro" | "elite";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  multiplier: number; // multiplies every coin you mine
  power: number; // rig levels granted while the plan is active
  aiTracks: number; // AI generations per day
  storageHours: number; // mining cycle length
  unlocks: ("gram" | "usdt")[];
  stars: number; // Telegram Stars per month
  gram: number; // GRAM per month
  icon: LucideIcon;
  highlight?: boolean;
  badge?: string;
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Turn on real crypto mining",
    multiplier: 2,
    power: 3,
    aiTracks: 3,
    storageHours: 12,
    unlocks: ["gram"],
    stars: 250,
    gram: 1.2,
    icon: Zap,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Both coins, triple output",
    multiplier: 3,
    power: 10,
    aiTracks: 10,
    storageHours: 24,
    unlocks: ["gram", "usdt"],
    stars: 650,
    gram: 3.2,
    icon: Rocket,
    highlight: true,
    badge: "Most popular",
  },
  {
    id: "elite",
    name: "Elite",
    tagline: "Maximum mining power",
    multiplier: 5,
    power: 30,
    aiTracks: 30,
    storageHours: 48,
    unlocks: ["gram", "usdt"],
    stars: 1500,
    gram: 7.4,
    icon: Crown,
    badge: "Best value",
  },
];

export function planById(id: string | null | undefined) {
  return PLANS.find((p) => p.id === id) ?? null;
}
