import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { makeMemo, openExternal, telegram, tonkeeperLink } from "@/lib/payments";
import { verifyTonPayment } from "@/lib/ton.functions";

/**
 * Opens a GRAM transfer in the user's wallet and polls the chain until the
 * transfer with our memo shows up, then runs `onPaid`.
 */
export function useGramPay() {
  const verify = useServerFn(verifyTonPayment);
  const [pending, setPending] = useState<string | null>(null);
  const cancelled = useRef(false);

  const pay = async (key: string, amount: number, label: string, onPaid: () => void) => {
    const memo = makeMemo("coins");
    openExternal(tonkeeperLink(amount, memo));
    setPending(key);
    cancelled.current = false;
    toast("Waiting for your GRAM transfer", {
      description: `Send ${amount} GRAM with comment ${memo}`,
    });

    for (let i = 0; i < 40; i++) {
      if (cancelled.current) break;
      await new Promise((r) => setTimeout(r, 6000));
      try {
        const res = await verify({ data: { memo, minTon: amount } });
        if (res.paid) {
          setPending(null);
          onPaid();
          telegram()?.HapticFeedback?.notificationOccurred?.("success");
          toast.success(`${label} activated`);
          return;
        }
      } catch {
        /* keep polling */
      }
    }
    setPending(null);
    toast("Payment not detected yet", {
      description: "If you already sent it, reopen this page in a minute.",
    });
  };

  const cancel = () => {
    cancelled.current = true;
    setPending(null);
  };

  return { pay, pending, cancel };
}
