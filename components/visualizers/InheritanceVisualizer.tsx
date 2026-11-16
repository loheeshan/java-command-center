"use client";

import { useState } from "react";
import { Badge, cn } from "@/components/ui/primitives";

type Cls = "DispatchMission" | "GroundMission" | "AirMission";

interface Member {
  sig: string;
  kind: "field" | "ctor" | "method" | "abstract";
  vis: "-" | "+" | "#";
}

const CLASSES: Record<Cls, { abstract?: boolean; members: Member[] }> = {
  DispatchMission: {
    abstract: true,
    members: [
      { sig: "id : long", kind: "field", vis: "-" },
      { sig: "distanceKm : int", kind: "field", vis: "-" },
      { sig: "loadKg : int", kind: "field", vis: "-" },
      { sig: "DispatchMission(id, distanceKm, loadKg)", kind: "ctor", vis: "#" },
      { sig: "getId() : long", kind: "method", vis: "+" },
      { sig: "getDistanceKm() : int", kind: "method", vis: "+" },
      { sig: "getLoadKg() : int", kind: "method", vis: "+" },
      { sig: "energyUnits() : int", kind: "abstract", vis: "+" },
      { sig: "priority() : int", kind: "abstract", vis: "+" },
    ],
  },
  GroundMission: {
    members: [
      { sig: "medical : boolean", kind: "field", vis: "-" },
      { sig: "GroundMission(id, distanceKm, loadKg, medical)", kind: "ctor", vis: "+" },
      { sig: "isMedical() : boolean", kind: "method", vis: "+" },
      { sig: "energyUnits() : int", kind: "method", vis: "+" },
      { sig: "priority() : int", kind: "method", vis: "+" },
    ],
  },
  AirMission: {
    members: [
      { sig: "windPenalty : int", kind: "field", vis: "-" },
      { sig: "critical : boolean", kind: "field", vis: "-" },
      { sig: "AirMission(id, distanceKm, loadKg, windPenalty, critical)", kind: "ctor", vis: "+" },
      { sig: "getWindPenalty() : int", kind: "method", vis: "+" },
      { sig: "isCritical() : boolean", kind: "method", vis: "+" },
      { sig: "energyUnits() : int", kind: "method", vis: "+" },
      { sig: "priority() : int", kind: "method", vis: "+" },
    ],
  },
};

const OVERRIDES = new Set(["energyUnits() : int", "priority() : int"]);

function Box({ name, selected, onClick, highlight }: { name: Cls; selected: boolean; onClick: () => void; highlight: (m: Member, owner: Cls) => string }) {
  const c = CLASSES[name];
  return (
    <button onClick={onClick} className={cn("w-full rounded-lg border bg-surface-2 text-left transition-colors", selected ? "border-accent ring-1 ring-accent/40" : "border-line-strong hover:border-accent/50")}>
      <div className="border-b border-line px-3 py-1.5 text-center">
        {c.abstract && <p className="font-mono text-[10px] text-ink-3">«abstract»</p>}
        <p className={cn("font-mono text-sm text-ink", c.abstract && "italic")}>{name}</p>
      </div>
      <div className="space-y-0.5 px-3 py-1.5">
        {c.members.map((m) => (
          <p key={m.sig} className={cn("rounded px-1 font-mono text-[11.5px]", highlight(m, name), m.kind === "abstract" && "italic")}>
            <span className="text-ink-3">{m.vis} </span>
            {m.sig}
            {OVERRIDES.has(m.sig) && name !== "DispatchMission" && <span className="ml-1 text-[10px] text-warn">@Override</span>}
          </p>
        ))}
      </div>
    </button>
  );
}

