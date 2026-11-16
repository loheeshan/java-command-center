export interface RevisionSection {
  id: string;
  title: string;
  rows?: [string, string][];
  code?: { title: string; code: string }[];
  bullets?: string[];
}

export const REVISION: RevisionSection[] = [
  {
    id: "syntax",
    title: "Java syntax reference",
    rows: [
      ["Variable", "`int n = 5;` · `long big = 2L * n;` · `final double PI = 3.14;`"],
      ["String compare", "`a.equals(b)` — never `==`"],
      ["Ternary", "`int p = medical ? 3 : 1;`"],
      ["Switch", "`switch (t) { case \"air\" -> 5; default -> 1; }`"],
      ["For-each", "`for (DispatchMission m : missions) { ... }`"],
      ["List", "`List<Long> ids = new ArrayList<>(); ids.add(101L); ids.get(0); ids.size();`"],
      ["Map", "`map.put(k, v); map.get(k) // null if missing; map.containsKey(k);`"],
      ["Copy to sort", "`List<DispatchMission> l = new ArrayList<>(repo.all());`"],
      ["Integer division", "`7 / 2 == 3` · `7 / 2.0 == 3.5` · `7 % 2 == 1`"],
    ],
  },
  {
    id: "oop",
    title: "OOP cheat sheet",
    code: [
      {
        title: "Subclass template (Task 2.1 / real-paper 'create a subclass')",
        code: `package edu.practice.dispatch.model;

public class AirMission extends DispatchMission {
    private final int windPenalty;
    private final boolean critical;

    public AirMission(long id, int distanceKm, int loadKg, int windPenalty, boolean critical) {
        super(id, distanceKm, loadKg);          // FIRST line
        this.windPenalty = windPenalty;
        this.critical = critical;
    }

    public int getWindPenalty() { return windPenalty; }
    public boolean isCritical() { return critical; }

    @Override
    public int energyUnits() {
        long e = 3L * getDistanceKm() + 8L * getLoadKg() + 2L * windPenalty;
        return Math.toIntExact(e);
    }

    @Override
    public int priority() { return critical ? 5 : 2; }
}`,
      },
    ],
    rows: [
      ["Encapsulation", "private fields + public getters/setters that validate"],
      ["Inheritance", "`extends` one class; `super(...)` first in the constructor"],
      ["Abstraction", "abstract class/method: what, not how; cannot `new` it"],
      ["Polymorphism", "reference type = what you may call; object type = what runs"],
      ["Overriding", "same signature in subclass, decided at runtime, use `@Override`"],
      ["Overloading", "same name, different parameters, decided at compile time"],
      ["Interface", "`implements` many; a 'can-do' contract"],
      ["static", "belongs to the class; not polymorphic"],
      ["IS-A / HAS-A", "extends / field (composition)"],
    ],
  },
  {
    id: "spring",
    title: "Spring Boot annotations",
    rows: [
      ["@SpringBootApplication", "main class; scans its package and below"],
      ["@RestController", "HTTP class; return values → JSON"],
      ["@RequestMapping(\"/missions\")", "path prefix on the class"],
      ["@GetMapping / @PostMapping", "method + path"],
      ["@PathVariable(\"id\") long id", "from `/missions/{id}`"],
      ["@RequestParam(name=\"x\", defaultValue=\"false\")", "from `?x=...`, optional with default"],
      ["@RequestBody NewAirMission r", "JSON body → object (no-arg ctor + setters)"],
      ["@ResponseStatus(HttpStatus.CREATED)", "201 for POST create"],
      ["ResponseEntity.status(HttpStatus.NOT_FOUND).body(x)", "explicit status + body"],
      ["@Service / @Repository", "beans; injected via constructor"],
      ["@RestControllerAdvice + @ExceptionHandler(X.class)", "global error mapping"],
    ],
    code: [
      {
        title: "Controller (Task 4)",
        code: `@GetMapping("/{id}/energy")
public Map<String, Integer> energy(@PathVariable("id") long id) {
    return Map.of("energyUnits", service.energy(id));
}

@PostMapping("/air")
@ResponseStatus(HttpStatus.CREATED)
public DispatchMission addAir(@RequestBody NewAirMission request) {
    return service.addAir(request);
}

@GetMapping("/plan")
public DispatchPlan plan(@RequestParam("capacity") int capacity,
        @RequestParam(name = "urgentOnly", defaultValue = "false") boolean urgentOnly) {
    return service.plan(capacity, urgentOnly);
}`,
      },
    ],
  },
  {
    id: "exceptions",
    title: "Exception handling",
    code: [
      {
        title: "GlobalExceptionHandler (Task 3.3)",
        code: `@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MissionNotFoundException.class)
    public ResponseEntity<ErrorResponse> notFound(MissionNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("NOT_FOUND", e.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> badRequest(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("BAD_REQUEST", e.getMessage()));
    }
}`,
      },
      {
        title: "Custom exception",
        code: `public class MissionNotFoundException extends RuntimeException {
    public MissionNotFoundException(long id) { super("Mission not found: " + id); }
}`,
      },
    ],
    bullets: ["Unchecked = RuntimeException branch: no `throws` needed.", "Throw in the service, map in the handler, never try/catch in the controller.", "400 = client sent bad data · 404 = not found · 500 = our bug."],
  },
  {
    id: "sorting",
    title: "Sorting patterns",
    code: [
      {
        title: "Three keys — lambda",
        code: `list.sort((a, b) -> {
    int r = Integer.compare(b.priority(), a.priority());      // DESC
    if (r != 0) return r;
    r = Integer.compare(a.energyUnits(), b.energyUnits());    // ASC
    if (r != 0) return r;
    return Long.compare(a.getId(), b.getId());                // ASC
});`,
      },
      {
        title: "Three keys — chain",
        code: `list.sort(Comparator.comparingInt(DispatchMission::priority).reversed()
        .thenComparingInt(DispatchMission::energyUnits)
        .thenComparingLong(DispatchMission::getId));`,
      },
    ],
  },
  {
    id: "validation",
    title: "Validation patterns",
    code: [
      {
        title: "Inclusive range + duplicate check",
        code: `if (r.getId() < 1 || r.getId() > 10000)
    throw new IllegalArgumentException("ID must be between 1 and 10000.");
if (r.getLoadKg() < 0 || r.getLoadKg() > 10000)
    throw new IllegalArgumentException("loadKg must be between 0 and 10000.");
if (repo.exists(r.getId()))
    throw new IllegalArgumentException("A mission with ID " + r.getId() + " already exists.");`,
      },
      { title: "Overflow-safe arithmetic", code: `long e = 2L * getDistanceKm() + 5L * getLoadKg();\nreturn Math.toIntExact(e);   // ArithmeticException if too big` },
    ],
    bullets: ["Order: validate → duplicate → create → calculate → save → return.", "Test a-1, a, b, b+1 for every range."],
  },
  {
    id: "greedy",
    title: "Greedy algorithm template",
    code: [
      {
        title: "plan(capacity, urgentOnly)",
        code: `if (capacity <= 0) throw new IllegalArgumentException("Capacity must be greater than zero.");
List<DispatchMission> eligible = new ArrayList<>();
for (DispatchMission m : repo.all())
    if (!urgentOnly || m.priority() >= 3) eligible.add(m);
eligible.sort(/* priority DESC, energy ASC, id ASC */);

List<PlanLine> selected = new ArrayList<>();
List<Long> skipped = new ArrayList<>();
int used = 0;
for (DispatchMission m : eligible) {
    int e = m.energyUnits();
    if (e <= capacity - used) {
        selected.add(new PlanLine(m.getId(), m.getClass().getSimpleName(), m.priority(), e));
        used += e;
    } else {
        skipped.add(m.getId());           // no break!
    }
}
return new DispatchPlan(capacity, used, capacity - used, selected, skipped);`,
      },
    ],
  },
  {
    id: "errors",
    title: "Frequent errors → fixes",
    rows: [
      ["`';' expected`", "missing semicolon on that (or the previous) line"],
      ["`cannot find symbol`", "typo, missing import, wrong package, or method not on the reference type"],
      ["`missing return statement`", "a path through the method returns nothing"],
      ["`constructor X in class X cannot be applied`", "missing/incorrect `super(...)` arguments"],
      ["`unreachable statement`", "code after the TODO `throw` — delete the throw"],
      ["`does not override or implement a method`", "signature differs from the parent (typo / types)"],
      ["`X is abstract; cannot be instantiated`", "you wrote `new DispatchMission(...)`"],
      ["HTTP 500 for unknown id", "NPE from null `find`, or handler missing/not registered"],
      ["POST returns 200", "add `@ResponseStatus(HttpStatus.CREATED)`"],
      ["UnsupportedOperationException in sort", "sorting `List.copyOf` — copy into a new ArrayList"],
    ],
  },
  {
    id: "workflow",
    title: "Exam-time workflow",
    bullets: [
      "0:00 unzip → open folder with pom.xml → run untouched → Swagger at :8080/swagger-ui.html",
      "0:05 read parent class, repository API, all TODOs (10 min)",
      "Task 1 → run · Task 2 → run · Task 3 → run → SAFETY ZIP upload",
      "Task 4 → run → check B1–B6 in Swagger",
      "1:30 stop coding · 1:33 zip project folder (pom.xml + src) · open zip to check · 1:35 upload",
      "Keep the build green: stub what you cannot finish",
      "Open book (slides, Java/Spring docs). No AI. No Git.",
    ],
  },
];

