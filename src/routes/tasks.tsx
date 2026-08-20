import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Flame, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { useGame } from "@/hooks/useGame";
import { AD_MILESTONES, TASKS, formatNumber } from "@/lib/game";
import { showRewardedAd } from "@/lib/adsgram";
import { ReferralPanel } from "@/components/ReferralPanel";
import { CoinIcon } from "@/components/CoinIcon";
import dailyCheckin from "@/assets/tasks/daily-checkin.jpg";
import dailyCollect from "@/assets/tasks/daily-collect.jpg";
import dailyUpgrade from "@/assets/tasks/daily-upgrade.jpg";
import dailyTrack from "@/assets/tasks/daily-track.jpg";
import joinChannel from "@/assets/tasks/join-channel.jpg";
import followX from "@/assets/tasks/follow-x.jpg";
import invite1 from "@/assets/tasks/invite-1.jpg";
import invite5 from "@/assets/tasks/invite-5.jpg";
import level10 from "@/assets/tasks/level-10.jpg";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks & Invite | Music AI" },
      {
        name: "description",
        content: "Complete daily and social tasks, and invite friends to earn free MUSIC coins.",
      },
      { property: "og:title", content: "Tasks & Invite | Music AI" },
      { property: "og:description", content: "Daily tasks, achievements and referral rewards." },
    ],
  }),
  component: TasksPage,
});

const TASK_IMAGES: Record<string, string> = {
  "daily-checkin": dailyCheckin,
  "daily-collect": dailyCollect,
  "daily-upgrade": dailyUpgrade,
  "daily-track": dailyTrack,
  "join-channel": joinChannel,
  "follow-x": followX,
  "invite-1": invite1,
  "invite-5": invite5,
  "level-10": level10,
};

const GROUPS = [
  { kind: "daily", label: "Daily" },
  { kind: "social", label: "Social" },
  { kind: "achievement", label: "Achievements" },
] as const;

function TasksPage() {
  const [tab, setTab] = useState<"tasks" | "invite">("tasks");

  return (
    <div className="space-y-3">
      <div className="liquid-glass animate-fade-up grid grid-cols-2 gap-1 rounded-2xl p-1.5">
        {(["tasks", "invite"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl py-2 text-xs capitalize transition-transform duration-200 active:scale-95 ${
              tab === t ? "bg-white text-gray-900" : "text-foreground/70"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "tasks" ? <TasksTab /> : <ReferralPanel />}
    </div>
  );
}

function AdsSection() {
  const { state, watchedAd, claimAdMilestone } = useGame();
  const [loading, setLoading] = useState(false);
  const watched = state.adsWatched ?? 0;

  const watch = async () => {
    setLoading(true);
    try {
      const done = await showRewardedAd();
      if (!done) {
        toast("Ad skipped", { description: "Watch the full ad to get credit." });
        return;
      }
      watchedAd();
      toast.success(`Ad ${watched + 1} watched`);
    } catch {
      toast.error("No ads available right now", { description: "Try again in a moment." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="animate-fade-up delay-1 space-y-2">
      <h2 className="px-1 text-sm text-foreground/70">Watch &amp; earn</h2>

      <div className="liquid-glass rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm">Ads watched</p>
          <p className="text-lg tracking-tight">{watched}</p>
        </div>
        <button
          onClick={watch}
          disabled={loading}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm text-gray-900 transition-transform duration-200 active:scale-95 disabled:opacity-60"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
          Watch an ad
        </button>
      </div>

      {AD_MILESTONES.map((m) => {
        const claimed = state.adRewardsClaimed.includes(m.id);
        const ready = watched >= m.ads;
        const pct = Math.min(100, (watched / m.ads) * 100);
        return (
          <div key={m.id} className="liquid-glass rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <CoinIcon id="usdt" size={36} />
              <div className="min-w-0 flex-1">
                <p className="text-sm">Watch {m.ads} ads</p>
                <p className="text-[11px] text-foreground/60">
                  Reward ${m.usdt} in USDT · {Math.min(watched, m.ads)}/{m.ads}
                </p>
              </div>
              <button
                disabled={!ready || claimed}
                onClick={() => {
                  if (claimAdMilestone(m.id)) toast.success(`+$${m.usdt} USDT added`);
                }}
                className={`shrink-0 rounded-xl px-4 py-2 text-xs transition-transform duration-200 active:scale-95 ${
                  claimed || !ready ? "glass-thin text-foreground/50" : "bg-white text-gray-900"
                }`}
              >
                {claimed ? "Done" : ready ? "Claim" : `$${m.usdt}`}
              </button>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-700 transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </section>
  );
}

function TasksTab() {
  const { state, claimTask } = useGame();

  return (
    <div className="space-y-5">
      <section className="liquid-glass animate-fade-up delay-1 rounded-2xl p-5 text-center">
        <div className="flex items-center justify-center gap-2">
          <Flame size={18} strokeWidth={2} className="text-blue-500" />
          <p className="text-3xl tracking-tight">{state.streak}</p>
        </div>
        <p className="mt-1 text-[11px] text-foreground/60">
          Day streak — every consecutive day adds 10% to your check-in reward
        </p>
      </section>

      <AdsSection />

      {GROUPS.map((g, gi) => (
        <section key={g.kind} className={`animate-fade-up space-y-2 delay-${gi + 2}`}>
          <h2 className="px-1 text-sm text-foreground/70">{g.label}</h2>
          {TASKS.filter((t) => t.kind === g.kind).map((t) => {
            const done = state.claimedTasks.includes(t.id);
            return (
              <div key={t.id} className="liquid-glass flex items-center gap-3 rounded-2xl p-3">
                <img
                  src={TASK_IMAGES[t.id] ?? dailyCheckin}
                  alt={t.title}
                  width={112}
                  height={112}
                  loading="lazy"
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{t.title}</p>
                  <p className="text-[11px] text-foreground/60">+{formatNumber(t.reward)} MUSIC</p>
                </div>
                <button
                  disabled={done}
                  onClick={() => {
                    if (t.url) window.open(t.url, "_blank");
                    claimTask(t.id, t.reward);
                    toast.success(`Claimed ${formatNumber(t.reward)} MUSIC`);
                  }}
                  className={`flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs transition-transform duration-200 active:scale-95 ${
                    done ? "glass-thin text-foreground/50" : "bg-white text-gray-900"
                  }`}
                >
                  {done ? <Check size={13} strokeWidth={2} /> : null}
                  {done ? "Done" : (t.cta ?? "Claim")}
                </button>
              </div>

            );
          })}
        </section>
      ))}
    </div>
  );
}
