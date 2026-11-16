/**
 * Task text from MODERATE_Mock_Practice_Paper.docx (Emergency Dispatch Energy Planner API),
 * condensed. Hints and lesson links are supplemental.
 */
export interface PaperTask {
  id: string;
  title: string;
  marks: number;
  requirements: string[];
  files: string[];
  hints: string[];
  lessons: string[];
}

const P = "src/main/java/edu/practice/dispatch/";
export const DISPATCH_BASE = P;

export const PAPER_TASKS: PaperTask[] = [
  {
    id: "task1",
    title: "Task 1 — Complete GroundMission methods",
    marks: 18,
    requirements: [
      "1.1 (12) Implement `energyUnits()`: `2 × distanceKm + 5 × loadKg`. Use `long` for intermediate arithmetic and convert safely to `int`; no silent overflow.",
      "1.2 (6) Implement `priority()`: medical → 3, otherwise → 1. Correctly override the abstract parent method.",
      "The constructor and `isMedical()` are already complete.",
    ],
    files: [P + "model/GroundMission.java", P + "model/DispatchMission.java"],
    hints: ["Delete the `throw new UnsupportedOperationException(...)` lines.", "`long energy = 2L * getDistanceKm() + 5L * getLoadKg(); return Math.toIntExact(energy);`", "`return medical ? 3 : 1;` — `medical` is a field of this class, so you can read it directly."],
    lessons: ["abstract-overriding", "overflow-long"],
  },
  {
    id: "task2",
    title: "Task 2 — AirMission and dispatch planning",
    marks: 22,
    requirements: [
      "2.1 (7) Create `AirMission` in the model package extending `DispatchMission`, with `windPenalty` and `critical` fields, a constructor using `super(...)`, and getters.",
      "2.2 (7) Override both abstract methods. Energy = `3 × distanceKm + 8 × loadKg + 2 × windPenalty` (long → safe int). Priority 5 if critical, else 2.",
      "Seed `AirMission(103, 8, 1, 3, true)` in the repository's seed section (no duplicate GroundMissions).",
      "2.3 (8) `DispatchService.plan(capacity, urgentOnly)`: urgentOnly keeps only priority ≥ 3; sort priority DESC, energy ASC, ID ASC; traverse everything; select if it fits, else add the ID to skipped and continue. Filtered missions appear in neither list. No concrete subclass type checks.",
      "`DispatchPlan.selected` holds `PlanLine(id, type, priority, energyUnits)`; `skipped` holds IDs.",
    ],
    files: [P + "model/AirMission.java", P + "repository/MissionRepository.java", P + "service/DispatchService.java", P + "model/DispatchPlan.java", P + "model/PlanLine.java"],
    hints: [
      "Use the New file button: `model/AirMission.java`, package `edu.practice.dispatch.model`.",
      "Constructor: `super(id, distanceKm, loadKg);` first, then assign the two own fields.",
      "Copy `repo.all()` into a new `ArrayList` while filtering — `all()` returns an unmodifiable list.",
      "Fits test: `energy <= capacity - used`. The else branch adds to skipped (no break).",
      "PlanLine type: `mission.getClass().getSimpleName()`.",
    ],
    lessons: ["inheritance-super", "polymorphism", "comparator-sorting", "greedy-dispatch"],
  },
  {
    id: "task3",
    title: "Task 3 — Validation, lookup and error handling",
    marks: 20,
    requirements: [
      "3.1 (6) `energy(id)` returns `energyUnits()` for the mission; unknown ID → `MissionNotFoundException`.",
      "3.2 (7) `addAir(NewAirMission)`: ID 1–10,000; distanceKm 1–10,000; loadKg 0–10,000; windPenalty 0–10,000; reject duplicate IDs; calculate energy before saving; never save invalid missions; invalid → `IllegalArgumentException`.",
      "3.3 (7) Reject capacity ≤ 0. In `GlobalExceptionHandler`: `IllegalArgumentException` → 400 with `ErrorResponse(\"BAD_REQUEST\", message)`; `MissionNotFoundException` → 404 with `NOT_FOUND`. Never 200 for an error.",
    ],
    files: [P + "service/DispatchService.java", P + "exception/GlobalExceptionHandler.java", P + "exception/MissionNotFoundException.java", P + "exception/ErrorResponse.java", P + "model/NewAirMission.java"],
    hints: [
      "`DispatchMission m = repo.find(id); if (m == null) throw new MissionNotFoundException(id);`",
      "Range check pattern: `if (x < 1 || x > 10000) throw new IllegalArgumentException(\"...\");`",
      "Handler method: `@ExceptionHandler(MissionNotFoundException.class) public ResponseEntity<ErrorResponse> nf(MissionNotFoundException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(\"NOT_FOUND\", e.getMessage())); }`",
      "The starter's handler file already imports `org.springframework.http.*` and `web.bind.annotation.*`.",
    ],
    lessons: ["exceptions-validation", "spring-exception-handling", "collections-generics"],
  },
  {
    id: "task4",
    title: "Task 4 — Expose three REST operations",
    marks: 20,
    requirements: [
      "4.1 (5) `GET /missions/{id}/energy` → `{\"energyUnits\":39}` for mission 101.",
      "4.2 (5) `POST /missions/air` accepts a `NewAirMission` JSON body and returns **201 Created** with the created AirMission.",
      "4.3 (10) `GET /missions/plan?capacity=60&urgentOnly=false` returns a `DispatchPlan`; `urgentOnly` defaults to false.",
      "Keep the supplied `GET /missions`. Controllers delegate to `DispatchService`.",
    ],
    files: [P + "controller/DispatchController.java"],
    hints: [
      "`@GetMapping(\"/{id}/energy\") public Map<String, Integer> energy(@PathVariable(\"id\") long id) { return Map.of(\"energyUnits\", service.energy(id)); }`",
      "`@PostMapping(\"/air\") @ResponseStatus(HttpStatus.CREATED)` — the controller already imports `org.springframework.http.*`.",
      "`@RequestParam(name = \"urgentOnly\", defaultValue = \"false\") boolean urgentOnly`",
    ],
    lessons: ["spring-rest-params", "spring-boot-basics"],
  },
  {
    id: "sectionB",
    title: "Section B — Functional checks (running application)",
    marks: 20,
    requirements: [
      "B1 GroundMission 101: 39 energy, priority 3 (3)",
      "B2 AirMission 103: 38 energy, priority 5 (3)",
      "B3 capacity 60 → selected [103,102], skipped [101] (3)",
      "B4 capacity 60, urgentOnly → selected [103], skipped [101], 102 in neither (3)",
      "B5 capacity ≤ 0 / invalid POST → 400 BAD_REQUEST; unknown ID → 404 NOT_FOUND (4)",
      "B6 POST 104 → 201; GET /missions includes 104; capacity 125 → [103,101,104,102], used 125, remaining 0 (4)",
    ],
    files: [],
    hints: ["Section B is only scored when the whole application compiles and starts."],
    lessons: ["spring-boot-basics", "exam-strategy"],
  },
];

