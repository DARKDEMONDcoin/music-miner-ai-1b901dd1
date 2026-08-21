export type PlanId = "starter" | "pro" | "elite";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  multiplier: number; // multiplies every coin you mine
  power: number; // hash power granted forever
  aiTracks: number; // AI generations per day
  storageHours: number; // mining cycle length
  unlocks: ("gram" | "usdt")[];
  stars: number; // one-time Telegram Stars price
  gram: number; // one-time GRAM price
  highlight?: boolean;
  badge?: string;
};

/** One-time purchases. Every plan is a lifetime unlock — never a renewal. */
export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Switch on real GRAM mining",
    multiplier: 2,
    power: 3,
    aiTracks: 3,
    storageHours: 12,
    unlocks: ["gram"],
    stars: 250,
    gram: 1.2,
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
    badge: "Best value",
  },
];

export function planById(id: string | null | undefined) {
  return PLANS.find((p) => p.id === id) ?? null;
}
