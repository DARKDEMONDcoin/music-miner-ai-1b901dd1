import { useEffect } from "react";
import {
  TonConnectUIProvider,
  useTonAddress,
  useTonConnectUI,
} from "@tonconnect/ui-react";
import { Loader2, Wallet } from "lucide-react";
import { useGame } from "@/hooks/useGame";

function WalletSync() {
  const address = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const { state, connectWallet, disconnectWallet } = useGame();

  /* Session restore + live status are fully automatic — no manual address entry. */
  useEffect(() => {
    if (address && address !== state.walletAddress) connectWallet(address);
    if (!address && state.walletAddress) disconnectWallet();
  }, [address, state.walletAddress, connectWallet, disconnectWallet]);

  const open = () => {
    void tonConnectUI.openModal();
  };

  if (address) return null;

  return (
    <button
      onClick={open}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm text-gray-900 transition-transform duration-200 active:scale-95"
    >
      <Wallet size={16} strokeWidth={2} /> Connect TON wallet
    </button>
  );
}

export default function TonWallet() {
  const manifestUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/api/public/tonconnect-manifest`;

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
      <WalletSync />
    </TonConnectUIProvider>
  );
}