export const FLASHCARDS: [string, string][] = [
  ["What must the first line of a subclass constructor be?", "`super(...)` with the parent's arguments."],
  ["Reference type vs object type?", "Reference type decides what you may call (compile time); object type decides which override runs (runtime)."],
  ["Overflow-safe `2 × d + 5 × l`?", "`Math.toIntExact(2L * d + 5L * l)`"],
  ["Sort priority descending?", "`Integer.compare(b.priority(), a.priority())`"],
  ["What does `map.get(missingKey)` return?", "`null`"],
  ["Return 201 from POST?", "`@ResponseStatus(HttpStatus.CREATED)` or `ResponseEntity.status(HttpStatus.CREATED).body(x)`"],
  ["Make a query param optional?", "`@RequestParam(name = \"urgentOnly\", defaultValue = \"false\")`"],
  ["Map an exception to 404?", "`@ExceptionHandler(MissionNotFoundException.class)` in a `@RestControllerAdvice` class returning status NOT_FOUND."],
  ["Checked or unchecked: IllegalArgumentException?", "Unchecked (RuntimeException)."],
  ["Greedy: mission doesn't fit — then what?", "Add its id to skipped and continue with the next mission."],
  ["Filtered (non-urgent) missions appear where?", "Nowhere — neither selected nor skipped."],
  ["Why no try/catch in the controller?", "It hides exceptions from the global handler; the 400/404 mapping never runs."],
  ["Why does NewAirMission need a no-arg constructor?", "Jackson creates it, then calls setters from the JSON body."],
  ["What port does the starter run on?", "8080 (application.properties) — the README's 8082 is wrong."],
  ["Who creates DispatchService?", "Spring's IoC container; injected through the controller's constructor."],
  ["What gets zipped?", "The whole project folder containing pom.xml and src."],
];
