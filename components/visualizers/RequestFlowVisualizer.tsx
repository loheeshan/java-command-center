"use client";

import { useState } from "react";
import { ChevronRight, RotateCcw } from "lucide-react";
import { evaluate, PAPER_SEED, plan, validateNewAir, type MissionInput } from "@/lib/algorithms/dispatch";
import { Badge, Button, cn } from "@/components/ui/primitives";
import { CodeBlock } from "@/components/content/CodeBlock";

type Layer = "client" | "controller" | "service" | "repository" | "model" | "handler";
interface Hop { layer: Layer; title: string; code: string; note: string }
interface Scenario { id: string; label: string; method: "GET" | "POST"; url: string; body?: string }

const SCENARIOS: Scenario[] = [
  { id: "energy101", label: "Energy of 101", method: "GET", url: "/missions/101/energy" },
  { id: "energy999", label: "Unknown mission", method: "GET", url: "/missions/999/energy" },
  { id: "plan60", label: "Plan capacity 60", method: "GET", url: "/missions/plan?capacity=60" },
  { id: "plan0", label: "Invalid capacity", method: "GET", url: "/missions/plan?capacity=0" },
  { id: "post104", label: "POST mission 104", method: "POST", url: "/missions/air", body: '{"id":104,"distanceKm":6,"loadKg":1,"windPenalty":2,"critical":false}' },
  { id: "postDup", label: "POST duplicate 101", method: "POST", url: "/missions/air", body: '{"id":101,"distanceKm":5,"loadKg":1,"windPenalty":1,"critical":false}' },
  { id: "plan125", label: "Plan capacity 125", method: "GET", url: "/missions/plan?capacity=125" },
];

const LAYERS: { id: Layer; label: string; pkg: string }[] = [
  { id: "client", label: "HTTP client", pkg: "Swagger / curl" },
  { id: "controller", label: "Controller", pkg: "controller/DispatchController" },
  { id: "service", label: "Service", pkg: "service/DispatchService" },
  { id: "repository", label: "Repository", pkg: "repository/MissionRepository" },
  { id: "model", label: "Model", pkg: "model/*Mission" },
  { id: "handler", label: "Exception handler", pkg: "exception/GlobalExceptionHandler" },
];

