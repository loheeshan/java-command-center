import type { Lesson } from "@/lib/curriculum/types";

/**
 * Spring lessons. Spring code cannot run in the single-file playground; their runnable
 * examples demonstrate the Java ideas underneath, and their challenges link to the
 * Exam Lab, which runs the real Spring Boot project and tests it over HTTP.
 */
export const springLessons: Lesson[] = [
  {
    id: "spring-boot-basics",
    moduleId: "m06",
    title: "Spring Boot foundations: project, annotations, JSON",
    minutes: 40,
    priority: "P0",
    skill: "spring",
    sources: [
      { kind: "university", label: "Lecture 1 — Spring Initializr, first @RestController, Swagger UI" },
      { kind: "university", label: "Lecture 7 — IoC container, component scanning, beans" },
      { kind: "mock-paper", label: "Starter project — DispatchApplication, pom.xml (Boot 4.1.1, springdoc 3.2.0)" },
    ],
    videos: [{ video: "spring", chapter: 1 }, { video: "spring", chapter: 4 }, { video: "spring", chapter: 7 }, { video: "spring", chapter: 8 }, { video: "spring", chapter: 20 }],
    what: "**Spring Boot** is a framework that starts a web server, creates your objects (**beans**) and wires them together, and converts Java objects to/from **JSON** automatically. You mark classes with annotations and Spring does the plumbing.",
    why: "Without it you would write an HTTP server, JSON parsing and object wiring by hand. With it, a method annotated `@GetMapping(\"/missions\")` becomes an endpoint in one line. It is half of the practical (Spring Boot 40 + function validation 20).",
    when: "The whole practical project: `@SpringBootApplication` main class, `@RestController`, `@Service`, `@Repository`, `@RestControllerAdvice`.",
    analogy: "Spring is a restaurant manager. You are the chef who writes recipes (methods) and labels your staff (`@Service`, `@Repository`). The manager hires one of each, introduces them to each other, takes orders from customers (HTTP), and plates the result (JSON).",
    compare: {
      lang: "Express (Node.js)",
      other: `const app = express();
app.use(express.json());
app.get("/missions", (req, res) => {
  res.json(service.all());
});
app.listen(8080);`,
      java: `@SpringBootApplication
public class DispatchApplication {
    public static void main(String[] args) {
        SpringApplication.run(DispatchApplication.class, args);
    }
}

@RestController
@RequestMapping("/missions")
public class DispatchController {
    @GetMapping
    public Collection<DispatchMission> all() { return service.all(); }
}`,
      notes: [
        "Express routes are registered by calling functions; Spring routes are **annotations** discovered at startup.",
        "`res.json(...)` → just `return` an object; Jackson serialises it using its **getters**.",
        "The port comes from `application.properties` (`server.port=8080`). The starter README says 8082, but the properties file — what actually runs — says 8080.",
        "Spring only finds classes in the main class's package **or below** (component scanning).",
      ],
    },
    syntax: {
      code: `edu.practice.dispatch
├── DispatchApplication.java     @SpringBootApplication — entry point
├── controller/DispatchController @RestController — HTTP in/out
├── service/DispatchService      @Service — business rules
├── repository/MissionRepository @Repository — storage
├── model/...                    plain classes (JSON shapes + domain)
└── exception/...                custom exceptions + @RestControllerAdvice`,
      parts: [
        { token: "@SpringBootApplication", meaning: "Turns on auto-configuration and component scanning from this package down." },
        { token: "@RestController", meaning: "This class handles HTTP; return values become the JSON response body." },
        { token: "@RequestMapping(\"/missions\")", meaning: "Prefix for every endpoint in the class." },
        { token: "@Service / @Repository", meaning: "Register the class as a bean so Spring can inject it." },
      ],
    },
    example: {
      title: "What Jackson does with your getters (plain Java simulation)",
      files: [
        {
          name: "Main.java",
          content: `import java.lang.reflect.Method;
import java.util.*;

// Spring's JSON library (Jackson) builds JSON from public getters.
// This tiny simulation shows which properties appear — and which do not.
class PlanLine {
    private final long id; private final String type; private final int priority; private final int energyUnits;
    PlanLine(long id, String type, int priority, int energyUnits) { this.id = id; this.type = type; this.priority = priority; this.energyUnits = energyUnits; }
    public long getId() { return id; }
    public String getType() { return type; }
    public int getPriority() { return priority; }
    public int getEnergyUnits() { return energyUnits; }
    public int energyTimesTwo() { return energyUnits * 2; }   // not a getter -> not in JSON
}

public class Main {
    public static void main(String[] args) throws Exception {
        PlanLine line = new PlanLine(103, "AirMission", 5, 38);
        List<String> parts = new ArrayList<>();
        Method[] methods = PlanLine.class.getDeclaredMethods();
        Arrays.sort(methods, Comparator.comparing(Method::getName));
        for (Method m : methods) {
            if (m.getName().startsWith("get") && m.getParameterCount() == 0) {
                String prop = Character.toLowerCase(m.getName().charAt(3)) + m.getName().substring(4);
                Object v = m.invoke(line);
                parts.add("\\"" + prop + "\\":" + (v instanceof String ? "\\"" + v + "\\"" : v));
            }
        }
        System.out.println("{" + String.join(",", parts) + "}");
    }
}`,
        },
      ],
      expectedOutput: "{\"energyUnits\":38,\"id\":103,\"priority\":5,\"type\":\"AirMission\"}",
      explain: "Real Jackson keeps declaration order; this simulation sorts names alphabetically. The key point: only `getX()`/`isX()` methods become JSON fields. That is why `GET /missions` shows `id`, `distanceKm`, `loadKg` but not `energyUnits()` — it is not named like a getter.",
    },
    visual: { id: "request-flow", caption: "Follow an HTTP request through the layers of the starter project." },
    body: [
      {
        heading: "Running and testing the API",
        text: "Run `DispatchApplication.main()` in IntelliJ (or `mvn spring-boot:run`). Then open **Swagger UI** at `http://localhost:8080/swagger-ui.html` to send requests. Section B markers run your ZIP and call the endpoints — so the app **must start**. Compile errors anywhere = zero Section B.",
      },
      {
        heading: "Inversion of Control in one sentence",
        text: "You never write `new DispatchService(...)` — Spring creates one instance of each bean and passes it to whoever asks via the constructor (Lecture 7: 'Stop creating your collaborators. Ask for them.').",
      },
    ],
    trace: {
      code: `public class Main {
    public static void main(String[] args) {
        String base = "/missions";
        String[] mappings = {"", "/{id}/energy", "/air", "/plan"};
        String[] methods  = {"GET", "GET", "POST", "GET"};
        for (int i = 0; i < mappings.length; i++) {
            System.out.println(methods[i] + " " + base + mappings[i]);
        }
    }
}`,
      output: "GET /missions\nGET /missions/{id}/energy\nPOST /missions/air\nGET /missions/plan",
      explanation: "`@RequestMapping(\"/missions\")` on the class is prefixed to each method mapping. A bare `@GetMapping` maps to the prefix itself.",
    },
    challenge: { examTask: "task4", text: "Open the Exam Lab and implement Task 4 — the real Spring Boot project is compiled and tested over HTTP." },
    mistakes: [
      { mistake: "Creating a controller/service in a package outside `edu.practice.dispatch`.", fix: "Component scanning only covers the main class's package and below." },
      { mistake: "Forgetting getters on a response class.", fix: "No getter → no JSON field (or an empty `{}`)." },
      { mistake: "Testing on port 8082 because the README says so.", fix: "`application.properties` sets 8080 — that wins." },
      { mistake: "Changing `pom.xml` versions in the exam.", fix: "Never. The starter is preconfigured; edits risk a project that does not build." },
    ],
    quiz: ["qs-sb-annot-1", "qs-sb-scan-1", "qs-sb-json-1", "qs-sb-port-1", "qs-sb-layers-1"],
    examQuestion: {
      prompt: "Viva: 'Who creates the `DispatchService` object, and how does the controller get it?'",
      modelAnswer: "Spring's IoC container creates it at startup because the class is annotated `@Service` and lives under the main class's package. The controller declares a constructor parameter `DispatchService service`; Spring calls that constructor and passes the managed instance (constructor injection), which is stored in a `private final` field.",
    },
    summary: [
      "`@SpringBootApplication` starts everything; scanning covers its package and below.",
      "`@RestController` methods return objects → JSON via getters.",
      "Beans: `@Service`, `@Repository`, `@RestController`, `@RestControllerAdvice`.",
      "Port 8080 (from application.properties); Swagger at /swagger-ui.html.",
      "If it does not start, Section B scores nothing.",
    ],
  },
  {
    id: "spring-rest-params",
    moduleId: "m06",
    title: "REST endpoints: @PathVariable, @RequestParam, @RequestBody and HTTP 201",
    minutes: 45,
    priority: "P0",
    skill: "rest",
    sources: [
      { kind: "university", label: "Tutorial 3 — GET by id, POST, @RequestParam search" },
      { kind: "university", label: "Lecture 6 — HTTP status codes; briefing: 'Returning 200 from POST'" },
      { kind: "mock-paper", label: "Task 4 — three REST operations" },
    ],
    videos: [{ video: "spring", chapter: 6 }, { video: "spring", chapter: 10 }, { video: "spring", chapter: 11 }],
    what: "Controller methods read input from the **path** (`@PathVariable`), the **query string** (`@RequestParam`) or the **JSON body** (`@RequestBody`), and report the outcome with an HTTP **status code**.",
    why: "Each Task 4 endpoint uses a different input style. Status codes are part of the API: POST that creates something must return **201 Created**, not the default 200.",
    when: "Task 4.1 (`/{id}/energy` path variable), 4.2 (JSON body, 201), 4.3 (`capacity` and optional `urgentOnly` query params).",
    analogy: "A delivery request: the **path** is the street address (`/missions/101`), **query params** are delivery options (`?urgentOnly=true`), the **body** is the parcel itself (JSON), and the **status code** is the courier's receipt (201 = 'created and stored').",
    compare: {
      lang: "Express",
      other: `app.get("/missions/:id/energy", (req, res) =>
  res.json({ energyUnits: service.energy(+req.params.id) }));
app.post("/missions/air", (req, res) =>
  res.status(201).json(service.addAir(req.body)));
app.get("/missions/plan", (req, res) =>
  res.json(service.plan(+req.query.capacity, req.query.urgentOnly === "true")));`,
      java: `@GetMapping("/{id}/energy")
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
      notes: [
        "`:id` → `{id}` + `@PathVariable`. Spring converts the text to `long` for you.",
        "`req.body` → `@RequestBody NewAirMission` — Jackson builds the object using its no-arg constructor and setters.",
        "`res.status(201)` → `@ResponseStatus(HttpStatus.CREATED)` or `ResponseEntity.status(HttpStatus.CREATED).body(x)`.",
        "`defaultValue = \"false\"` makes the parameter optional.",
        "`Map.of(\"energyUnits\", 39)` serialises to `{\"energyUnits\":39}` — no extra class needed.",
      ],
    },
    syntax: {
      code: `// Equivalent ways to return 201
@PostMapping("/air")
@ResponseStatus(HttpStatus.CREATED)
public DispatchMission addAir(@RequestBody NewAirMission r) { return service.addAir(r); }

@PostMapping("/air")
public ResponseEntity<DispatchMission> addAir2(@RequestBody NewAirMission r) {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.addAir(r));
}`,
      parts: [
        { token: "@PathVariable(\"id\") long id", meaning: "Binds `{id}` from the URL. Naming it explicitly avoids issues if parameter names are not compiled in." },
        { token: "@RequestParam(name=..., defaultValue=\"false\")", meaning: "Optional query parameter with a default." },
        { token: "@RequestBody", meaning: "Parse the JSON request body into this object." },
        { token: "ResponseEntity", meaning: "Full control over status, headers and body." },
      ],
    },
    example: {
      title: "HTTP status codes you need",
      files: [
        {
          name: "Main.java",
          content: `import java.util.*;

public class Main {
    enum Status {
        OK(200, "request succeeded, body returned"),
        CREATED(201, "a new resource was created (POST)"),
        BAD_REQUEST(400, "client sent invalid data"),
        NOT_FOUND(404, "the requested resource does not exist"),
        INTERNAL_SERVER_ERROR(500, "unhandled exception: our bug");

        final int code; final String meaning;
        Status(int code, String meaning) { this.code = code; this.meaning = meaning; }
    }

    public static void main(String[] args) {
        for (Status s : Status.values()) {
            System.out.println(s.code + " " + s.name() + " - " + s.meaning);
        }
    }
}`,
        },
      ],
      expectedOutput: "200 OK - request succeeded, body returned\n201 CREATED - a new resource was created (POST)\n400 BAD_REQUEST - client sent invalid data\n404 NOT_FOUND - the requested resource does not exist\n500 INTERNAL_SERVER_ERROR - unhandled exception: our bug",
      explain: "Lecture 6: a 500 tells the client 'our server crashed'. An unknown ID is the client asking for something that does not exist → 404. Invalid input → 400.",
    },
    trace: {
      code: `public class Main {
    static String route(String method, String path) {
        if (method.equals("GET") && path.equals("/missions")) return "all()";
        if (method.equals("GET") && path.matches("/missions/\\\\d+/energy")) return "energy(" + path.split("/")[2] + ")";
        if (method.equals("POST") && path.equals("/missions/air")) return "addAir(body) -> 201";
        if (method.equals("GET") && path.startsWith("/missions/plan")) return "plan(...)";
        return "404 (no mapping)";
    }
    public static void main(String[] args) {
        System.out.println(route("GET", "/missions/101/energy"));
        System.out.println(route("POST", "/missions/air"));
        System.out.println(route("GET", "/missions/air"));
    }
}`,
      output: "energy(101)\naddAir(body) -> 201\n404 (no mapping)",
      explanation: "A route matches on **method and path**. `GET /missions/air` has no GET mapping (only POST), so Spring would answer with an error instead of calling `addAir`.",
    },
    challenge: { examTask: "task4", text: "Exam Lab → Task 4: implement all three endpoints; the grader calls them over real HTTP." },
    mistakes: [
      { mistake: "POST returns 200.", fix: "Add `@ResponseStatus(HttpStatus.CREATED)` (Lecture 6 time-loser)." },
      { mistake: "`urgentOnly` required → `GET /missions/plan?capacity=60` fails with 400.", fix: "`defaultValue = \"false\"`." },
      { mistake: "Putting validation logic in the controller.", fix: "Controllers only delegate. Validation lives in the service." },
      { mistake: "Mapping `/missions/{id}/energy` as `/{id}/energy` on a class without `@RequestMapping(\"/missions\")`.", fix: "Keep the supplied class-level mapping." },
    ],
    quiz: ["qs-rest-path-1", "qs-rest-param-1", "qs-rest-body-1", "qs-rest-201-1", "qs-rest-status-1", "qs-rest-complete-1"],
    examQuestion: {
      prompt: "Write the controller method for `GET /missions/plan?capacity=60&urgentOnly=false` (urgentOnly optional).",
      modelAnswer: "```java\n@GetMapping(\"/plan\")\npublic DispatchPlan plan(@RequestParam(\"capacity\") int capacity,\n        @RequestParam(name = \"urgentOnly\", defaultValue = \"false\") boolean urgentOnly) {\n    return service.plan(capacity, urgentOnly);\n}\n```",
    },
    summary: [
      "Path → `@PathVariable`; query → `@RequestParam`; JSON → `@RequestBody`.",
      "POST create → 201 via `@ResponseStatus(HttpStatus.CREATED)` or `ResponseEntity`.",
      "Optional params need `defaultValue`.",
      "`Map.of(\"energyUnits\", value)` → `{\"energyUnits\":39}`.",
      "Controllers delegate; services decide.",
    ],
  },
  {
    id: "spring-layers-di",
    moduleId: "m06",
    title: "Layers and constructor dependency injection",
    minutes: 30,
    priority: "P0",
    skill: "spring",
    sources: [
      { kind: "university", label: "Lecture 3 — service layer, cohesion and coupling" },
      { kind: "university", label: "Lecture 7 — constructor injection: one constructor, final fields, no @Autowired" },
    ],
    videos: [{ video: "spring", chapter: 13 }],
    what: "The starter uses **layers**: Controller (HTTP) → Service (rules) → Repository (storage) → Model (data). Each layer receives the layer below through its **constructor** — Spring supplies the instance (**dependency injection**).",
    why: "Each class has one job (high cohesion) and depends on few others (low coupling). You can test the service without HTTP, and replace the repository without touching controllers.",
    when: "Reading any unfamiliar starter project on exam day: find the controller, follow the service call, see what the repository offers. You will **read** injection code, not write it (Lecture 6 briefing).",
    analogy: "A restaurant: waiter (controller) takes the order, chef (service) cooks by the recipe rules, pantry (repository) stores ingredients. The waiter never cooks; the chef never takes payment.",
    compare: {
      lang: "NestJS / TypeScript",
      other: `@Injectable()
export class DispatchService {
  constructor(private readonly repo: MissionRepository) {}
}`,
      java: `@Service
public class DispatchService {
    private final MissionRepository repo;
    public DispatchService(MissionRepository repo) {
        this.repo = repo;
    }
}`,
      notes: [
        "Exactly NestJS's constructor injection pattern.",
        "With a single constructor, `@Autowired` is optional (Lecture 7: 'no @Autowired annotation. That is the entire pattern').",
        "`final` ensures the dependency is set once and never null after construction.",
      ],
    },
    syntax: {
      code: `@RestController
public class DispatchController {
    private final DispatchService service;               // dependency
    public DispatchController(DispatchService service) { // injected by Spring
        this.service = service;
    }
}`,
      parts: [
        { token: "private final DispatchService service", meaning: "The collaborator, set once." },
        { token: "public DispatchController(DispatchService service)", meaning: "Spring sees the parameter type and passes the managed bean." },
      ],
    },
    example: {
      title: "Manual wiring = what Spring does for you",
      files: [
        {
          name: "Main.java",
          content: `import java.util.*;

class Repo {
    private final Map<Long, String> map = new HashMap<>(Map.of(101L, "Ground"));
    String find(long id) { return map.get(id); }
}

class Service {
    private final Repo repo;
    Service(Repo repo) { this.repo = repo; }
    String describe(long id) {
        String m = repo.find(id);
        if (m == null) throw new IllegalArgumentException("Mission not found: " + id);
        return "Mission " + id + " is " + m;
    }
}

class Controller {
    private final Service service;
    Controller(Service service) { this.service = service; }
    String get(long id) { return service.describe(id); }
}

public class Main {
    public static void main(String[] args) {
        // Spring does these three lines for you at startup:
        Repo repo = new Repo();
        Service service = new Service(repo);
        Controller controller = new Controller(service);

        System.out.println(controller.get(101));
    }
}`,
        },
      ],
      expectedOutput: "Mission 101 is Ground",
    },
    trace: {
      code: `class Repo { Repo() { System.out.println("Repo created"); } }
class Service { Service(Repo r) { System.out.println("Service created with repo"); } }
class Controller { Controller(Service s) { System.out.println("Controller created with service"); } }
public class Main {
    public static void main(String[] args) {
        new Controller(new Service(new Repo()));
    }
}`,
      output: "Repo created\nService created with repo\nController created with service",
      explanation: "Arguments are evaluated before the constructor runs, so the deepest dependency is created first — the same order Spring uses (it must build the repository before the service that needs it).",
    },
    challenge: { examTask: "task3", text: "Exam Lab → Task 3: implement `energy(id)` and `addAir(...)` in the service using the injected repository." },
    mistakes: [
      { mistake: "`new DispatchService(new MissionRepository())` inside the controller.", fix: "That creates a second repository with separate data. Use the injected `service`." },
      { mistake: "Putting `List` storage in the service.", fix: "Storage belongs to the repository; the service uses its API." },
      { mistake: "Changing the repository API (e.g. adding `delete`).", fix: "The paper: do not replace the supplied repository API unless instructed." },
    ],
    quiz: ["qs-di-1", "qs-di-2", "qs-layers-order-1", "qs-di-new-1"],
    examQuestion: {
      prompt: "Why is calling `new MissionRepository()` inside `DispatchService` wrong, even though it compiles?",
      modelAnswer: "Spring already manages one `MissionRepository` bean shared by the app. Creating another with `new` gives the service a separate map: missions POSTed through one instance are invisible to the other, and the class becomes tightly coupled and hard to test. The service should receive the repository through its constructor.",
    },
    summary: [
      "Controller → Service → Repository → Model.",
      "Constructor injection: one constructor, `final` fields.",
      "Never `new` a Spring bean yourself.",
      "Read injection code; do not rewrite it.",
    ],
  },
  {
    id: "spring-exception-handling",
    moduleId: "m06",
    title: "Global exception handling: 400 and 404 with ErrorResponse",
    minutes: 35,
    priority: "P0",
    skill: "rest",
    sources: [
      { kind: "university", label: "Lecture 6 — the 500 problem, @ControllerAdvice/@ExceptionHandler, one place for every error" },
      { kind: "mock-paper", label: "Task 3.3 — map IllegalArgumentException → 400 BAD_REQUEST, MissionNotFoundException → 404 NOT_FOUND" },
    ],
    what: "A class annotated `@RestControllerAdvice` (or `@ControllerAdvice`) holds `@ExceptionHandler` methods. When a controller (or anything it calls) throws, Spring finds the matching handler and returns its response instead of a 500.",
    why: "Lecture 6: 'An error is a response, not an accident.' Without a handler, an unknown ID gives a 500 with a stack trace. With one, the client receives a designed body: `{\"code\":\"NOT_FOUND\",\"message\":\"Mission not found: 999\"}`.",
    when: "Task 3.3 and check B5. The real paper shape (per the briefing) also has a 404 task and a 400 task.",
    analogy: "A hotel front desk: whatever goes wrong in any room, guests are told politely at one desk, using a standard form — not by a maintenance worker shouting technical details.",
    compare: {
      lang: "Express",
      other: `app.use((err, req, res, next) => {
  if (err instanceof MissionNotFound)
    return res.status(404).json({ code: "NOT_FOUND", message: err.message });
  if (err instanceof RangeError)
    return res.status(400).json({ code: "BAD_REQUEST", message: err.message });
  next(err);
});`,
      java: `@RestControllerAdvice
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
      notes: [
        "Express error middleware ≈ `@RestControllerAdvice`. Spring dispatches by exception type — no `instanceof` chain.",
        "The starter already has `@RestControllerAdvice` on the class; you add the methods.",
        "`@RestControllerAdvice` = `@ControllerAdvice` + `@ResponseBody`. With `ResponseEntity` both work (the official solution uses `@ControllerAdvice`).",
        "Alternative: `@ResponseStatus(HttpStatus.NOT_FOUND)` on the handler method + return `ErrorResponse`.",
      ],
    },
    syntax: {
      code: `@ExceptionHandler(MissionNotFoundException.class)    // which exception
@ResponseStatus(HttpStatus.NOT_FOUND)                  // which status
public ErrorResponse handleNotFound(MissionNotFoundException e) {
    return new ErrorResponse("NOT_FOUND", e.getMessage());   // which body
}`,
      parts: [
        { token: "@ExceptionHandler(X.class)", meaning: "Handles X and its subclasses thrown from any controller." },
        { token: "@ResponseStatus / ResponseEntity.status", meaning: "Sets the HTTP status of the error response." },
        { token: "new ErrorResponse(code, message)", meaning: "The supplied body class: `code` and a descriptive `message`." },
      ],
    },
    example: {
      title: "How exception-type dispatch works (plain Java)",
      files: [
        {
          name: "Main.java",
          content: `class MissionNotFoundException extends RuntimeException {
    MissionNotFoundException(long id) { super("Mission not found: " + id); }
}

public class Main {
    // What Spring does around your controller call
    static String handle(Runnable controllerCall) {
        try {
            controllerCall.run();
            return "200 OK";
        } catch (MissionNotFoundException e) {
            return "404 {\\"code\\":\\"NOT_FOUND\\",\\"message\\":\\"" + e.getMessage() + "\\"}";
        } catch (IllegalArgumentException e) {
            return "400 {\\"code\\":\\"BAD_REQUEST\\",\\"message\\":\\"" + e.getMessage() + "\\"}";
        } catch (RuntimeException e) {
            return "500 Internal Server Error";
        }
    }

    public static void main(String[] args) {
        System.out.println(handle(() -> {}));
        System.out.println(handle(() -> { throw new MissionNotFoundException(999); }));
        System.out.println(handle(() -> { throw new IllegalArgumentException("Capacity must be greater than zero."); }));
        System.out.println(handle(() -> { throw new NullPointerException(); }));
    }
}`,
        },
      ],
      expectedOutput: "200 OK\n404 {\"code\":\"NOT_FOUND\",\"message\":\"Mission not found: 999\"}\n400 {\"code\":\"BAD_REQUEST\",\"message\":\"Capacity must be greater than zero.\"}\n500 Internal Server Error",
      explain: "This simulation uses try/catch to show the idea. In Spring you write **no** try/catch: the `@ExceptionHandler` methods play the role of these catch blocks, for every controller at once.",
    },
    visual: { id: "request-flow", caption: "Choose 'unknown mission' or 'invalid capacity' to see the error path." },
    trace: {
      code: `public class Main {
    static int status(Exception e) {
        if (e instanceof IllegalArgumentException) return 400;
        if (e instanceof RuntimeException) return 500;
        return 500;
    }
    public static void main(String[] args) {
        System.out.println(status(new NumberFormatException("abc")));
        System.out.println(status(new IllegalStateException("x")));
        System.out.println(status(new IllegalArgumentException("y")));
    }
}`,
      output: "400\n500\n400",
      explanation: "`NumberFormatException` is a **subclass** of `IllegalArgumentException`, so an IAE handler also catches it. `IllegalStateException` is a different branch → 500. Handlers match subclasses too.",
    },
    challenge: { examTask: "task3", text: "Exam Lab → Task 3.3: complete GlobalExceptionHandler; the grader sends bad requests and checks 400/404 and the JSON body." },
    mistakes: [
      { mistake: "Handler class exists but has no `@RestControllerAdvice`/`@ControllerAdvice`.", fix: "Without it the class is never registered and you still get 500s (Lecture 6)." },
      { mistake: "Returning `ErrorResponse` without setting a status.", fix: "Defaults to 200 — the paper says never return 200 for an error." },
      { mistake: "Wrong code strings (`Not Found`).", fix: "Exactly `BAD_REQUEST` and `NOT_FOUND`." },
      { mistake: "Handler outside the scanned packages.", fix: "Keep it in `edu.practice.dispatch.exception`." },
    ],
    quiz: ["qs-handler-1", "qs-handler-2", "qs-handler-status-1", "qs-handler-500-1", "qs-handler-complete-1"],
    examQuestion: {
      prompt: "`GET /missions/999/energy` returns HTTP 500. List the checks you would make, in order.",
      modelAnswer: "1) Does `energy(id)` throw `MissionNotFoundException` when `repo.find(id)` is null (not a NullPointerException)? 2) Does `GlobalExceptionHandler` have the class-level `@RestControllerAdvice`/`@ControllerAdvice`? 3) Is there an `@ExceptionHandler(MissionNotFoundException.class)` method setting 404? 4) Is the handler in the `exception` package under the main package? 5) Is there a try/catch in the controller swallowing it?",
    },
    summary: [
      "`@RestControllerAdvice` + `@ExceptionHandler(X.class)` = one place for errors.",
      "IAE → 400 `BAD_REQUEST`; MissionNotFoundException → 404 `NOT_FOUND`.",
      "Always set the status; include `e.getMessage()`.",
      "No try/catch in controllers.",
    ],
  },
];
