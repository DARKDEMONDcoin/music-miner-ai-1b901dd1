import { useState } from "react";
import { Check, Clock, Infinity as InfinityIcon, Loader2, Sparkles, Star, Zap } from "lucide-react";
import { toast } from "sonner";
import { useGame } from "@/hooks/useGame";
import { useGramPay } from "@/hooks/useGramPay";
import { CoinIcon, GramIcon, MusicIcon } from "@/components/CoinIcon";
import { activePlan } from "@/lib/game";
import { PLANS, type Plan } from "@/lib/plans";
import { telegram } from "@/lib/payments";

export function StorePanel() {
  const { state, activateSubscription } = useGame();
  const { pay, pending } = useGramPay();
  const [busy, setBusy] = useState<string | null>(null);

  const current = activePlan(state);

  const payStars = async (plan: Plan) => {
    const key = `${plan.id}-stars`;
    setBusy(key);
    try {
      const res = await fetch("/api/telegram/invoice", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ itemId: "plan", planId: plan.id }),
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
            activateSubscription(plan.id);
            telegram()?.HapticFeedback?.notificationOccurred?.("success");
            toast.success(`${plan.name} unlocked forever`);
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
      <section className="animate-fade-up delay-1 px-1 text-center">
        <p className="text-lg tracking-tight">
          {current ? `${current.name} is yours forever` : "One payment. Yours forever."}
        </p>
        <p className="mx-auto mt-1 max-w-[19rem] text-[11px] leading-relaxed text-foreground/45">
          {current
            ? "Your plan never expires and never renews. Upgrade any time to a higher tier."
            : "A plan permanently unlocks crypto mining and multiplies every coin you earn. No renewals, no monthly fees."}
        </p>
      </section>

      {PLANS.map((plan, i) => {
        const active = current?.id === plan.id;
        const starsBusy = busy === `${plan.id}-stars`;
        const gramBusy = pending === `plan-${plan.id}`;
        return (
          <section
            key={plan.id}
            className={`liquid-glass animate-fade-up overflow-hidden rounded-3xl delay-${Math.min(i + 2, 5)} ${
              plan.highlight ? "ring-1 ring-white/35" : ""
            }`}
          >
            <div className="flex items-center justify-between px-4 pt-4">
              <div className="min-w-0">
                <p className="text-base tracking-tight">{plan.name}</p>
                <p className="mt-0.5 text-[11px] text-foreground/45">{plan.tagline}</p>
              </div>
              {plan.badge ? (
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] text-gray-900">
                  {plan.badge}
                </span>
              ) : null}
            </div>

            {/* Which coins this plan mines */}
            <div className="mt-3 flex items-center gap-2 px-4">
              <span className="glass-thin flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px]">
                <MusicIcon size={13} /> MUSIC
              </span>
              {(["gram", "usdt"] as const).map((c) => (
                <span
                  key={c}
                  className={`glass-thin flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] ${
                    plan.unlocks.includes(c) ? "" : "opacity-30"
                  }`}
                >
                  <CoinIcon id={c} size={13} /> {c.toUpperCase()}
                </span>
              ))}
            </div>

            <ul className="mt-3 space-y-1.5 px-4 pb-3 text-[11px] text-foreground/70">
              <li className="flex items-center gap-2">
                <Zap size={12} className="shrink-0 text-amber-300" />x{plan.multiplier} on every coin
                you mine
              </li>
              <li className="flex items-center gap-2">
                <Check size={12} className="shrink-0 text-emerald-400" />+{plan.power} permanent hash
                power
              </li>
              <li className="flex items-center gap-2">
                <Clock size={12} className="shrink-0 text-sky-300" />
                {plan.storageHours}h mining cycle
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={12} className="shrink-0 text-fuchsia-300" />
                {plan.aiTracks} AI songs a day
              </li>
              <li className="flex items-center gap-2">
                <InfinityIcon size={12} className="shrink-0 text-emerald-400" />
                Lifetime access — pay once
              </li>
            </ul>

            {active ? (
              <p className="m-2.5 flex items-center justify-center gap-1.5 rounded-2xl bg-white/10 py-3 text-xs text-foreground/70">
                <Check size={13} /> Active forever
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-2.5">
                <button
                  disabled={Boolean(busy) || Boolean(pending)}
                  onClick={() => payStars(plan)}
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-white py-3 text-xs text-gray-900 transition-transform duration-200 active:scale-95 disabled:opacity-50"
                >
                  {starsBusy ? (
                    <Loader2 size={14} className="animate-spin text-blue-600" />
                  ) : (
                    <Star size={14} className="fill-blue-500 text-blue-500" />
                  )}
                  {plan.stars} Stars
                </button>
                <button
                  disabled={Boolean(busy) || Boolean(pending)}
                  onClick={() =>
                    pay(`plan-${plan.id}`, plan.gram, plan.name, () => activateSubscription(plan.id))
                  }
                  className="glass-thin flex items-center justify-center gap-1.5 rounded-2xl py-3 text-xs transition-transform duration-200 active:scale-95 disabled:opacity-50"
                >
                  {gramBusy ? <Loader2 size={14} className="animate-spin" /> : <GramIcon size={14} />}
                  {plan.gram} GRAM
                </button>
              </div>
            )}
            {gramBusy ? (
              <p className="px-4 pb-3 text-[10px] text-foreground/60">
                Checking the blockchain for your transfer…
              </p>
            ) : null}
          </section>
        );
      })}

      <p className="px-4 pb-2 text-center text-[11px] leading-relaxed text-foreground/40">
        Music NFTs stack on top of your plan and add even more power.
      </p>
    </div>
  );
}
