"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  BarChart3, BookOpen, Boxes, BrainCircuit, CalendarClock, Code2, Coffee, FileCheck2, GraduationCap,
  LayoutDashboard, Leaf, Library, ListChecks, Menu, Network, ShieldCheck, X,
} from "lucide-react";
import { countdown, EXAM_START } from "@/lib/exam";
import { useRunnerStatus } from "@/lib/execution/client";
import { cn } from "@/components/ui/primitives";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "Study Roadmap", icon: CalendarClock },
  { href: "/learn", label: "Java Foundations", icon: BookOpen },
  { href: "/oop-lab", label: "OOP Lab", icon: Boxes },
  { href: "/algorithms", label: "Collections & Algorithms", icon: Network },
  { href: "/spring-boot", label: "Spring Boot Lab", icon: Leaf },
  { href: "/playground", label: "Code Playground", icon: Code2 },
  { href: "/exam", label: "Exam Practice", icon: FileCheck2 },
  { href: "/coverage", label: "Exam Coverage", icon: ShieldCheck },
  { href: "/quizzes", label: "Quiz Arena", icon: BrainCircuit },
  { href: "/revision", label: "Revision Center", icon: ListChecks },
  { href: "/progress", label: "Progress & Analytics", icon: BarChart3 },
  { href: "/resources", label: "Resources", icon: Library },
];

function MiniCountdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now === null) return <span className="font-mono text-xs text-ink-3">--</span>;
  const c = countdown(EXAM_START, new Date(now));
  if (c.past) return <span className="font-mono text-xs text-ink-2">exam started</span>;
  return (
    <span className="font-mono text-xs tabular-nums text-ink" title="Lab-Based Practical: Fri 20 Nov 2026, 13:30 Asia/Colombo">
      {c.days}d {String(c.hours).padStart(2, "0")}:{String(c.minutes).padStart(2, "0")}:{String(c.seconds).padStart(2, "0")}
    </span>
  );
}

function RunnerDot() {
  const [status, refresh] = useRunnerStatus();
  const tone = status.state === "online" ? "bg-ok" : status.state === "checking" ? "bg-warn" : "bg-bad";
  const label =
    status.state === "online" ? `Java runner online (${status.health.mode}) — ${status.health.javaVersion ?? ""}` : status.state === "checking" ? "Checking Java runner…" : `Java runner offline: ${status.message}`;
  return (
    <button onClick={refresh} title={label} className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-ink-2 hover:bg-surface-3">
      <span className={cn("h-2 w-2 rounded-full", tone)} />
      <span className="hidden sm:inline">{status.state === "online" ? "JDK ready" : status.state === "checking" ? "JDK…" : "JDK offline"}</span>
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));

  const nav = (
    <nav aria-label="Main" className="flex flex-col gap-0.5 px-2">
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
            isActive(href) ? "bg-accent-soft text-accent" : "text-ink-2 hover:bg-surface-3 hover:text-ink",
          )}
        >
          <Icon size={15} strokeWidth={1.8} />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface lg:flex">
        <Link href="/" className="flex items-center gap-2 px-4 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent"><Coffee size={17} /></span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-ink">Java Command Center</span>
            <span className="block font-mono text-[10px] text-ink-3">5COSC019W · zero → exam ready</span>
          </span>
        </Link>
        <div className="flex-1 overflow-y-auto pb-4">{nav}</div>
        <div className="border-t border-line px-4 py-3 text-[11px] text-ink-3">
          <p className="flex items-center gap-1.5"><GraduationCap size={12} /> LBP · Fri 20 Nov, 13:30</p>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 overflow-y-auto border-r border-line bg-surface py-3">
            <div className="mb-2 flex items-center justify-between px-4">
              <span className="text-sm font-semibold">Java Command Center</span>
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="rounded p-1 text-ink-2 hover:bg-surface-3"><X size={18} /></button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-12 items-center justify-between gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <button aria-label="Open menu" onClick={() => setOpen(true)} className="rounded p-1.5 text-ink-2 hover:bg-surface-3 lg:hidden"><Menu size={18} /></button>
            <span className="text-xs text-ink-3">Exam in</span>
            <MiniCountdown />
          </div>
          <RunnerDot />
        </header>
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