const T = "src/main/java/edu/practice/tickets/";
export const TICKETS_BASE = T;

/** Original practice paper in the shape of the Lecture 6 mock briefing (marks 18/22/16/14/10 + 20). */
export const TICKET_TASKS: PaperTask[] = [
  {
    id: "task1",
    title: "Task 1 — Complete StandardTicket",
    marks: 18,
    requirements: [
      "Add a `private String seatRow` field and `getSeatRow()`.",
      "Add a constructor `(Long id, String eventName, double basePrice, String seatRow)` that calls `super(id, eventName, basePrice)` and then sets `seatRow`.",
      "Implement `getSummary()` → `\"Standard: <eventName>, row <seatRow>\"`, e.g. `Standard: Jazz Night, row C`.",
      "In the repository seeds, give ticket 1 row `\"C\"` and ticket 2 row `\"F\"`.",
    ],
    files: [T + "model/StandardTicket.java", T + "model/Ticket.java", T + "repository/TicketRepository.java"],
    hints: ["`eventName` is private in Ticket — use `getEventName()`.", "`super(id, eventName, basePrice);` must be the first line.", "Remember `@Override` on `getSummary()`."],
    lessons: ["inheritance-super", "abstract-overriding"],
  },
  {
    id: "task2",
    title: "Task 2 — Create VipTicket",
    marks: 22,
    requirements: [
      "Create `model/VipTicket.java` extending `Ticket`, with a `private boolean loungeAccess` field and `isLoungeAccess()`.",
      "Two constructors: a public no-arg one (needed for JSON) and `(Long id, String eventName, double basePrice, boolean loungeAccess)` using `super(...)`.",
      "`getSummary()` → `\"VIP: <eventName>, lounge access\"` or `\"VIP: <eventName>, no lounge\"`.",
      "Seed `new VipTicket(3L, \"Jazz Night\", 120.0, true)` in the repository.",
    ],
    files: [T + "model/VipTicket.java", T + "repository/TicketRepository.java"],
    hints: ["Use New class → model → `VipTicket`.", "The no-arg constructor can simply call `super();` (Ticket has a protected no-arg constructor).", "`return loungeAccess ? \"VIP: \" + getEventName() + \", lounge access\" : \"VIP: \" + getEventName() + \", no lounge\";`"],
    lessons: ["inheritance-super", "polymorphism"],
  },
  {
    id: "task3",
    title: "Task 3 — Not found → 404",
    marks: 16,
    requirements: [
      "Create `exception/TicketNotFoundException` (unchecked) whose message names the id, e.g. `Ticket not found with id 999`.",
      "`TicketService.getById(id)` returns the ticket or throws it — the repository returns `Optional<Ticket>`.",
      "Add an `@ExceptionHandler` in `GlobalExceptionHandler` returning **404** with `new ErrorResponse(404, message)`.",
    ],
    files: [T + "service/TicketService.java", T + "exception/GlobalExceptionHandler.java", T + "exception/ErrorResponse.java", T + "repository/TicketRepository.java"],
    hints: ["`extends RuntimeException` and `super(\"Ticket not found with id \" + id);`", "`return repository.findById(id).orElseThrow(() -> new TicketNotFoundException(id));`", "`return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(404, e.getMessage()));`"],
    lessons: ["rest-crud-extras", "spring-exception-handling", "exceptions-validation"],
  },
  {
    id: "task4",
    title: "Task 4 — Two endpoints",
    marks: 14,
    requirements: [
      "`GET /tickets/{id}` returns one ticket (200) — unknown ids reach your 404 handler.",
      "`POST /tickets/vip` takes a `NewVipTicket` JSON body, creates a `VipTicket` with a null id, saves it (the repository assigns the id) and returns it with **201 Created**.",
      "No try/catch in the controller.",
    ],
    files: [T + "controller/TicketController.java", T + "service/TicketService.java", T + "model/NewVipTicket.java"],
    hints: ["`@GetMapping(\"/{id}\") public Ticket one(@PathVariable(\"id\") Long id)`", "`@PostMapping(\"/vip\") @ResponseStatus(HttpStatus.CREATED)`", "In the service: `return repository.save(new VipTicket(null, r.getEventName(), r.getBasePrice(), r.isLoungeAccess()));`"],
    lessons: ["spring-rest-params", "rest-crud-extras"],
  },
  {
    id: "task5",
    title: "Task 5 — Invalid data → 400",
    marks: 10,
    requirements: [
      "Create `exception/InvalidTicketException` (unchecked).",
      "In `createVip`, reject a missing/blank `eventName` and a `basePrice` that is ≤ 0 or > 10000 — **before** saving anything.",
      "Write a second handler from scratch: `InvalidTicketException` → **400** with an `ErrorResponse` message.",
    ],
    files: [T + "service/TicketService.java", T + "exception/GlobalExceptionHandler.java"],
    hints: ["`if (r.getEventName() == null || r.getEventName().isBlank()) throw new InvalidTicketException(\"eventName must not be blank.\");`", "Price rule: `if (r.getBasePrice() <= 0 || r.getBasePrice() > 10000) ...`", "Copy the shape of your 404 handler, change the type and status."],
    lessons: ["exceptions-validation", "spring-exception-handling"],
  },
  {
    id: "sectionB",
    title: "Section B — Functional checks",
    marks: 20,
    requirements: [
      "B1 GET /tickets → 200 with seeds 1, 2, 3; Standard and VIP summaries read differently (4)",
      "B2 GET /tickets/3 → 200 (3)",
      "B3 unknown id → 404, not 500 and not an empty 200 (3)",
      "B4 the 404 body's message names the missing id (3)",
      "B5 valid POST → 201, saved with a new id, retrievable by GET (4)",
      "B6 invalid POST → 400 with a message, and nothing saved (3)",
    ],
    files: [],
    hints: ["Section B only runs when the whole application compiles and starts."],
    lessons: ["spring-boot-basics", "exam-strategy"],
  },
];