function simulate(s: Scenario, repo: MissionInput[]): { hops: Hop[]; status: number; body: unknown; repoAfter: MissionInput[] } {
  const hops: Hop[] = [{ layer: "client", title: `${s.method} ${s.url}`, code: s.body ? `Content-Type: application/json\n\n${s.body}` : `${s.method} http://localhost:8080${s.url}`, note: "Spring's DispatcherServlet matches the HTTP method and path to a controller method." }];
  const notFound = (id: number) => {
    hops.push({ layer: "repository", title: `find(${id}) → null`, code: "public DispatchMission find(long id) { return map.get(id); }", note: "No such key, so the map returns null." });
    hops.push({ layer: "service", title: "throw new MissionNotFoundException(id)", code: `if (mission == null) {\n    throw new MissionNotFoundException(id);\n}`, note: "The service decides that a missing mission is an error. The exception travels up through the controller untouched." });
    hops.push({ layer: "handler", title: "@ExceptionHandler(MissionNotFoundException.class)", code: `return ResponseEntity.status(HttpStatus.NOT_FOUND)\n        .body(new ErrorResponse("NOT_FOUND", e.getMessage()));`, note: "Spring finds the matching handler and builds a designed 404 instead of a 500." });
    return { hops, status: 404, body: { code: "NOT_FOUND", message: `Mission not found: ${id}` }, repoAfter: repo };
  };
  const badRequest = (msg: string, where: string) => {
    hops.push({ layer: "service", title: "throw new IllegalArgumentException(...)", code: where, note: "Invalid input is rejected in the service before anything is saved." });
    hops.push({ layer: "handler", title: "@ExceptionHandler(IllegalArgumentException.class)", code: `return ResponseEntity.status(HttpStatus.BAD_REQUEST)\n        .body(new ErrorResponse("BAD_REQUEST", e.getMessage()));`, note: "Mapped to 400 with a descriptive message." });
    return { hops, status: 400, body: { code: "BAD_REQUEST", message: msg }, repoAfter: repo };
  };

  if (s.url.includes("/energy")) {
    const id = Number(s.url.split("/")[2]);
    hops.push({ layer: "controller", title: `energy(@PathVariable id = ${id})`, code: `@GetMapping("/{id}/energy")\npublic Map<String, Integer> energy(@PathVariable("id") long id) {\n    return Map.of("energyUnits", service.energy(id));\n}`, note: "The controller only delegates. `{id}` is converted from text to long." });
    hops.push({ layer: "service", title: `energy(${id})`, code: "DispatchMission mission = repo.find(id);", note: "Ask the repository for the mission." });
    const m = repo.find((x) => x.id === id);
    if (!m) return notFound(id);
    const ev = evaluate(m);
    hops.push({ layer: "repository", title: `find(${id}) → ${ev.kind === "ground" ? "GroundMission" : "AirMission"}`, code: "return map.get(id);", note: "Returns the stored object (as a DispatchMission reference)." });
    hops.push({ layer: "model", title: `${ev.kind === "ground" ? "GroundMission" : "AirMission"}.energyUnits()`, code: ev.energyWorking, note: "Polymorphic call: the object's own override runs." });
    hops.push({ layer: "controller", title: "return Map.of(...)", code: `Map.of("energyUnits", ${ev.energy})`, note: "Jackson serialises the Map to JSON with status 200." });
    return { hops, status: 200, body: { energyUnits: ev.energy }, repoAfter: repo };
  }

  if (s.url.startsWith("/missions/plan")) {
    const capacity = Number(new URLSearchParams(s.url.split("?")[1]).get("capacity"));
    hops.push({ layer: "controller", title: `plan(capacity = ${capacity}, urgentOnly = false)`, code: `@GetMapping("/plan")\npublic DispatchPlan plan(@RequestParam("capacity") int capacity,\n        @RequestParam(name = "urgentOnly", defaultValue = "false") boolean urgentOnly) {\n    return service.plan(capacity, urgentOnly);\n}`, note: "urgentOnly was omitted, so the default false is used." });
    if (capacity <= 0) return badRequest("Capacity must be greater than zero.", `if (capacity <= 0) {\n    throw new IllegalArgumentException("Capacity must be greater than zero.");\n}`);
    hops.push({ layer: "service", title: "filter → sort → greedy", code: "for (DispatchMission m : repo.all()) ...\neligible.sort(comparator);\nfor (DispatchMission m : eligible) { if (fits) select else skip }", note: "The algorithm runs entirely in the service." });
    hops.push({ layer: "repository", title: `all() → ${repo.length} missions`, code: "return List.copyOf(map.values());", note: "An unmodifiable snapshot — the service copies it before sorting." });
    const r = plan(repo, capacity, false);
    hops.push({ layer: "model", title: "priority() / energyUnits() on each mission", code: r.selected.concat([]).map((m) => `${m.id}: p${m.priority}, e${m.energy}`).join("\n") + (r.skipped.length ? `\nskipped: ${r.skipped.join(", ")}` : ""), note: "Only abstract-method calls — no instanceof." });
    hops.push({ layer: "controller", title: "return DispatchPlan", code: "Jackson → JSON via getters", note: "200 OK." });
    return { hops, status: 200, body: { capacity, energyUsed: r.energyUsed, energyRemaining: r.energyRemaining, selected: r.selected.map((m) => ({ id: m.id, type: m.kind === "ground" ? "GroundMission" : "AirMission", priority: m.priority, energyUnits: m.energy })), skipped: r.skipped }, repoAfter: repo };
  }

  // POST /missions/air
  const req = JSON.parse(s.body!) as { id: number; distanceKm: number; loadKg: number; windPenalty: number; critical: boolean };
  hops.push({ layer: "controller", title: "addAir(@RequestBody NewAirMission)", code: `@PostMapping("/air")\n@ResponseStatus(HttpStatus.CREATED)\npublic DispatchMission addAir(@RequestBody NewAirMission request) {\n    return service.addAir(request);\n}`, note: "Jackson creates NewAirMission with its no-arg constructor and setters." });
  const err = validateNewAir(req, repo.map((m) => m.id));
  if (err) return badRequest(err, err.includes("exists") ? `if (repo.exists(request.getId())) {\n    throw new IllegalArgumentException("A mission with ID ... already exists.");\n}` : "validateAirMission(request);  // range checks");
  const m: MissionInput = { id: req.id, kind: "air", distanceKm: req.distanceKm, loadKg: req.loadKg, windPenalty: req.windPenalty, critical: req.critical };
  const ev = evaluate(m);
  hops.push({ layer: "service", title: "validate → create → calculate", code: `AirMission mission = new AirMission(...);\nmission.energyUnits();   // ${ev.energy}, before saving`, note: "All checks pass. Energy is calculated before saving." });
  hops.push({ layer: "model", title: "new AirMission(...) → super(...)", code: ev.energyWorking, note: `Priority: ${ev.priorityWorking}.` });
  hops.push({ layer: "repository", title: `save(${req.id})`, code: "map.put(m.getId(), m);", note: "Stored in the in-memory map (lost when the app restarts)." });
  hops.push({ layer: "controller", title: "201 Created", code: "@ResponseStatus(HttpStatus.CREATED)", note: "Without this the status would be 200." });
  return { hops, status: 201, body: { id: req.id, distanceKm: req.distanceKm, loadKg: req.loadKg, windPenalty: req.windPenalty, critical: req.critical }, repoAfter: [...repo, m] };
}

