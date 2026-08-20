/** Minimal Adsgram (sad.adsgram.ai) rewarded-ad integration. */

export const ADSGRAM_BLOCK_ID =
  (import.meta.env["VITE_ADSGRAM_BLOCK_ID"] as string | undefined) ?? "int-14003";

type AdController = {
  show: () => Promise<{ done?: boolean; description?: string }>;
};

type AdsgramGlobal = {
  init: (opts: { blockId: string; debug?: boolean }) => AdController;
};

let controller: AdController | null = null;
let loading: Promise<void> | null = null;

function loadScript() {
  if (typeof document === "undefined") return Promise.reject(new Error("no dom"));
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-adsgram]");
    if (existing) return resolve();
    const el = document.createElement("script");
    el.src = "https://sad.adsgram.ai/js/sad.min.js";
    el.async = true;
    el.dataset["adsgram"] = "1";
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("Adsgram failed to load"));
    document.head.appendChild(el);
  });
  return loading;
}

export async function showRewardedAd(): Promise<boolean> {
  await loadScript();
  const sdk = (window as unknown as { Adsgram?: AdsgramGlobal }).Adsgram;
  if (!sdk) throw new Error("Adsgram is unavailable");
  controller ??= sdk.init({ blockId: ADSGRAM_BLOCK_ID });
  const result = await controller.show();
  return result?.done !== false;
}
