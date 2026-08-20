import { useState } from "react";
import { Check, Loader2, Star, Zap } from "lucide-react";
import { toast } from "sonner";
import { useGame } from "@/hooks/useGame";
import { useGramPay } from "@/hooks/useGramPay";
import { GramIcon } from "@/components/CoinIcon";
import { activePlan, formatDuration } from "@/lib/game";
import { PLANS, type Plan } from "@/lib/plans";
import { telegram } from "@/lib/payments";

export function StorePanel() {
  const { state, activateSubscription } = useGame();
  const { pay, pending } = useGramPay();
  const [busy, setBusy] = useState<string | null>(null);

  const current = activePlan(state);
  const leftMs = Math.max(0, state.planUntil - Date.now());
  const daysLeft = Math.ceil(leftMs / 86_400_000);

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
            toast.success(`${plan.name} is active for 30 days`);
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
      <section className="liquid-glass animate-fade-up delay-1 rounded-3xl p-5 text-center">
        {current ? (
          <>
            <p className="text-base tracking-tight">{current.name} plan is active</p>
            <p className="mt-1 text-[11px] text-foreground/50">
              {daysLeft} day{daysLeft === 1 ? "" : "s"} left · renews only when you buy again
            </p>
          </>
        ) : (
          <>
            <p className="text-base tracking-tight">Choose a monthly plan</p>
            <p className="mt-1 text-[11px] text-foreground/50">
              A plan is the only way to unlock GRAM and USDT mining. Billed once for 30 days — no
              auto-renew.
            </p>
          </>
        )}
      </section>

      {PLANS.map((plan, i) => {
        const Icon = plan.icon;
        const active = current?.id === plan.id;
        const starsBusy = busy === `${plan.id}-stars`;
        const gramBusy = pending === `plan-${plan.id}`;
        return (
          <section
            key={plan.id}
            className={`liquid-glass animate-fade-up overflow-hidden rounded-3xl delay-${i + 2} ${
              plan.highlight ? "ring-1 ring-white/40" : ""
            }`}
          >
            <div className="flex items-start gap-3 p-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  plan.highlight ? "bg-white text-gray-900" : "bg-white/10"
                }`}
              >
                <Icon size={20} strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-base tracking-tight">{plan.name}</p>
                  {plan.badge ? (
                    <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 text-[10px] text-gray-900">
                      {plan.badge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-[11px] text-foreground/50">{plan.tagline}</p>
                <p className="mt-1 text-[11px] text-foreground/40">
                  {plan.stars} Stars / month · {plan.gram} GRAM / month
                </p>
              </div>
            </div>

            <ul className="space-y-1.5 px-4 pb-3 text-[11px] text-foreground/70">
              <li className="flex items-center gap-2">
                <Check size={12} className="shrink-0 text-emerald-400" />x{plan.multiplier} on every
                coin you mine
              </li>
              <li className="flex items-center gap-2">
                <Zap size={12} className="shrink-0 text-amber-300" />+{plan.power} hash power while
                active
              </li>
              <li className="flex items-center gap-2">
                <Check size={12} className="shrink-0 text-emerald-400" />
                Unlocks {plan.unlocks.map((u) => u.toUpperCase()).join(" + ")} mining
              </li>
              <li className="flex items-center gap-2">
                <Check size={12} className="shrink-0 text-emerald-400" />
                {plan.storageHours}h mining cycle · {plan.aiTracks} AI songs a day
              </li>
            </ul>

            {active ? (
              <p className="m-2.5 flex items-center justify-center gap-1.5 rounded-2xl bg-white/10 py-3 text-xs text-foreground/70">
                <Check size={13} /> Active — {formatDuration(leftMs)} remaining
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
                  {gramBusy ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <GramIcon size={14} />
                  )}
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

      <p className="px-2 pb-2 text-center text-[11px] text-foreground/40">
        Plans are one-off 30-day passes. Servers and NFT cards in the Servers tab stack on top of
        your plan.
      </p>
    </div>
  );
}
