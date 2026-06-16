import type { ReactNode } from "react";

export function StatCard({
  label, value, hint, icon, tone = "cyan",
}: { label: string; value: ReactNode; hint?: string; icon?: ReactNode; tone?: "pink" | "cyan" | "amber" | "emerald" | "violet" }) {
  const tones: Record<string, string> = {
    pink: "from-pink-500/20 to-rose-500/5 border-pink-400/20 text-pink-200",
    cyan: "from-cyan-500/20 to-sky-500/5 border-cyan-400/20 text-cyan-200",
    amber: "from-amber-500/20 to-orange-500/5 border-amber-400/20 text-amber-200",
    emerald: "from-emerald-500/20 to-teal-500/5 border-emerald-400/20 text-emerald-200",
    violet: "from-violet-500/20 to-fuchsia-500/5 border-violet-400/20 text-violet-200",
  };
  return (
    <div className={`glass relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br ${tones[tone]}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-slate-400">{label}</div>
          <div className="mt-1 text-3xl font-bold tabular text-white">{value}</div>
          {hint && <div className="mt-1 text-[11px] text-slate-400">{hint}</div>}
        </div>
        {icon && <div className="opacity-80">{icon}</div>}
      </div>
      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, glow, className = "" }: { children: ReactNode; glow?: "pink" | "cyan" | "amber" | "emerald"; className?: string }) {
  const glowMap: Record<string, string> = {
    pink: "glow-pink",
    cyan: "glow-cyan",
    amber: "glow-amber",
    emerald: "glow-cyan",
  };
  return (
    <div className={`glass-strong p-5 rounded-2xl ${glow ? glowMap[glow] : ""} ${className}`}>
      {children}
    </div>
  );
}

export function Pill({ children, tone = "slate" }: { children: ReactNode; tone?: "pink" | "cyan" | "amber" | "emerald" | "violet" | "slate" }) {
  const tones: Record<string, string> = {
    pink: "text-pink-200 bg-pink-500/15 border-pink-400/30",
    cyan: "text-cyan-200 bg-cyan-500/15 border-cyan-400/30",
    amber: "text-amber-200 bg-amber-500/15 border-amber-400/30",
    emerald: "text-emerald-200 bg-emerald-500/15 border-emerald-400/30",
    violet: "text-violet-200 bg-violet-500/15 border-violet-400/30",
    slate: "text-slate-300 bg-white/5 border-white/10",
  };
  return <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border ${tones[tone]}`}>{children}</span>;
}
