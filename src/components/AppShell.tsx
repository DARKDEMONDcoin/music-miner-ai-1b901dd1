import { Link, useRouterState } from "@tanstack/react-router";
import { ListChecks, Pickaxe, Rocket, Wallet, Wand2 } from "lucide-react";
import type { ReactNode } from "react";
import { BoomerangVideoBg } from "@/components/BoomerangVideoBg";

const NAV = [
  { to: "/", label: "Mine", icon: Pickaxe },
  { to: "/studio", label: "Studio", icon: Rocket },
  { to: "/ai", label: "AI", icon: Wand2 },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/wallet", label: "Wallet", icon: Wallet },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative min-h-screen w-full">
      <BoomerangVideoBg />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col">
        <main key={pathname} className="page-enter flex-1 px-4 pb-32 pt-6">
          {children}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md px-4 pb-4">
          <div className="liquid-glass flex items-center justify-between rounded-3xl p-1.5">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] tracking-tight transition-all duration-300 active:scale-95 ${
                    active ? "text-white" : "text-foreground/55 hover:text-foreground/90"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-300 ${
                      active
                        ? "bg-gradient-to-br from-blue-400 to-blue-700 shadow-[0_6px_18px_-6px_rgba(59,130,246,0.9)]"
                        : "bg-transparent"
                    }`}
                  >
                    <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
                  </span>
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