export function InheritanceVisualizer() {
  const [sel, setSel] = useState<Cls>("AirMission");

  const highlight = (m: Member, owner: Cls) => {
    if (sel === "DispatchMission") return owner === "DispatchMission" ? "bg-accent-soft/60 text-ink" : "text-ink-3";
    if (owner === sel) return OVERRIDES.has(m.sig) ? "bg-warn-soft text-ink" : "bg-ok-soft/70 text-ink";
    if (owner === "DispatchMission") {
      if (m.kind === "ctor") return "text-ink-3 line-through decoration-ink-3/50";
      if (m.kind === "abstract") return "text-ink-3 line-through decoration-warn/60";
      return "bg-accent-soft/60 text-ink";
    }
    return "text-ink-3/60";
  };

  const parent = CLASSES.DispatchMission.members;
  const own = sel === "DispatchMission" ? [] : CLASSES[sel].members;

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-2">Click a class. Colours show what an object of that class contains and where each member comes from.</p>
      <div className="mx-auto max-w-3xl">
        <div className="mx-auto max-w-sm"><Box name="DispatchMission" selected={sel === "DispatchMission"} onClick={() => setSel("DispatchMission")} highlight={highlight} /></div>
        {/* UML generalisation arrows: hollow triangle points at the parent */}
        <svg viewBox="0 0 400 60" className="mx-auto h-14 w-full max-w-xl" aria-hidden>
          <polygon points="200,2 190,18 210,18" fill="var(--color-bg)" stroke="var(--color-ink-2)" strokeWidth="1.5" />
          <line x1="200" y1="18" x2="200" y2="34" stroke="var(--color-ink-2)" strokeWidth="1.5" />
          <line x1="90" y1="34" x2="310" y2="34" stroke="var(--color-ink-2)" strokeWidth="1.5" />
          <line x1="90" y1="34" x2="90" y2="60" stroke="var(--color-ink-2)" strokeWidth="1.5" />
          <line x1="310" y1="34" x2="310" y2="60" stroke="var(--color-ink-2)" strokeWidth="1.5" />
        </svg>
        <div className="grid gap-4 sm:grid-cols-2">
          <Box name="GroundMission" selected={sel === "GroundMission"} onClick={() => setSel("GroundMission")} highlight={highlight} />
          <Box name="AirMission" selected={sel === "AirMission"} onClick={() => setSel("AirMission")} highlight={highlight} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <Badge tone="accent">inherited & usable</Badge>
        <Badge tone="ok">declared in this class</Badge>
        <Badge tone="warn">overrides an abstract method</Badge>
        <Badge tone="neutral"><span className="line-through">not inherited / replaced</span></Badge>
      </div>

      {sel === "DispatchMission" ? (
        <p className="rounded-lg border border-line bg-surface-2 p-3 text-sm text-ink-2">
          <strong className="text-ink">DispatchMission is abstract</strong>: you can declare variables of this type, but <code className="font-mono">new DispatchMission(...)</code> does not compile. Its two abstract methods (italic) have no body — every concrete subclass must provide them.
        </p>
      ) : (
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg border border-line bg-surface-2 p-3">
            <p className="mb-1 font-medium text-ink">State in a {sel} object</p>
            <ul className="space-y-0.5 font-mono text-xs text-ink-2">
              {parent.filter((m) => m.kind === "field").map((m) => <li key={m.sig}>{m.sig} <span className="text-ink-3">(parent, private → use getter)</span></li>)}
              {own.filter((m) => m.kind === "field").map((m) => <li key={m.sig} className="text-ok">{m.sig}</li>)}
            </ul>
          </div>
          <div className="rounded-lg border border-line bg-surface-2 p-3">
            <p className="mb-1 font-medium text-ink">Constructor chain</p>
            <p className="font-mono text-xs text-ink-2">new {sel}(…)<br />→ super(id, distanceKm, loadKg)<br />→ DispatchMission sets its 3 fields<br />→ back in {sel}: sets {own.filter((m) => m.kind === "field").map((m) => m.sig.split(" ")[0]).join(", ")}</p>
            <p className="mt-1 text-xs text-ink-3">Constructors are never inherited.</p>
          </div>
          <div className="rounded-lg border border-line bg-surface-2 p-3">
            <p className="mb-1 font-medium text-ink">Through a DispatchMission reference</p>
            <p className="text-xs text-ink-2">You may call: <span className="font-mono">getId, getDistanceKm, getLoadKg, energyUnits, priority</span>.</p>
            <p className="mt-1 text-xs text-ink-2">Not without a cast: <span className="font-mono text-bad">{own.filter((m) => m.kind === "method" && !OVERRIDES.has(m.sig)).map((m) => m.sig.split("(")[0]).join(", ")}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
