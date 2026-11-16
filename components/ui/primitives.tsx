import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "ghost" | "danger" | "ok";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-slate-950 hover:bg-sky-300 font-semibold",
  secondary: "bg-surface-3 text-ink border border-line-strong hover:border-accent/60",
  ghost: "text-ink-2 hover:text-ink hover:bg-surface-3",
  danger: "bg-bad-soft text-bad border border-bad/40 hover:bg-bad/20",
  ok: "bg-ok-soft text-ok border border-ok/40 hover:bg-ok/20",
};

export function Button({ variant = "secondary", size = "md", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-7 px-2.5 text-xs" : "h-9 px-3.5 text-sm",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-line bg-surface", className)} {...props} />;
}

export function CardHeader({ title, icon, action, sub }: { title: ReactNode; icon?: ReactNode; action?: ReactNode; sub?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          {icon && <span className="text-accent">{icon}</span>}
          {title}
        </h2>
        {sub && <p className="mt-0.5 text-xs text-ink-3">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

type Tone = "neutral" | "accent" | "ok" | "warn" | "bad" | "violet";
const TONES: Record<Tone, string> = {
  neutral: "bg-surface-3 text-ink-2 border-line-strong",
  accent: "bg-accent-soft text-accent border-accent/30",
  ok: "bg-ok-soft text-ok border-ok/30",
  warn: "bg-warn-soft text-warn border-warn/30",
  bad: "bg-bad-soft text-bad border-bad/30",
  violet: "bg-violet-500/10 text-violet border-violet/30",
};

export function Badge({ tone = "neutral", className, children, title }: { tone?: Tone; className?: string; children: ReactNode; title?: string }) {
  return (
    <span title={title} className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded border px-1.5 py-0.5 text-[11px] font-medium leading-none", TONES[tone], className)}>
      {children}
    </span>
  );
}

export function Meter({ value, tone = "accent", label }: { value: number | null; tone?: "accent" | "ok" | "warn" | "bad"; label?: string }) {
  const pct = value === null ? 0 : Math.round(Math.max(0, Math.min(1, value)) * 100);
  const color = { accent: "bg-accent", ok: "bg-ok", warn: "bg-warn", bad: "bg-bad" }[tone];
  return (
    <div className="flex items-center gap-2" aria-label={label}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right font-mono text-xs text-ink-2">{value === null ? "—" : `${pct}%`}</span>
    </div>
  );
}

export function PageHeader({ eyebrow, title, children, actions }: { eyebrow?: string; title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-accent">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {children && <div className="mt-1.5 max-w-3xl text-sm text-ink-2">{children}</div>}
      </div>
      {actions}
    </header>
  );
}

export function Notice({ tone = "accent", title, children, className }: { tone?: "accent" | "warn" | "bad" | "ok"; title?: ReactNode; children: ReactNode; className?: string }) {
  const map = { accent: "border-accent/30 bg-accent-soft/50", warn: "border-warn/30 bg-warn-soft/60", bad: "border-bad/30 bg-bad-soft/60", ok: "border-ok/30 bg-ok-soft/60" };
  return (
    <div className={cn("rounded-lg border px-3.5 py-2.5 text-sm text-ink-2", map[tone], className)}>
      {title && <p className="mb-0.5 font-semibold text-ink">{title}</p>}
      {children}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded border border-line-strong bg-surface-3 px-1.5 py-0.5 font-mono text-[11px] text-ink-2">{children}</kbd>;
}

export function Tabs<T extends string>({ tabs, value, onChange, className }: { tabs: { id: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="tablist" className={cn("flex gap-1 overflow-x-auto border-b border-line", className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors",
            value === t.id ? "border-accent text-ink" : "border-transparent text-ink-3 hover:text-ink-2",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
