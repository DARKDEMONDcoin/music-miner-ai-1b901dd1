import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  AudioWaveform,
  Brain,
  Drum,
  Loader2,
  Orbit,
  Piano,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useGame } from "@/hooks/useGame";
import { GramIcon, CoinIcon, MusicIcon } from "@/components/CoinIcon";
import { StorePanel } from "@/components/StorePanel";
import { openExternal, telegram } from "@/lib/payments";
import {
  INSTRUMENTS,
  MINERS,
  formatCrypto,
  formatNumber,
  gramForCost,
  instrumentRate,
  minerRate,
  ratePerHour,
  rigLevel,
  starsForCost,
  upgradeCost,
} from "@/lib/game";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Studio | Music AI" },
      {
        name: "description",
        content:
          "Upgrade your studio with GRAM or Telegram Stars — every upgrade boosts MUSIC, GRAM and USDT mining at once.",
      },
      { property: "og:title", content: "Studio | Music AI" },
      { property: "og:description", content: "Upgrades and store in one place inside Music AI." },
    ],
  }),
  component: StudioPage,
});

const ICONS: Record<string, LucideIcon> = {
  AudioWaveform,
  SlidersHorizontal,
  Drum,
  Piano,
  Brain,
  Orbit,
};

function StudioPage() {
  const [tab, setTab] = useState<"upgrades" | "store">("upgrades");

  return (
    <div className="space-y-4 pt-4">
      <div className="glass-thin animate-fade-up mx-auto flex w-full max-w-xs rounded-full p-1">
        {(["upgrades", "store"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-2 text-xs capitalize transition-all duration-200 active:scale-95 ${
              tab === t ? "bg-white text-gray-900 shadow-lg" : "text-foreground/60"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "upgrades" ? <UpgradesTab /> : <StorePanel />}
    </div>
  );
}

function UpgradesTab() {
  const { state, upgrade, payWithGram } = useGame();
  const [busy, setBusy] = useState<string | null>(null);

  const gramMiner = MINERS[0]!;
  const usdtMiner = MINERS[1]!;
  const nextState = { ...state, bonusLevels: (state.bonusLevels ?? 0) + 1 };

  const buyWithGram = (id: string, cost: number, name: string) => {
    const price = gramForCost(cost);
    if (!payWithGram(price)) {
      toast.error(`Not enough GRAM — need ${price} GRAM`);
      return;
    }
    upgrade(id);
    toast.success(`${name} upgraded`, { description: "MUSIC, GRAM and USDT mining all went up." });
  };

  const buyWithStars = async (id: string, cost: number, name: string, level: number) => {
    setBusy(`${id}-stars`);
    try {
      const res = await fetch("/api/telegram/invoice", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ itemId: "upgrade", upgradeKind: "instrument", upgradeId: id, level }),
      });
      const data = (await res.json()) as { link?: string; error?: string };
      if (!res.ok || !data.link) {
        toast.error("Stars checkout unavailable", { description: data.error ?? "Try again later." });
        return;
      }
      const tg = telegram();
      if (tg?.openInvoice) {
        tg.openInvoice(data.link, (status) => {
          if (status === "paid") {
            upgrade(id);
            toast.success(`${name} upgraded`, {
              description: "MUSIC, GRAM and USDT mining all went up.",
            });
          } else if (status === "failed") toast.error("Payment failed");
        });
      } else {
        openExternal(data.link);
      }
    } catch {
      toast.error("Could not start the Stars checkout");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="liquid-glass animate-fade-up delay-1 rounded-3xl p-5 text-center">
        <p className="text-[11px] uppercase tracking-widest text-foreground/40">Mining rate</p>
        <p className="mt-1 text-4xl tracking-tight">{formatNumber(ratePerHour(state))}</p>
        <p className="text-xs text-foreground/50">MUSIC / hour · rig level {rigLevel(state)}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
          <span className="glass-thin flex items-center justify-center gap-1.5 rounded-xl py-2">
            <MusicIcon size={14} /> {formatNumber(state.balance)}
          </span>
          <span className="glass-thin flex items-center justify-center gap-1.5 rounded-xl py-2">
            <GramIcon size={14} /> {formatCrypto(state.gram)}
          </span>
          <span className="glass-thin flex items-center justify-center gap-1.5 rounded-xl py-2">
            <CoinIcon id="usdt" size={14} /> {formatCrypto(state.usdt)}
          </span>
        </div>
      </section>

      <section className="liquid-glass animate-fade-up delay-2 rounded-3xl p-4">
        <div className="flex items-center gap-2 text-sm">
          <Sparkles size={16} className="text-blue-400" />
          Every upgrade boosts all three coins
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-foreground/70">
          <div className="glass-thin rounded-xl p-2 text-center">
            <MusicIcon size={16} className="mx-auto" />
            <p className="mt-1">+50% / level</p>
          </div>
          <div className="glass-thin rounded-xl p-2 text-center">
            <GramIcon size={16} className="mx-auto" />
            <p className="mt-1">
              {formatCrypto(minerRate(nextState, gramMiner))}
              /hr next
            </p>
          </div>
          <div className="glass-thin rounded-xl p-2 text-center">
            <CoinIcon id="usdt" size={16} className="mx-auto" />
            <p className="mt-1">
              {formatCrypto(minerRate(nextState, usdtMiner))}
              /hr next
            </p>
          </div>
        </div>
      </section>

      <section className="animate-fade-up delay-3 space-y-2.5">
        <h2 className="px-1 text-xs uppercase tracking-widest text-foreground/40">Upgrades</h2>
        {INSTRUMENTS.map((inst) => {
          const level = state.levels[inst.id] ?? 0;
          const cost = upgradeCost(inst, level);
          const Icon = ICONS[inst.icon] ?? AudioWaveform;
          const price = gramForCost(cost);
          return (
            <div key={inst.id} className="liquid-glass overflow-hidden rounded-3xl">
              <div className="flex items-center gap-3 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/40 to-blue-700/20 ring-1 ring-white/15">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm">{inst.name}</p>
                    <span className="glass-thin shrink-0 rounded-md px-1.5 py-0.5 text-[10px] text-foreground/60">
                      Lv {level}
                    </span>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-foreground/50">
                    <TrendingUp size={11} className="text-blue-400" />
                    {formatNumber(instrumentRate(inst, level))}
                    <span className="text-foreground/30">→</span>
                    <span className="text-foreground/80">
                      {formatNumber(instrumentRate(inst, level + 1))}
                    </span>
                    MUSIC/hr · +GRAM · +USDT
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-2.5">
                <button
                  onClick={() => buyWithGram(inst.id, cost, inst.name)}
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-white py-3 text-xs text-gray-900 transition-transform duration-200 active:scale-95"
                >
                  <GramIcon size={14} /> {price} GRAM
                </button>
                <button
                  disabled={busy === `${inst.id}-stars`}
                  onClick={() => buyWithStars(inst.id, cost, inst.name, level)}
                  className="glass-thin flex items-center justify-center gap-1.5 rounded-2xl py-3 text-xs transition-transform duration-200 active:scale-95 disabled:opacity-50"
                >
                  {busy === `${inst.id}-stars` ? (
                    <Loader2 size={14} className="animate-spin text-blue-400" />
                  ) : (
                    <Star size={14} className="fill-blue-400 text-blue-400" />
                  )}
                  {starsForCost(cost)} Stars
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
