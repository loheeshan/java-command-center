# Source Inventory

Everything here was inspected directly from `OOP-26.rar` (extracted unchanged into `materials/OOP-26/`).
Text extracts used during analysis are in `materials/text/`. Nothing in this inventory is assumed.

> **Note on the brief:** the master prompt listed `MODERATE_Mock_Practice_Paper.docx` as a separate file.
> It was not in the repository root; it was found inside the RAR at
> `WEEK-08/Mock-exam/MODERATE_Mock_Practice_Paper.docx`.

## Archive contents

| Week | File | Type | Main concepts | Exam relevance |
|---|---|---|---|---|
| 01 | `Lecture1_OOP_Lecture.pdf` (40 slides) | Lecture | Module overview, assessment (40% LBP / 60% coursework), Java recap, Product class, Spring Initializr, first `@RestController`/`@GetMapping`, Git, Swagger UI | Medium: project shape, Swagger |
| 01 | `5COSC019C_Week_01_OOP_Lecture.pptx`, `..._Lecture_Notes.docx` | Lecture + notes | Sequential → structured → OOP using a `Circle`; class vs object; UML; `private`; setter validation with `IllegalArgumentException`; `this.radius`; constructors | High: fundamentals |
| 01 | `Week_01_OOP_Important_Notices_and_Learning_Guide.docx` | Guide | Assessment weights, viva rules, IntelliJ, Circle learning guide, 15 concept-check questions | High: rules + viva |
| 01 | `Week_01_Tutorial_Java_Refresher.docx` | Tutorial | Variables, `Scanner`, operators (`5/2`), if/else, loops, methods, arrays | Medium |
| 02 | `Lecture2_OOP_Lecture.pdf` | Lecture | Access modifiers (private/default/protected/public), private fields, getters/setters/JavaBeans, full vs no-arg constructors, UML class diagrams | High |
| 02 | `Tutorial1_Lab_Guide.pdf` | Lab | Lab PC setup, clone, add Swagger UI (springdoc), extend app, Git | Low–medium |
| 02 | `products-api.zip` | Code | Spring Boot 4.1.1 / Java 25 project: `HelloController`, `Person` | Medium: project skeleton |
| 03 | `Lecture3_OOP_Lecture.pdf` | Lecture | `List<T>`/`ArrayList<T>`, generics, `Map<K,V>`/`HashMap`, cohesion/coupling, service layer, `@Service`, `@Autowired` (field) | High |
| 03 | `Tutorial2_OOP_Lab_Guide_Student.pdf` | Lab | Product class + `/products` endpoint, encapsulation, UML, Customer/Address (HAS-A) | Medium |
| 04 | `Lecture4_OOP_Lecture.pdf` | Lecture | Inheritance, `extends`, `super(...)` must be first, implicit `super()`, no-arg ctor for Jackson, IS-A vs HAS-A, UML hollow triangle, one `List<Product>` holding subclasses | **Critical** |
| 04 | `Tutorial3_OOP_Lab_Guide_Student.pdf` | Lab | `ProductService`, GET/POST/GET-by-id/DELETE, `Optional`, `@RequestParam` search with a stream, 404 experiment | High |
| 05 | `Lecture5_OOP_Lecture.pdf` | Lecture | `instanceof` chain problem, `@Override`, overriding vs overloading, "reference type decides what you may call; object type decides what runs", abstract classes/methods, interfaces (`Discountable`) | **Critical** |
| 05 | `Tutorial4_OOP_Lab_Guide_Student.pdf` | Lab | `DigitalProduct extends Product`, `PhysicalProduct`, break `super(...)` on purpose, UML hierarchy | **Critical** |
| 05 | `Week05.zip` | Code | `abstract Vehicle` → `Car`, `Boat`, `Plane`; enums `Transmission`, `HullMaterial`; `Animal`/`Human` dynamic binding demo; overloaded `rent(...)` | High |
| 05 | `OOP_20_Credit_Module_LBP_Guidance.docx` | Guidance | **LBP: 100 min (90 solve + 10 upload); OOP 40 / Spring Boot 40 / Function validation 20; code given on the day; viva** | **Critical** |
| 06 | `Lecture6_OOP_Lecture.pdf` | Lecture | 500 problem, `Throwable` hierarchy, checked vs unchecked, try/catch/finally, custom exceptions extending `RuntimeException`, HTTP status codes, `@ControllerAdvice`/`@ExceptionHandler`, **Mock Lab briefing** | **Critical** |
| 06 | `Tutorial5_OOP_Lab_Guide_Student.pdf` (+ identical `(1)` copy) | Lab | `getSummary()` override, abstract `Product`, `Discountable` interface, `GET /products/summaries` | **Critical** |
| 08 | `Lecture7_OOP_Lecture.pdf` | Lecture | IoC, constructor injection (one constructor, `final` fields, no `@Autowired`), component scanning, `@Repository` + repository interface, layered architecture | High |
| 08 | `Mock-exam/MODERATE_Mock_Practice_Paper.docx` | Practice paper | Emergency Dispatch Energy Planner API (see `exam-requirements.md`) | **Critical** |
| 08 | `Mock-exam/Mock_Starter_Project_...zip` | Starter project | Java 25, Spring Boot 4.1.1, springdoc 3.2.0; model/controller/service/repository/exception | **Critical** |
| 08 | `Mock-exam/Mock Lab Based Practical_Solution_Code.zip` | Worked solution + `STUDENT_SOLUTION_GUIDE.md` | Complete solution using only Lecture 1–7 concepts; anonymous `Comparator` + `Collections.sort` (no streams/records) | **Critical** (reference only after attempting) |

