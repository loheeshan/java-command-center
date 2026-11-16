/**
 * Exam-coverage map: every assessable topic found in the supplied materials
 * (LBP guidance, Lectures 1–7, Tutorials 1–5, Week05 code, the mock paper and the Lecture 6 briefing),
 * where it is taught here, and an honest status.
 */
export type CoverageStatus = "covered" | "partial" | "gap" | "out-of-scope";

export interface CoverageRow {
  topic: string;
  source: string;
  status: CoverageStatus;
  where: { label: string; href: string }[];
  note?: string;
}

export interface CoverageGroup {
  title: string;
  marks: string;
  rows: CoverageRow[];
}

const l = (id: string, label: string) => ({ label, href: `/learn/${id}` });
const TICKETS = { label: "Ticketing lab", href: "/exam/tickets" };
const DISPATCH = { label: "Dispatch lab", href: "/exam" };

export const COVERAGE: CoverageGroup[] = [
  {
    title: "Object-Oriented Programming",
    marks: "40 marks",
    rows: [
      { topic: "Classes, objects, fields, `this`, references", source: "Week 01, Lecture 1", status: "covered", where: [l("classes-objects", "lesson"), { label: "memory visualizer", href: "/oop-lab#memory" }] },
      { topic: "Constructors (full + no-arg), access modifiers, getters/setters, encapsulation", source: "Lecture 2, Tutorial 2", status: "covered", where: [l("constructors-encapsulation", "lesson")] },
      { topic: "Inheritance: `extends`, `super(...)`, IS-A vs HAS-A", source: "Lecture 4, Tutorial 4, Week05", status: "covered", where: [l("inheritance-super", "lesson"), TICKETS, DISPATCH] },
      { topic: "Abstract classes/methods, `@Override`, overriding vs overloading", source: "Lecture 5, Tutorial 5", status: "covered", where: [l("abstract-overriding", "lesson"), TICKETS] },
      { topic: "Polymorphism — no `instanceof` chains; `getSummary()`-style overrides", source: "Lecture 5, mock briefing", status: "covered", where: [l("polymorphism", "lesson"), TICKETS] },
      { topic: "Interfaces (`Discountable`) and enums", source: "Lecture 5, Tutorial 5, Week05", status: "covered", where: [l("interfaces-enums", "lesson")] },
      { topic: "Static vs instance members", source: "Week05, general", status: "partial", where: [l("polymorphism", "section in polymorphism lesson")], note: "Explained with one example and a quiz; no dedicated challenge." },
      { topic: "UML class diagrams ↔ code", source: "Lectures 2 & 4", status: "covered", where: [l("uml-class-diagrams", "lesson")], note: "Mostly relevant to the coursework report and the viva." },
      { topic: "Collections: List, ArrayList, Map, HashMap, generics", source: "Lecture 3", status: "covered", where: [l("collections-generics", "lesson")] },
      { topic: "Sorting with Comparator (multi-key)", source: "Mock paper Task 2.3", status: "covered", where: [l("comparator-sorting", "lesson"), { label: "sorting visualizer", href: "/algorithms#sorting" }] },
      { topic: "Streams and Optional (filter, map, findFirst, orElseThrow)", source: "Lecture 6, Tutorial 3", status: "covered", where: [l("rest-crud-extras", "lesson")], note: "At the level the lectures use — not the full Streams API." },
      { topic: "Exceptions: checked vs unchecked, custom exceptions, try/catch/finally", source: "Lecture 6", status: "covered", where: [l("exceptions-validation", "lesson")] },
      { topic: "Validation with boundaries; overflow with long + Math.toIntExact", source: "Mock paper Tasks 1–3", status: "covered", where: [l("overflow-long", "lesson"), DISPATCH] },
      { topic: "Algorithms from a written spec (filter → sort → greedy)", source: "LBP guidance (higher-difficulty marks), mock paper", status: "covered", where: [l("greedy-dispatch", "lesson"), { label: "greedy visualizer", href: "/algorithms" }] },
      { topic: "toString(), equals()/hashCode()", source: "Not in Lectures 1–7", status: "gap", where: [{ label: "Bro Code ch. 47 (toString)", href: "/resources?v=java&t=27968&end=28318" }], note: "Not taught in your lectures or used in the mock; low priority, but know that `==` on objects compares identity." },
    ],
  },
  {
    title: "Spring Boot",
    marks: "40 marks",
    rows: [
      { topic: "Project structure, `@SpringBootApplication`, component scanning, JSON via getters", source: "Lectures 1 & 7", status: "covered", where: [l("spring-boot-basics", "lesson"), { label: "starter explorer", href: "/spring-boot#explorer" }] },
      { topic: "`@RestController`, `@GetMapping`, `@PostMapping`, `@RequestMapping`", source: "Lectures 1 & 3, Tutorial 3", status: "covered", where: [l("spring-rest-params", "lesson"), TICKETS, DISPATCH] },
      { topic: "`@PathVariable`, `@RequestParam` (defaults), `@RequestBody`", source: "Tutorial 3, mock paper", status: "covered", where: [l("spring-rest-params", "lesson")] },
      { topic: "GET by id, POST → 201, DELETE → 204", source: "Mock briefing, Lecture 6 stretch task", status: "covered", where: [l("rest-crud-extras", "lesson"), TICKETS], note: "DELETE is taught but not graded by a practice project." },
      { topic: "`@PutMapping` (update)", source: "Not in Lectures 1–7", status: "gap", where: [{ label: "Spring course ch. 12", href: "/resources?v=spring&t=6522&end=6733" }], note: "Not in the briefing's task list. If needed it follows the POST pattern: `@PutMapping(\"/{id}\")` + `@PathVariable` + `@RequestBody`." },
      { topic: "`@Service`, `@Repository`, constructor injection, layering", source: "Lectures 3 & 7", status: "covered", where: [l("spring-layers-di", "lesson"), { label: "request flow", href: "/spring-boot#flow" }] },
      { topic: "Repository as an interface + in-memory implementation", source: "Lecture 7", status: "partial", where: [l("interfaces-enums", "interfaces lesson"), l("spring-layers-di", "layers lesson")], note: "Both practice projects use a concrete repository class, as the mock starters do." },
      { topic: "Status codes 200/201/204/400/404/500 and `ResponseEntity`", source: "Lecture 6", status: "covered", where: [l("spring-rest-params", "lesson"), l("spring-exception-handling", "lesson")] },
      { topic: "`@RestControllerAdvice` / `@ExceptionHandler` → 404 and 400", source: "Lecture 6, mock briefing Tasks 3 & 5", status: "covered", where: [l("spring-exception-handling", "lesson"), TICKETS, DISPATCH] },
      { topic: "Swagger UI to test endpoints", source: "Lecture 1, Tutorial 1", status: "partial", where: [l("spring-boot-basics", "lesson notes")], note: "The labs test over HTTP for you. In IntelliJ, run the app and practise using /swagger-ui.html yourself." },
      { topic: "Bean Validation (`@Valid`, `@NotBlank`)", source: "Not in Lectures 1–7", status: "out-of-scope", where: [], note: "The mock asks for manual checks that throw exceptions; that is what is taught here." },
      { topic: "Databases/JPA, security, Docker", source: "Not in Lectures 1–7", status: "out-of-scope", where: [], note: "Coursework topics, not the practical." },
    ],
  },
  {
    title: "Function validation (running application)",
    marks: "20 marks",
    rows: [
      { topic: "App compiles and starts; endpoints return the right status and JSON", source: "LBP guidance, mock Section B", status: "covered", where: [TICKETS, DISPATCH], note: "Both labs run real HTTP checks against your code — 6 Section B checks each." },
    ],
  },
  {
    title: "Exam skills",
    marks: "how you earn the marks",
    rows: [
      { topic: "Reading unfamiliar starter code quickly", source: "LBP guidance §5", status: "covered", where: [l("starter-project-tour", "lesson"), { label: "explorer", href: "/spring-boot#explorer" }] },
      { topic: "100-minute timing, safety ZIP, submission", source: "Lecture 6 slides 37–42", status: "covered", where: [l("exam-strategy", "lesson"), { label: "simulator", href: "/exam/simulator" }] },
      { topic: "Working in IntelliJ with Java 25 + Maven", source: "Week 01 notices, mock README", status: "partial", where: [l("java-quickstart", "setup notes")], note: "This app's editor is not IntelliJ. Do at least one mock in IntelliJ: open the starter in materials/OOP-26/WEEK-08 and set the JDK to the Java 25 in .tools/." },
      { topic: "Viva: explaining your code", source: "LBP guidance §8", status: "partial", where: [{ label: "exam questions in every lesson", href: "/learn" }], note: "Model answers to explain aloud; there is no interactive viva simulator." },
      { topic: "The other two sample assessments", source: "LBP guidance §6 (\"three sample assessments\")", status: "gap", where: [], note: "Only the MODERATE mock is in OOP-26.rar. Download the other two from Blackboard — they can be added to the Exam Lab." },
    ],
  },
];
