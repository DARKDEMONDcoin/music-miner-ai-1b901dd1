import { useEffect, useState } from "react";
import {
  TonConnectUIProvider,
  useTonAddress,
  useTonConnectUI,
} from "@tonconnect/ui-react";
import { ArrowDownLeft, ArrowUpRight, Loader2, LogOut, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useGame } from "@/hooks/useGame";
import { MINERS } from "@/lib/game";
import { TON_WALLET, telegram } from "@/lib/payments";

const AMOUNTS = [1, 5, 10];

function short(a: string) {
  return `${a.slice(0, 4)}…${a.slice(-4)}`;
}

function Inner() {
  const address = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const { state, connectWallet, disconnectWallet, withdraw } = useGame();
  const [sending, setSending] = useState(false);
  const [amount, setAmount] = useState(AMOUNTS[0]!);

  /* The session restores itself — the user never types an address. */
  useEffect(() => {
    if (address && address !== state.walletAddress) connectWallet(address);
    if (!address && state.walletAddress) disconnectWallet();
  }, [address, state.walletAddress, connectWallet, disconnectWallet]);

  if (!address) {
    return (
      <div className="animate-fade-up delay-1">
        <button
          onClick={() => void tonConnectUI.openModal()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm text-gray-900 transition-transform duration-200 active:scale-95"
        >
          <Wallet size={16} strokeWidth={2} /> Connect TON wallet
        </button>
        <p className="mt-2 text-center text-[11px] text-foreground/45">
          Deposits and withdrawals appear once your wallet is connected.
        </p>
      </div>
    );
  }

  const deposit = async () => {
    setSending(true);
    try {
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [{ address: TON_WALLET, amount: String(Math.round(amount * 1e9)) }],
      });
      telegram()?.HapticFeedback?.notificationOccurred?.("success");
      toast.success(`${amount} GRAM sent`, { description: "It lands in a few seconds." });
    } catch {
      toast("Deposit cancelled");
    } finally {
      setSending(false);
    }
  };

  const onWithdraw = () => {
    const ready = MINERS.filter((m) => (m.id === "gram" ? state.gram : state.usdt) >= m.minWithdraw);
    if (ready.length === 0) {
      toast.error("Nothing to withdraw yet", {
        description: `Minimum ${MINERS[0]!.minWithdraw} GRAM or ${MINERS[1]!.minWithdraw} USDT.`,
      });
      return;
    }
    const sent = ready.filter((m) => withdraw(m.id)).map((m) => m.symbol);
    toast.success(`Withdrawal requested — ${sent.join(" + ")}`, {
      description: `Sent to ${short(address)}`,
    });
  };

  return (
    <div className="animate-fade-up delay-1 space-y-3">
      <div className="flex items-center justify-center">
        <button
          onClick={() => void tonConnectUI.disconnect()}
          className="glass-thin flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] text-foreground/70"
        >
          {short(address)} <LogOut size={12} strokeWidth={2} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={deposit}
          disabled={sending}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm text-gray-900 transition-transform duration-200 active:scale-95 disabled:opacity-60"
        >
          {sending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ArrowDownLeft size={16} strokeWidth={2} />
          )}
          Deposit
        </button>
        <button
          onClick={onWithdraw}
          className="glass-thin flex items-center justify-center gap-2 rounded-2xl py-3 text-sm transition-transform duration-200 active:scale-95"
        >
          <ArrowUpRight size={16} strokeWidth={2} /> Withdraw
        </button>
      </div>

      <div className="flex items-center justify-center gap-2">
        {AMOUNTS.map((a) => (
          <button
            key={a}
            onClick={() => setAmount(a)}
            className={`rounded-full px-3 py-1 text-[11px] transition-all duration-200 active:scale-95 ${
              amount === a ? "bg-white text-gray-900" : "glass-thin text-foreground/60"
            }`}
          >
            {a} GRAM
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Wallets fetch the manifest themselves, so it must live on a public host.
 * The editor preview origin is auth-gated — map it to the stable public one.
 */
function publicOrigin() {
  const { origin } = window.location;
  return origin.replace(/^https:\/\/id-preview--([^.]+)\./, "https://project--$1-dev.");
}

export default function WalletPanel() {
  const [manifestUrl, setManifestUrl] = useState("");

  useEffect(() => {
    setManifestUrl(`${publicOrigin()}/api/public/tonconnect-manifest`);
  }, []);

  if (!manifestUrl) {
    return (
      <div className="flex justify-center py-3">
        <Loader2 size={16} className="animate-spin text-foreground/50" />
      </div>
    );
  }

  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      actionsConfiguration={{ twaReturnUrl: "https://t.me/" }}
    >
      <Inner />
    </TonConnectUIProvider>
  );
}
