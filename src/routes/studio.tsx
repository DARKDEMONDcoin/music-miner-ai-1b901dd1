import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Loader2, Star, Zap } from "lucide-react";
import { toast } from "sonner";
import { useGame } from "@/hooks/useGame";
import { GramIcon, CoinIcon, MusicIcon } from "@/components/CoinIcon";
import { StorePanel } from "@/components/StorePanel";
import { telegram } from "@/lib/payments";
import { NFTS, SERVERS } from "@/lib/servers";
import {
  MINERS,
  formatCrypto,
  formatNumber,
  minerRate,
  minerUnlocked,
  ratePerHour,
  rigLevel,
} from "@/lib/game";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Servers | Music AI" },
      {
        name: "description",
        content:
          "Rent mining servers and collect NFT cards — both raise the hash power behind MUSIC, GRAM and USDT.",
      },
      { property: "og:title", content: "Servers | Music AI" },
      {
        property: "og:description",
        content: "Mining servers and NFT power cards for your Music AI studio.",
      },
    ],
  }),
  component: StudioPage,
});

function StudioPage() {
  const [tab, setTab] = useState<"servers" | "store">("servers");

  return (
    <div className="space-y-4 pt-4">
      <div className="glass-thin animate-fade-up mx-auto flex w-full max-w-xs rounded-full p-1">
        {(
          [
            ["servers", "Servers & NFT"],
            ["store", "Subscription"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 rounded-full py-2 text-xs transition-all duration-200 active:scale-95 ${
              tab === id ? "bg-white text-gray-900 shadow-lg" : "text-foreground/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "servers" ? <ServersTab /> : <StorePanel />}
    </div>
  );
}

function ServersTab() {
  const { state, addServer, addNft } = useGame();
  const [busy, setBusy] = useState<string | null>(null);

  const power = rigLevel(state);
  const gramMiner = MINERS[0]!;
  const usdtMiner = MINERS[1]!;

  const payStars = async (
    key: string,
    payload: Record<string, unknown>,
    onPaid: () => void,
    label: string,
  ) => {
    setBusy(key);
    try {
      const res = await fetch("/api/telegram/invoice", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
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
            onPaid();
            telegram()?.HapticFeedback?.notificationOccurred?.("success");
            toast.success(`${label} activated`);
          } else if (status === "failed") toast.error("Payment failed");
        });
      } else {
        toast("Open the app inside Telegram to pay with Stars");
      }
    } catch {
      toast.error("Could not start the checkout");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Power summary */}
      <section className="liquid-glass animate-fade-up delay-1 rounded-3xl p-5 text-center">
        <p className="text-[11px] uppercase tracking-widest text-foreground/40">Total hash power</p>
        <p className="mt-1 flex items-center justify-center gap-2 text-4xl tracking-tight">
          <Zap size={22} className="text-amber-300" />
          {power}
        </p>
        <p className="mt-1 text-[11px] text-foreground/50">
          Power is what mines your coins. More power = more of all three.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
          <div className="glass-thin rounded-xl p-2">
            <MusicIcon size={16} className="mx-auto" />
            <p className="mt-1 text-foreground/50">MUSIC/hr</p>
            <p>{formatNumber(ratePerHour(state))}</p>
          </div>
          <div className="glass-thin rounded-xl p-2">
            <GramIcon size={16} className="mx-auto" />
            <p className="mt-1 text-foreground/50">GRAM/hr</p>
            <p>
              {minerUnlocked(state, "gram") ? formatCrypto(minerRate(state, gramMiner)) : "Locked"}
            </p>
          </div>
          <div className="glass-thin rounded-xl p-2">
            <CoinIcon id="usdt" size={16} className="mx-auto" />
            <p className="mt-1 text-foreground/50">USDT/hr</p>
            <p>
              {minerUnlocked(state, "usdt") ? formatCrypto(minerRate(state, usdtMiner)) : "Locked"}
            </p>
          </div>
        </div>
      </section>

      {/* Servers */}
      <div className="animate-fade-up delay-2 space-y-2.5">
        <div className="px-1">
          <h2 className="text-xs uppercase tracking-widest text-foreground/40">Mining servers</h2>
          <p className="mt-1 text-[11px] text-foreground/50">
            Each server you rent adds fixed power to your account. Stack as many as you want.
          </p>
        </div>

        {SERVERS.map((srv) => {
          const owned = state.servers?.[srv.id] ?? 0;
          const Icon = srv.icon;
          const key = `srv-${srv.id}`;
          return (
            <div key={srv.id} className="liquid-glass overflow-hidden rounded-3xl">
              <div className="flex items-center gap-3 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm">{srv.name}</p>
                    {srv.badge ? (
                      <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 text-[10px] text-gray-900">
                        {srv.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[11px] text-foreground/50">{srv.desc}</p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-300">
                    <Zap size={11} /> +{srv.power} power each
                    {owned > 0 ? (
                      <span className="text-foreground/50"> · you own {owned}</span>
                    ) : null}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-2.5">
                <button
                  disabled={Boolean(busy)}
                  onClick={() =>
                    payStars(
                      key,
                      { itemId: "server", serverId: srv.id },
                      () => addServer(srv.id),
                      srv.name,
                    )
                  }
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-white py-3 text-xs text-gray-900 transition-transform duration-200 active:scale-95 disabled:opacity-50"
                >
                  {busy === key ? (
                    <Loader2 size={14} className="animate-spin text-blue-600" />
                  ) : (
                    <Star size={14} className="fill-blue-500 text-blue-500" />
                  )}
                  {srv.stars} Stars
                </button>
                <button
                  disabled={Boolean(busy)}
                  onClick={() =>
                    toast("Pay with GRAM", {
                      description: `Send ${srv.gram} GRAM from the Subscription tab checkout.`,
                    })
                  }
                  className="glass-thin flex items-center justify-center gap-1.5 rounded-2xl py-3 text-xs transition-transform duration-200 active:scale-95 disabled:opacity-50"
                >
                  <GramIcon size={14} /> {srv.gram} GRAM
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* NFT cards */}
      <div className="animate-fade-up delay-3 space-y-2.5">
        <div className="px-1 pt-1">
          <h2 className="text-xs uppercase tracking-widest text-foreground/40">NFT power cards</h2>
          <p className="mt-1 text-[11px] text-foreground/50">
            One-time collectibles. They multiply everything you mine, permanently.
          </p>
        </div>

        {NFTS.map((nft) => {
          const owned = (state.nfts ?? []).includes(nft.id);
          const Icon = nft.icon;
          const key = `nft-${nft.id}`;
          return (
            <div key={nft.id} className="liquid-glass overflow-hidden rounded-3xl">
              <div className={`flex items-center gap-3 bg-gradient-to-r p-4 ${nft.tone}`}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{nft.name}</p>
                  <p className="mt-0.5 text-[11px] text-foreground/60">{nft.desc}</p>
                  <p className="mt-1 text-[11px] text-amber-200">
                    x{nft.multiplier} on every coin · +{nft.power} power
                  </p>
                </div>
              </div>
              <div className="p-2.5">
                {owned ? (
                  <p className="flex items-center justify-center gap-1.5 rounded-2xl bg-white/10 py-3 text-xs text-foreground/70">
                    <Check size={13} /> Owned — boost is active
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={Boolean(busy)}
                      onClick={() =>
                        payStars(key, { itemId: "nft", nftId: nft.id }, () => addNft(nft.id), nft.name)
                      }
                      className="flex items-center justify-center gap-1.5 rounded-2xl bg-white py-3 text-xs text-gray-900 transition-transform duration-200 active:scale-95 disabled:opacity-50"
                    >
                      {busy === key ? (
                        <Loader2 size={14} className="animate-spin text-blue-600" />
                      ) : (
                        <Star size={14} className="fill-blue-500 text-blue-500" />
                      )}
                      {nft.stars} Stars
                    </button>
                    <button
                      disabled={Boolean(busy)}
                      onClick={() =>
                        toast("Pay with GRAM", {
                          description: `Send ${nft.gram} GRAM from the Subscription tab checkout.`,
                        })
                      }
                      className="glass-thin flex items-center justify-center gap-1.5 rounded-2xl py-3 text-xs transition-transform duration-200 active:scale-95 disabled:opacity-50"
                    >
                      <GramIcon size={14} /> {nft.gram} GRAM
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