No Week 07 folder exists in the archive.

## Important facts extracted

### From the LBP guidance (Week 05) and Lecture 6 briefing
- 100 minutes: 90 to solve, 10 to finalise and upload. One ZIP of the whole Maven project.
- Marks: **OOP 40, Spring Boot 40, Function validation 20**.
- Open book: slides, Blackboard materials, Java and Spring docs. **No AI assistants. No Git.**
- The assessment code is given on the day ("learn the shape of the project, not the domain").
- Lecture 6 says the Week 8 seminar mock's Tasks 1–4 "have the same shape as the real paper":
  1. complete a subclass (field, constructor calling `super(...)`, summary method) — 18
  2. create a new subclass (field, two constructors, own `getSummary()`) — 22
  3. custom exception → 404 through a global handler — 16
  4. GET by id and POST returning 201, no try/catch in the controller — 14
  5. (mock only) a second exception → 400 — 10
- Section A reads code with partial credit; Section B runs the ZIP. **Section B only runs if the ZIP starts.**
- Common time-losers listed: missing `@Override`, POST returning 200, try/catch in controller, missing `@ControllerAdvice`, zipping the wrong thing, uploading at the last minute.
- Viva-based verification can materially affect the mark.

### Discrepancies found (reported, not silently resolved)
| Item | Source A | Source B | How the app handles it |
|---|---|---|---|
| Server port | Starter `README.md`: **8082** | `application.properties` and the paper: **8080** | App teaches 8080 (what actually runs) and flags the README mismatch. |
| LBP duration | Week 01 notices: 90 minutes | LBP guidance + Lecture 6: 100 minutes (90 + 10 upload) | Simulator uses 100 min with a 10-minute "submit window" warning. |
| Mock paper shape | Lecture 6 briefing (Product-style, 5 tasks, getSummary) | `MODERATE_Mock_Practice_Paper.docx` (Dispatch, 4 tasks + Section B) | These are two different practice papers. The app implements the DOCX paper and teaches the briefing shape in the Strategy lesson. |
| Difficulty table | LBP guidance lists 7 levels | Its own reviewer note says they total 90, not 100 | Not used for scoring. |
| Handler annotation | Starter uses `@RestControllerAdvice` | Solution uses `@ControllerAdvice` + `ResponseEntity` | Both are correct; lesson explains why. |

### Environment facts (this workstation, 16 Nov 2026)
- Installed JDK: 23.0.2. The starter `pom.xml` requires `<java.version>25</java.version>`.
- A portable Temurin JDK 25.0.5 was downloaded to `.tools/` for the execution runner.
- Maven 3.9.15 present; Spring Boot 4.1.1 dependencies resolved into `~/.m2`.
- Docker Desktop is installed but was not running.

## Videos (verified 16 Nov 2026 from each video's own page data)

| Video | Verified title | Channel | Duration | Chapters |
|---|---|---|---|---|
| `xTtL8E4LzTQ` | Java Full Course for free ☕ | Bro Code | 12:00:00 | 71 creator chapters |
| `52YKZV_Qj3o` | Spring Boot Full Course with Project \| Tamil \| code io | code io - Tamil | 6:37:36 | 23 creator chapters |

The Spring Boot course is taught in **Tamil**. Chapter timestamps are copied from the creators' own
chapter lists, stored in `content/videos.ts`. Note the Bro Code course does not cover Spring.

## Gaps requiring supplemental content
- Integer overflow, `long` arithmetic and `Math.toIntExact` — required by the paper, not covered in the lectures.
- `Comparator` multi-key sorting and greedy selection — required by the paper; lectures only touch streams/sorting lightly.
- `@RequestParam(defaultValue=...)`, `@ResponseStatus(HttpStatus.CREATED)` vs `ResponseEntity.status(201)`.
- JavaScript/TypeScript → Java bridging (requested by the student).
- Reading an unfamiliar starter project quickly (the LBP gives code on the day).
