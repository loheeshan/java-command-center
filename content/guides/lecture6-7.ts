import { main, type LectureGuide } from "./types";

export const lecture6: LectureGuide = {
  id: "lecture-6",
  track: "oop",
  week: "Week 6",
  lecture: "Lecture 6 — Exceptions: Failing on Purpose (+ Mock Lab briefing)",
  title: "Exceptions: try/catch/finally, custom exceptions, 404 and 400 handlers",
  sources: ["WEEK-06/Lecture6_OOP_Lecture.pdf", "WEEK-08/Mock-exam/MODERATE_Mock_Practice_Paper.docx (Tasks 3, 3.3)"],
  goal: "Turn 'not found' and 'bad input' into proper 404 and 400 responses instead of a 500 crash.",
  minutes: 60,
  outcomes: [
    "Explain the Throwable hierarchy and checked vs unchecked exceptions.",
    "Read and predict try / catch / finally.",
    "Write a custom exception that extends RuntimeException.",
    "Map exceptions to HTTP status codes with @RestControllerAdvice + @ExceptionHandler.",
  ],
  steps: [
    {
      title: "1. The 500 problem",
      explain: [
        "`GET /products/999` asks for a product that does not exist. Two bad answers the lecture shows live: `orElse(null)` returns **200 OK with an empty body** ('it worked!'), and `orElseThrow()` returns **500 Internal Server Error** with a stack trace showing your class names and line numbers.",
        "Both are wrong. Nothing on the server is broken — the client asked for something missing. The correct answer is **404 Not Found** with a small JSON body you designed.",
        "Key takeaway: **your error responses are part of your API**. Design them like any endpoint.",
      ],
    },
    {
      title: "2. Every failure is an object in a class hierarchy",
      explain: [
        "When something goes wrong Java creates an exception **object** and *throws* it. These classes form an inheritance tree — the same `extends` you learned in Lecture 4.",
        "- `Throwable` is the root.\n- `Error` — JVM problems like `OutOfMemoryError`. Never catch these.\n- `Exception` — **checked**: the compiler forces you to catch it or declare `throws` (e.g. `IOException`).\n- `RuntimeException` — **unchecked**: no `throws` needed (e.g. `NullPointerException`, `IllegalArgumentException`).",
        "In Spring, your own exceptions **extend RuntimeException**. Then they travel up from the service through the controller without any `throws` clauses, to one handler class.",
      ],
      code: `Throwable
 ├── Error                      (never catch)
 └── Exception                  (checked)
      ├── IOException           (checked)
      └── RuntimeException      (unchecked)
           ├── IllegalArgumentException
           ├── NullPointerException
           └── ProductNotFoundException   <- yours`,
      codeTitle: "Lecture 6 slide 9",
    },
    {
      title: "3. try / catch / finally",
      explain: [
        "`try { ... }` runs code that might fail. If an exception is thrown, Java jumps to the first matching `catch`. `finally` runs **always** — after a normal finish, a `return`, or an exception.",
        "Lecture 6's vote slide: in `try { return \"A\"; } finally { print(\"B\"); }` — **B prints first**, then the method returns A. Run it below.",
        "Rules from the slide: catch the most specific type first; never swallow an exception with an empty catch; never catch plain `Exception` 'just in case'; catch only where you can actually do something.",
      ],
      run: {
        files: main(`public class Main {
    static String check() {
        try {
            return "A";
        } finally {
            System.out.println("B");
        }
    }

    static int parseCredits(String raw) {
        try {
            return Integer.parseInt(raw);
        } catch (NumberFormatException e) {
            System.out.println("Not a number: " + raw);
            return -1;
        } finally {
            System.out.println("finally runs for " + raw);
        }
    }

    public static void main(String[] args) {
        System.out.println(check());
        System.out.println(parseCredits("20"));
        System.out.println(parseCredits("twenty"));
    }
}`),
        expectedOutput: "B\nA\nfinally runs for 20\n20\nNot a number: twenty\nfinally runs for twenty\n-1",
      },
      exam: "Lecture 6 lists 'try/catch in the controller' as a time-loser in the practical. In the Spring tasks you **throw** in the service and let the global handler deal with it.",
    },
    {
      title: "4. Your own exception class",
      explain: [
        "A custom exception is just a small class that **extends RuntimeException** and passes a message up with `super(message)` — inheritance again.",
        "Its **type** carries the meaning: `ProductNotFoundException` already says what went wrong, so the handler can map it to 404 without reading the message.",
        "Below, the service throws it when the id is missing, and `main` plays the role of the handler. Note there is **no `throws`** on `findById` — it is unchecked.",
      ],
      run: {
        files: main(`import java.util.ArrayList;
import java.util.List;

class ProductNotFoundException extends RuntimeException {
    public ProductNotFoundException(Long id) {
        super("Product not found with id " + id);
    }
}

class Product {
    private Long id; private String name;
    public Product(Long id, String name) { this.id = id; this.name = name; }
    public Long getId() { return id; }
    public String getName() { return name; }
}

class ProductService {
    private final List<Product> products = new ArrayList<>(List.of(new Product(1L, "Laptop")));

    public Product findById(Long id) {
        for (Product p : products) {
            if (p.getId().equals(id)) return p;
        }
        throw new ProductNotFoundException(id);   // instead of return null
    }

    public Product create(String name, double price) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Name is required");
        if (price <= 0) throw new IllegalArgumentException("Price must be positive");
        Product p = new Product((long) products.size() + 1, name);
        products.add(p);
        return p;
    }
}

public class Main {
    public static void main(String[] args) {
        ProductService service = new ProductService();
        System.out.println(service.findById(1L).getName());
        try {
            service.findById(999L);
        } catch (ProductNotFoundException e) {      // in Spring: the handler -> 404
            System.out.println("404: " + e.getMessage());
        }
        try {
            service.create("Mouse", -3);
        } catch (IllegalArgumentException e) {      // in Spring: the handler -> 400
            System.out.println("400: " + e.getMessage());
        }
    }
}`),
        expectedOutput: "Laptop\n404: Product not found with id 999\n400: Price must be positive",
      },
      exam: "**Task 3** (16 marks): create `XNotFoundException extends RuntimeException`, throw it from the service, and map it to 404. The message text must match the paper exactly (e.g. `Ticket not found with id 7`).",
    },
    {
      title: "5. HTTP status codes: say what happened in three digits",
      explain: ["The codes you need for the practical:"],
      table: {
        head: ["Code", "Meaning", "When"],
        rows: [
          ["200 OK", "Success with a body", "Normal GET"],
          ["201 Created", "Something new was created", "POST that creates (Task 4)"],
          ["204 No Content", "Success, empty body", "DELETE"],
          ["400 Bad Request", "The client sent invalid data", "Validation fails (IllegalArgumentException / your InvalidXException)"],
          ["404 Not Found", "That resource does not exist", "Unknown id (your NotFoundException)"],
          ["500 Internal Server Error", "Your server crashed", "An exception nobody handled — never on purpose"],
        ],
      },
    },
    {
      title: "6. One place for every error: @RestControllerAdvice",
      explain: [
        "Instead of try/catch in every controller method, Spring lets you write **one** class that catches exceptions from **all** controllers:",
        "- `@RestControllerAdvice` on the class (or `@ControllerAdvice` + `ResponseEntity` — the mock solution uses that; both are correct).\n- One method per exception type, marked `@ExceptionHandler(TheException.class)`.\n- `@ResponseStatus(HttpStatus.NOT_FOUND)` sets the status code; the method returns the JSON body (here an `ErrorResponse`).",
        "The flow: controller → service throws → exception travels up → the handler catches it → client gets 404 with your JSON.",
      ],
      code: `@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ProductNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(ProductNotFoundException ex) {
        return new ErrorResponse(404, ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleBadRequest(IllegalArgumentException ex) {
        return new ErrorResponse(400, ex.getMessage());
    }
}

// Controller: no try/catch at all
@GetMapping("/{id}")
public Product getById(@PathVariable Long id) {
    return productService.findById(id);   // may throw -> handler -> 404
}

@PostMapping
@ResponseStatus(HttpStatus.CREATED)        // 201, not the default 200
public Product create(@RequestBody Product p) { return productService.create(p); }`,
      codeTitle: "The pattern for Tasks 3, 4 and 5 (Spring — practise it in the Exam Lab)",
      exam: "Time-losers the lecture lists: missing `@ControllerAdvice`/`@RestControllerAdvice`, POST returning 200 instead of 201, try/catch in the controller. The Exam Lab's grader tests every one of these.",
    },
    {
      title: "7. The Mock Lab briefing (end of Lecture 6)",
      explain: [
        "Lecture 6 ends by saying the mock's Tasks 1–4 **have the same shape as the real paper**:",
        "- **Task 1 (18)** complete a subclass: field, constructor calling `super(...)`, summary method.\n- **Task 2 (22)** create a new subclass: field, two constructors, its own `getSummary()`.\n- **Task 3 (16)** custom exception → 404 through the global handler.\n- **Task 4 (14)** GET by id and POST returning 201, no try/catch in the controller.\n- **Task 5 (10, mock)** a second exception → 400.",
        "Rules: 100 minutes (90 to solve + 10 to zip and upload), open book, **no AI, no Git**, the code is given on the day, and a **viva** checks you understand what you submitted. Section B only runs if your ZIP starts — so **compile often**.",
      ],
    },
  ],
  viva: [
    { q: "Checked vs unchecked exceptions?", a: "Checked (Exception but not RuntimeException) must be caught or declared with throws; unchecked (RuntimeException subclasses) need neither." },
    { q: "Why does your custom exception extend RuntimeException?", a: "So it can travel from the service to the global handler without adding throws to every method in between." },
    { q: "Why not catch the exception in the controller?", a: "Error handling belongs in one place (@RestControllerAdvice); the controller stays simple and every error has the same JSON shape." },
    { q: "Which status code for a missing id, and for invalid input?", a: "404 Not Found for a missing id; 400 Bad Request for invalid input." },
    { q: "When does finally run?", a: "Always — after normal completion, after a return, and after an exception." },
  ],
  next: [
    { href: "/learn/exceptions-validation", label: "Lesson: Exceptions and validation" },
    { href: "/learn/spring-exception-handling", label: "Lesson: Spring exception handling" },
    { href: "/spring-boot#flow", label: "Spring Lab: watch a request become a 404" },
    { href: "/exam/tickets", label: "Exam practice: Tasks 3, 4, 5 with real tests" },
  ],
};