export function RequestFlowVisualizer() {
  const [repo, setRepo] = useState<MissionInput[]>(PAPER_SEED);
  const [scenario, setScenario] = useState<Scenario>(SCENARIOS[0]);
  const [run, setRun] = useState(() => simulate(SCENARIOS[0], PAPER_SEED));
  const [step, setStep] = useState(0);

  const pick = (s: Scenario) => {
    const r = simulate(s, repo);
    setScenario(s);
    setRun(r);
    setStep(0);
  };
  const hop = run.hops[Math.min(step, run.hops.length - 1)];
  const finished = step >= run.hops.length - 1;

  const advance = () => {
    if (step + 1 === run.hops.length - 1 || run.hops.length === 1) setRepo(run.repoAfter);
    setStep((s) => Math.min(run.hops.length - 1, s + 1));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {SCENARIOS.map((s) => (
          <button key={s.id} onClick={() => pick(s)} className={cn("rounded-md border px-2.5 py-1 text-xs", scenario.id === s.id ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-2 hover:border-line-strong")}>
            <span className={cn("mr-1 font-mono", s.method === "POST" ? "text-warn" : "text-ok")}>{s.method}</span>{s.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-ink-3">In-memory repository now holds: [{repo.map((m) => m.id).join(", ")}] {repo.length > 3 && <button className="ml-1 underline" onClick={() => { setRepo(PAPER_SEED); pick(scenario); }}>reset</button>}</p>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <ol className="flex gap-1.5 overflow-x-auto lg:flex-col" aria-label="Layers">
          {LAYERS.map((l) => {
            const visited = run.hops.slice(0, step + 1).some((h) => h.layer === l.id);
            const active = hop.layer === l.id;
            return (
              <li key={l.id} className={cn("min-w-36 rounded-lg border px-3 py-2 transition-all", active ? "border-accent bg-accent-soft/60" : visited ? "border-line-strong bg-surface-2" : "border-line opacity-50", l.id === "handler" && visited && "border-warn/50")}>
                <p className="text-sm text-ink">{l.label}</p>
                <p className="font-mono text-[10px] text-ink-3">{l.pkg}</p>
              </li>
            );
          })}
        </ol>
        <div className="space-y-3">
          <div className="rounded-lg border border-line bg-surface-2 p-3">
            <p className="mb-1 font-mono text-[11px] text-ink-3">step {step + 1}/{run.hops.length} · {LAYERS.find((l) => l.id === hop.layer)?.label}</p>
            <p className="mb-2 font-mono text-sm text-ink">{hop.title}</p>
            <CodeBlock code={hop.code} />
            <p className="mt-2 text-sm text-ink-2">{hop.note}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={advance} disabled={finished}>Next hop <ChevronRight size={14} /></Button>
            <Button size="sm" variant="ghost" onClick={() => setStep(0)}><RotateCcw size={13} /> Replay</Button>
          </div>
          {finished && (
            <div className="rounded-lg border border-line bg-[#06090f] p-3">
              <p className="mb-1 font-mono text-xs"><Badge tone={run.status < 300 ? "ok" : run.status === 404 ? "warn" : "bad"}>HTTP {run.status}</Badge></p>
              <pre className="overflow-x-auto font-mono text-xs text-ink">{JSON.stringify(run.body, null, 2)}</pre>
            </div>
          )}
          <p className="text-[11px] text-ink-3">Simulation of the reference solution&apos;s behaviour. To see your own code answer real HTTP requests, use the Exam Lab.</p>
        </div>
      </div>
    </div>
  );
}
