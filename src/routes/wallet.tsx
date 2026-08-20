import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { ArrowDownLeft, ArrowUpRight, Lock, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useGame } from "@/hooks/useGame";
import { CoinIcon, MusicIcon } from "@/components/CoinIcon";
import { MINERS, formatCrypto, formatNumber, minerRate, minerUnlocked } from "@/lib/game";
import { makeMemo, openExternal, tonkeeperLink } from "@/lib/payments";
import { usePrices, usd } from "@/hooks/usePrices";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet | Music AI" },
      {
        name: "description",
        content: "Connect your TON wallet automatically, track MUSIC, GRAM and USDT and withdraw.",
      },
      { property: "og:title", content: "Wallet | Music AI" },
      { property: "og:description", content: "Connect a TON wallet and withdraw your mining." },
    ],
  }),
  component: WalletPage,
});

const TonWallet = lazy(() => import("@/components/TonWallet"));

function short(a: string) {
  return `${a.slice(0, 4)}…${a.slice(-4)}`;
}

function WalletPage() {
  const { state, disconnectWallet, withdraw } = useGame();
  const { prices, error: priceError } = usePrices();

  const connected = Boolean(state.walletAddress);

  const deposit = () => {
    openExternal(tonkeeperLink(1, makeMemo("coins")));
    toast("Deposit opened", { description: "Send GRAM from your wallet app." });
  };

  const onWithdraw = () => {
    if (!connected) {
      toast.error("Connect your TON wallet first");
      return;
    }
    const ready = MINERS.filter((m) => (m.id === "gram" ? state.gram : state.usdt) >= m.minWithdraw);
    if (ready.length === 0) {
      toast.error("Nothing to withdraw yet", {
        description: `Minimum ${MINERS[0]!.minWithdraw} GRAM or ${MINERS[1]!.minWithdraw} USDT.`,
      });
      return;
    }
    const sent = ready.filter((m) => withdraw(m.id)).map((m) => m.symbol);
    toast.success(`Withdrawal requested — ${sent.join(" + ")}`, {
      description: `Sent to ${short(state.walletAddress!)}`,
    });
  };

  return (
    <div className="space-y-5">
      <section className="animate-fade-up flex flex-col items-center pt-2 text-center">
        <MusicIcon size={56} />
        <p className="mt-3 text-5xl tracking-tight">{formatNumber(state.balance)}</p>
        <p className="mt-1 text-sm text-foreground/50">MUSIC</p>

        {connected ? (
          <button
            onClick={() => {
              disconnectWallet();
              toast("Wallet disconnected");
            }}
            className="glass-thin mt-3 flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] text-foreground/70"
          >
            {short(state.walletAddress!)} <LogOut size={12} strokeWidth={2} />
          </button>
        ) : null}

        <div className="mt-5 grid w-full grid-cols-2 gap-2">
          <button
            onClick={deposit}
            className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm text-gray-900 transition-transform duration-200 active:scale-95"
          >
            <ArrowDownLeft size={16} strokeWidth={2} /> Deposit
          </button>
          <button
            onClick={onWithdraw}
            className="glass-thin flex items-center justify-center gap-2 rounded-2xl py-3 text-sm transition-transform duration-200 active:scale-95"
          >
            <ArrowUpRight size={16} strokeWidth={2} /> Withdraw
          </button>
        </div>
      </section>

      <section className="animate-fade-up delay-1 grid grid-cols-2 gap-2">
        {(["gram", "usdt"] as const).map((id) => {
          const p = prices?.[id];
          const up = (p?.change24h ?? 0) >= 0;
          return (
            <div key={id} className="liquid-glass flex items-center gap-2 rounded-2xl p-3">
              <CoinIcon id={id} size={26} />
              <div className="min-w-0">
                <p className="text-[11px] text-foreground/50">{id.toUpperCase()} price</p>
                <p className="text-sm tracking-tight">
                  {p ? usd(1, p.usd) : priceError ? "—" : "…"}
                </p>
              </div>
              {p ? (
                <span
                  className={`ml-auto text-[10px] ${up ? "text-emerald-400" : "text-red-400"}`}
                >
                  {up ? "+" : ""}
                  {p.change24h.toFixed(1)}%
                </span>
              ) : null}
            </div>
          );
        })}
      </section>

      {!connected && (
        <section className="animate-fade-up delay-1">
          <ClientOnly fallback={<div className="h-12" aria-hidden />}>
            <Suspense fallback={<div className="h-12" aria-hidden />}>
              <TonWallet />
            </Suspense>
          </ClientOnly>
          <p className="mt-2 text-center text-[11px] text-foreground/45">
            Your wallet connects automatically through TON Connect.
          </p>
        </section>
      )}

      <section className="animate-fade-up delay-2 space-y-2">
        <div className="liquid-glass flex items-center gap-3 rounded-2xl p-4">
          <MusicIcon size={40} />
          <div className="min-w-0 flex-1">
            <p className="text-sm">MUSIC</p>
            <p className="text-[11px] text-foreground/50">Our in-app coin</p>
          </div>
          <p className="text-base tracking-tight">{formatNumber(state.balance)}</p>
        </div>

        {MINERS.map((m) => {
          const balance = m.id === "gram" ? state.gram : state.usdt;
          const unlocked = minerUnlocked(state, m.id);
          return (
            <div key={m.id} className="liquid-glass flex items-center gap-3 rounded-2xl p-4">
              <CoinIcon id={m.id} size={40} />
              <div className="min-w-0 flex-1">
                <p className="text-sm">{m.symbol}</p>
                <p className="flex items-center gap-1 text-[11px] text-foreground/50">
                  {unlocked ? (
                    `${formatCrypto(minerRate(state, m))} ${m.symbol} / hr`
                  ) : (
                    <>
                      <Lock size={10} /> Unlocks with a paid rig
                    </>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-base tracking-tight">{formatCrypto(balance)}</p>
                <p className="text-[10px] text-foreground/40">
                  {usd(balance, prices?.[m.id]?.usd) ?? `min ${m.minWithdraw} ${m.symbol}`}
                </p>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