export const lecture7: LectureGuide = {
  id: "lecture-7",
  track: "oop",
  week: "Week 8",
  lecture: "Lecture 7 — Spring IoC & Dependency Injection",
  title: "Who creates your objects: IoC, constructor injection, repository interfaces",
  sources: ["WEEK-08/Lecture7_OOP_Lecture.pdf"],
  goal: "Understand why the controller never writes `new ProductService()`, and write constructor injection correctly.",
  minutes: 45,
  outcomes: [
    "Define dependency, bean, container and inject in one sentence each.",
    "Explain the problem with a class creating its own collaborators (tight coupling).",
    "Write constructor injection: a `final` field and one constructor.",
    "Explain how depending on an interface (a repository) makes parts swappable.",
  ],
  steps: [
    {
      title: "1. Four words used all lecture",
      explain: ["If you get lost, come back to these (Lecture 7 slide 3):"],
      table: {
        head: ["Word", "Meaning", "Example"],
        rows: [
          ["dependency", "Something a class needs to do its job", "ProductController needs a ProductService"],
          ["bean", "An object that Spring creates and looks after", "your @Service and @RestController classes"],
          ["container", "Where the beans live (the application context)", "filled when the app starts"],
          ["inject", "Spring hands a bean to your class, through its constructor", "your class never calls `new` on it"],
        ],
      },
    },
    {
      title: "2. The problem: a class that builds its own collaborators",
      explain: [
        "If the controller writes `this.productService = new ProductService();`, it has decided **which** service everyone gets, and each controller gets its **own private copy** with its own list. Add a second controller and the two see different products.",
        "Run it: two controllers, two separate lists. That is the bug Lecture 7 calls **tight coupling**.",
      ],
      run: {
        files: main(`import java.util.ArrayList;
import java.util.List;

class ProductService {
    private final List<String> products = new ArrayList<>();
    public void add(String name) { products.add(name); }
    public int count() { return products.size(); }
}

class ProductController {
    private final ProductService productService = new ProductService();   // builds its own
    public void post(String name) { productService.add(name); }
    public int count() { return productService.count(); }
}

class AdminController {
    private final ProductService productService = new ProductService();   // another copy!
    public int count() { return productService.count(); }
}

public class Main {
    public static void main(String[] args) {
        ProductController shop = new ProductController();
        AdminController admin = new AdminController();
        shop.post("Laptop");
        System.out.println("shop sees " + shop.count());
        System.out.println("admin sees " + admin.count());   // 0: a different list
    }
}`),
        expectedOutput: "shop sees 1\nadmin sees 0",
      },
    },
    {
      title: "3. Inversion of Control: Spring builds the objects",
      explain: [
        "**Inversion of Control**: your code stops creating its collaborators; the framework does it. ('Don't call us, we'll call you.')",
        "Between pressing Run and seeing 'Started Application', Spring:",
        "- **1** scans every package below your `@SpringBootApplication` class for `@Service`, `@Repository`, `@RestController`, `@Component`;\n- **2** registers each as a bean;\n- **3** reads each bean's constructor parameters and finds a bean of the matching type;\n- **4** creates them in dependency order and wires them together — **one shared object each** (singleton).",
        "So a class with no annotation, or in a package outside the scan, is **not** injected.",
      ],
    },
    {
      title: "4. Constructor injection: ask, don't create",
      explain: [
        "The style Lecture 7 says is the one worth learning: a **`private final` field** and **one constructor** that receives the dependency. With a single constructor, Spring needs **no `@Autowired`**.",
        "Below, `main` does by hand what Spring does at startup: create **one** service and pass it into both controllers. Now they share the same list.",
      ],
      run: {
        files: main(`import java.util.ArrayList;
import java.util.List;

class ProductService {
    private final List<String> products = new ArrayList<>();
    public void add(String name) { products.add(name); }
    public int count() { return products.size(); }
}

class ProductController {
    private final ProductService productService;
    public ProductController(ProductService productService) {   // asks for it
        this.productService = productService;
    }
    public void post(String name) { productService.add(name); }
    public int count() { return productService.count(); }
}

class AdminController {
    private final ProductService productService;
    public AdminController(ProductService productService) {
        this.productService = productService;
    }
    public int count() { return productService.count(); }
}

public class Main {
    public static void main(String[] args) {
        ProductService shared = new ProductService();          // what Spring does: one bean
        ProductController shop = new ProductController(shared);
        AdminController admin = new AdminController(shared);
        shop.post("Laptop");
        System.out.println("shop sees " + shop.count());
        System.out.println("admin sees " + admin.count());     // 1: same object
    }
}`),
        expectedOutput: "shop sees 1\nadmin sees 1",
      },
      code: `@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {   // no @Autowired needed
        this.productService = productService;
    }
}`,
      codeTitle: "The Spring version (field injection with @Autowired on the field is the older style from Lecture 3)",
    },
    {
      title: "5. Interfaces make the parts swappable",
      explain: [
        "Lecture 5 promised interfaces would pay off — here. Move the list out of the service into a **repository**, and make the service depend on a repository **interface**, not a concrete class.",
        "Today the implementation keeps products in memory. Tomorrow a database version can implement the same interface, and **the service does not change**. That is the **Dependency Inversion** principle: depend on abstractions.",
        "Annotation guide: `@RestController` for HTTP, `@Service` for business logic, `@Repository` for storage.",
      ],
      run: {
        files: main(`import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

interface ProductRepository {
    List<String> findAll();
    Optional<String> findByName(String name);
    void save(String name);
}

class InMemoryProductRepository implements ProductRepository {   // @Repository in Spring
    private final List<String> products = new ArrayList<>();
    public List<String> findAll() { return products; }
    public Optional<String> findByName(String name) {
        return products.stream().filter(p -> p.equals(name)).findFirst();
    }
    public void save(String name) { products.add(name); }
}

class ProductService {                                           // @Service in Spring
    private final ProductRepository repository;                  // the INTERFACE type
    public ProductService(ProductRepository repository) { this.repository = repository; }
    public void add(String name) { repository.save(name); }
    public boolean exists(String name) { return repository.findByName(name).isPresent(); }
    public int count() { return repository.findAll().size(); }
}

public class Main {
    public static void main(String[] args) {
        ProductService service = new ProductService(new InMemoryProductRepository());
        service.add("Laptop");
        service.add("Mouse");
        System.out.println(service.count());
        System.out.println(service.exists("Mouse") + " " + service.exists("Desk"));
    }
}`),
        expectedOutput: "2\ntrue false",
      },
      exam: "The starter projects use exactly this layering: controller → service → repository. `Optional` + `orElseThrow(() -> new XNotFoundException(id))` is the neat way to do Task 3.",
    },
    {
      title: "6. Evaluating the design (LO4 wording)",
      explain: [
        "How to justify this design in the viva or your report:",
        "- **Low coupling** — classes depend on interfaces and receive collaborators; nothing is welded with `new`.\n- **High cohesion** — controller = HTTP, service = rules, repository = storage.\n- **Testability** — you can pass a fake repository into the service in a test.\n- **Maintainability** — switching storage changes one class.",
      ],
    },
  ],
  viva: [
    { q: "What is inversion of control?", a: "Control over creating objects moves from your classes to the Spring container, which creates and wires the beans at startup." },
    { q: "What is dependency injection?", a: "The technique: a class receives the objects it needs (usually through its constructor) instead of creating them." },
    { q: "Why constructor injection?", a: "Dependencies are explicit and final, the object is always complete, it is easy to test, and with one constructor Spring needs no @Autowired." },
    { q: "Why does the service depend on a repository interface?", a: "So the storage implementation can be swapped (memory → database) without changing the service — low coupling." },
  ],
  next: [
    { href: "/learn/spring-layers-di", label: "Lesson: Spring layers and dependency injection" },
    { href: "/learn/starter-project-tour", label: "Lesson: read the starter project in 10 minutes" },
    { href: "/spring-boot#explorer", label: "Spring Lab: starter project explorer" },
  ],
};
