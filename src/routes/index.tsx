import { createFileRoute, Link } from "@tanstack/react-router";
import { Rocket, Sparkles, Zap } from "lucide-react";
import { CoinIcon, MusicIcon } from "@/components/CoinIcon";
import { toast } from "sonner";
import { useGame } from "@/hooks/useGame";
import {
  MINERS,
  activeTrack,
  fillPct,
  formatCrypto,
  formatNumber,
  minerPending,
  minerRate,
  multiplier,
  pending,
  ratePerHour,
  rigLevel,
  storageHours,
} from "@/lib/game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mine | Music AI" },
      {
        name: "description",
        content: "Collect your studio earnings in MUSIC, GRAM and USDT and raise your mining rate.",
      },
      { property: "og:title", content: "Mine | Music AI" },
      { property: "og:description", content: "Mine three coins inside your Telegram studio." },
    ],
  }),
  component: MinePage,
});

function MinePage() {
  const { state, now, collect } = useGame();

  const ready = pending(state, now);
  const fill = fillPct(state, now);
  const rate = ratePerHour(state);
  const track = activeTrack(state);
  const level = rigLevel(state);

  const gramMiner = MINERS[0]!;
  const usdtMiner = MINERS[1]!;

  const onCollect = () => {
    const gained = collect();
    if (gained.music <= 0 && gained.gram <= 0 && gained.usdt <= 0) {
      toast("Nothing to collect yet", { description: "Come back later or upgrade your studio." });
      return;
    }
    const extra = [
      gained.gram > 0 ? `+${formatCrypto(gained.gram)} GRAM` : null,
      gained.usdt > 0 ? `+${formatCrypto(gained.usdt)} USDT` : null,
    ].filter(Boolean);
    toast.success(`+${formatNumber(gained.music)} MUSIC`, {
      description: extra.length ? extra.join("  ·  ") : undefined,
    });
  };

  return (
    <div className="space-y-3">
      {/* Balance */}
      <section className="liquid-glass animate-fade-up delay-1 rounded-3xl p-5 text-center">
        <p className="text-[11px] uppercase tracking-widest text-foreground/40">Balance</p>
        <p className="mt-1 flex items-center justify-center gap-2 text-4xl tracking-tight">
          <MusicIcon size={26} />
          {formatNumber(state.balance)}
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px]">
          <span className="glass-thin flex items-center gap-1.5 rounded-xl px-3 py-1.5">
            <Zap size={12} strokeWidth={2} className="text-blue-400" /> {formatNumber(rate)} / hr
          </span>
          <span className="glass-thin rounded-xl px-3 py-1.5">
            {multiplier(state).toFixed(2)}x boost
          </span>
          <span className="glass-thin rounded-xl px-3 py-1.5">Lv {level}</span>
        </div>
      </section>

      {/* Collect */}
      <section className="liquid-glass animate-fade-up delay-2 rounded-3xl p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-foreground/40">
              Ready to collect
            </p>
            <p className="mt-1 text-3xl tracking-tight">{formatNumber(ready)}</p>
          </div>
          <p className="text-[11px] text-foreground/50">
            {fill.toFixed(0)}% of {storageHours(state)}h
          </p>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-700 transition-[width] duration-700"
            style={{ width: `${fill}%` }}
          />
        </div>

        <button
          onClick={onCollect}
          className="mt-4 w-full rounded-2xl bg-white py-3 text-sm text-gray-900 transition-transform duration-200 hover:scale-[1.02] active:scale-95"
        >
          Collect earnings
        </button>
      </section>

      {/* Crypto balances */}
      <section className="animate-fade-up delay-3 grid grid-cols-2 gap-3">
        {[
          { m: gramMiner, balance: state.gram, pend: minerPending(state, gramMiner, now) },
          { m: usdtMiner, balance: state.usdt, pend: minerPending(state, usdtMiner, now) },
        ].map(({ m, balance, pend }) => (
          <div key={m.id} className="liquid-glass rounded-3xl p-4">
            <div className="flex items-center gap-2">
              <CoinIcon id={m.id} size={22} />
              <span className="text-[11px] text-foreground/60">{m.symbol}</span>
            </div>
            <p className="mt-3 text-xl tracking-tight">{formatCrypto(balance)}</p>
            <p className="mt-1 text-[10px] text-foreground/50">
              {level > 0
                ? `+${formatCrypto(pend)} ready · ${formatCrypto(minerRate(state, m))}/hr`
                : "Upgrade once to start mining"}
            </p>
          </div>
        ))}
      </section>

      {/* Actions */}
      <section className="animate-fade-up delay-4 grid grid-cols-2 gap-3">
        <Link
          to="/studio"
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 py-3 text-sm transition-transform duration-200 hover:scale-[1.02] active:scale-95"
        >
          <Rocket size={15} strokeWidth={2} /> Upgrade
        </Link>
        <Link
          to="/ai"
          className="liquid-glass flex items-center justify-center gap-2 rounded-2xl py-3 text-sm transition-transform duration-200 hover:scale-[1.02] active:scale-95"
        >
          <Sparkles size={15} strokeWidth={2} /> Make a track
        </Link>
      </section>

      {track ? (
        <section className="liquid-glass animate-fade-up delay-5 flex items-center gap-3 rounded-3xl p-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700">
            <Sparkles size={18} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{track.title}</p>
            <p className="text-[11px] text-foreground/60">
              {track.genre} · +{track.bonusPct}% mining bonus
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
