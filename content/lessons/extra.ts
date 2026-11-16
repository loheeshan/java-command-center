import type { Lesson } from "@/lib/curriculum/types";

/** Lessons added after a coverage review against Lectures 2–7 and Tutorials 3–5. */
export const extraLessons: Lesson[] = [
  {
    id: "interfaces-enums",
    moduleId: "m02",
    title: "Interfaces and enums",
    minutes: 35,
    priority: "P0",
    skill: "oop",
    sources: [
      { kind: "university", label: "Lecture 5 — Interfaces: the Discountable contract" },
      { kind: "university", label: "Tutorial 5 — implement Discountable (cap PhysicalProduct at 20%)" },
      { kind: "university", label: "Week05.zip — enums Transmission and HullMaterial" },
    ],
    videos: [{ video: "java", chapter: 49 }, { video: "java", chapter: 68 }],
    what: "An **interface** is a contract: a list of method signatures a class promises to implement (`implements`). An **enum** is a type with a fixed set of named constants, like `Transmission.AUTO`.",
    why: "A class can extend only one parent, but it can implement many interfaces — so an interface describes *what a class can do* without forcing an inheritance relationship. Enums replace error-prone magic strings (`\"auto\"`, `\"Auto\"`, `\"AUTOMATIC\"`) with values the compiler checks.",
    when: "Lecture 5 and Tutorial 5 use `Discountable` on products; Lecture 7 uses an interface for the repository. Enums appear in the Week 05 vehicle model. A real-paper subclass may well include an enum field or implement an interface.",
    analogy: "An interface is a qualification: anyone holding a driving licence can `drive()`, whether they are a teacher or a nurse. An enum is a dropdown menu — you can only pick one of the listed options.",
    compare: {
      lang: "TypeScript",
      other: `interface Discountable {
  applyDiscount(rate: number): number;
}
enum Transmission { AUTO, MANUAL }
class Car implements Discountable { ... }`,
      java: `public interface Discountable {
    double applyDiscount(double rate);
}
public enum Transmission { AUTO, MANUAL }
public class Car extends Vehicle implements Discountable { ... }`,
      notes: [
        "Same keywords as TypeScript, but Java interfaces exist at runtime and `implements` is checked by the compiler.",
        "A class can `extends` one class **and** `implements` several interfaces: `class A extends B implements C, D`.",
        "Interface methods are implicitly `public abstract`; the implementing method must be `public`.",
        "Java enums are real classes: they can have fields, constructors and methods, and work in `switch`.",
      ],
    },
    syntax: {
      code: `public interface Discountable {
    double applyDiscount(double rate);      // no body, implicitly public abstract
}

public class DigitalProduct extends Product implements Discountable {
    @Override
    public double applyDiscount(double rate) {
        return getPrice() * (1 - rate);
    }
}

public enum Transmission { AUTO, MANUAL }
Transmission t = Transmission.AUTO;
if (t == Transmission.AUTO) { ... }       // enums compare safely with ==`,
      parts: [
        { token: "interface", meaning: "Declares a contract. Cannot be instantiated." },
        { token: "implements Discountable", meaning: "Promise to provide every method in the interface." },
        { token: "@Override public double applyDiscount", meaning: "Must be `public` — interface methods are public." },
        { token: "enum Transmission { AUTO, MANUAL }", meaning: "A fixed set of constants; `Transmission.values()` lists them." },
      ],
    },
    example: {
      title: "Discountable products and an enum",
      files: [
        {
          name: "Main.java",
          content: `import java.util.*;

interface Discountable {
    double applyDiscount(double rate);
}

enum Category { BOOK, COURSE, HARDWARE }

abstract class Product {
    private final String name;
    private final double price;
    private final Category category;
    Product(String name, double price, Category category) { this.name = name; this.price = price; this.category = category; }
    public String getName() { return name; }
    public double getPrice() { return price; }
    public Category getCategory() { return category; }
}

class DigitalProduct extends Product implements Discountable {
    DigitalProduct(String name, double price) { super(name, price, Category.COURSE); }
    @Override public double applyDiscount(double rate) { return getPrice() * (1 - rate); }
}

class PhysicalProduct extends Product implements Discountable {
    PhysicalProduct(String name, double price) { super(name, price, Category.HARDWARE); }
    @Override public double applyDiscount(double rate) {
        double capped = Math.min(rate, 0.20);           // shipping never discounted beyond 20%
        return getPrice() * (1 - capped);
    }
}

public class Main {
    public static void main(String[] args) {
        List<Discountable> items = List.of(new DigitalProduct("Java course", 100), new PhysicalProduct("Keyboard", 100));
        for (Discountable d : items) {
            Product p = (Product) d;
            System.out.printf("%s (%s): %.2f%n", p.getName(), p.getCategory(), d.applyDiscount(0.5));
        }
        for (Category c : Category.values()) System.out.print(c + " ");
        System.out.println();
        System.out.println(Category.valueOf("BOOK") == Category.BOOK);
    }
}`,
        },
      ],
      expectedOutput: "Java course (COURSE): 50.00\nKeyboard (HARDWARE): 80.00\nBOOK COURSE HARDWARE \ntrue",
      explain: "Both classes answer `applyDiscount` differently — polymorphism through an interface instead of a parent class. This is Tutorial 5's Discountable task.",
    },
    body: [
      {
        heading: "Abstract class or interface?",
        text: "- **Abstract class** — shared **state and code** plus some abstract methods. IS-A. One parent only. (`DispatchMission`, `Product`)\n- **Interface** — a **capability** with no state. CAN-DO. Many allowed. (`Discountable`, `Comparator`, Lecture 7's `ProductRepository`)\n- Lecture 5 rule: use an abstract class when subclasses share real state and code and there is something only they can answer.",
      },
      {
        heading: "Enums in switch",
        text: "Enums work directly in `switch`, and the case labels use the bare constant name.",
        code: `switch (transmission) {
    case AUTO -> System.out.println("no clutch");
    case MANUAL -> System.out.println("clutch pedal");
}`,
      },
    ],
    trace: {
      code: `interface Shape { double area(); }
enum Size { SMALL, LARGE }
class Sq implements Shape {
    private final double s;
    Sq(double s) { this.s = s; }
    public double area() { return s * s; }
}
public class Main {
    public static void main(String[] args) {
        Shape sh = new Sq(3);
        Size size = sh.area() > 5 ? Size.LARGE : Size.SMALL;
        System.out.println(sh.area() + " " + size + " " + size.ordinal());
        System.out.println(sh instanceof Shape);
    }
}`,
      output: "9.0 LARGE 1\ntrue",
      explanation: "`area()` is 9.0, which is > 5, so LARGE. `ordinal()` is the position in the enum declaration (SMALL=0, LARGE=1). A `Sq` IS-A `Shape` through the interface.",
    },
    challenge: { taskId: "ct-discountable" },
    mistakes: [
      { mistake: "Implementing an interface method without `public`.", fix: "Interface methods are public; a package-private implementation does not compile (weaker access)." },
      { mistake: "Writing `new Discountable()`.", fix: "Interfaces cannot be instantiated; create a class that implements it." },
      { mistake: "Comparing enums with `.equals` out of fear.", fix: "`==` is correct and null-safe for enums (each constant exists once)." },
      { mistake: "Using a String like `\"AUTO\"` where an enum exists.", fix: "Use `Transmission.AUTO`; convert input with `Transmission.valueOf(text)`." },
    ],
    quiz: ["qs-iface-impl-1", "qs-iface-vs-abstract-1", "qs-enum-1", "qs-enum-predict-1"],
    examQuestion: {
      prompt: "Viva: 'Why is `Discountable` an interface and not another abstract parent class?'",
      modelAnswer: "Products already extend `Product`, and Java allows only one superclass. Being discountable is a capability some products have, not what they are, so it is an interface: any class can implement it without changing its inheritance, and code can treat all discountable things uniformly through the `Discountable` type.",
    },
    summary: [
      "Interface = contract (can-do); `implements`, many allowed.",
      "Abstract class = shared state + code (is-a); one parent.",
      "Interface methods are public; implementations must be public.",
      "Enum = fixed set of constants; compare with `==`; usable in switch.",
    ],
  },
  {
    id: "uml-class-diagrams",
    moduleId: "m02",
    title: "UML class diagrams: read them, turn them into code",
    minutes: 25,
    priority: "P1",
    skill: "oop",
    sources: [
      { kind: "university", label: "Lecture 2 — UML class diagram notation, diagram ↔ code" },
      { kind: "university", label: "Lecture 4 — the hollow triangle (generalisation)" },
      { kind: "university", label: "Week 01 Learning Guide §7 — design first, code second" },
    ],
    what: "A **class diagram** shows each class as a box: name, attributes (`- radius : double`), operations (`+ getArea() : double`). Lines between boxes show relationships: inheritance, implementation, association/composition.",
    why: "Lectures and the coursework use UML to describe designs. In the practical you may be given (or asked to reason about) a diagram, and in the viva you may be asked to explain the structure of your code.",
    when: "Translating a task description into classes; explaining your design; the 60% coursework report.",
    analogy: "A class diagram is a floor plan: it shows rooms (classes), what is in them (fields/methods) and which doors connect them (relationships) — but not how the furniture was built (method bodies).",
    compare: {
      lang: "Database ER diagram",
      other: `Mission
  id         PK
  distance_km
  load_kg`,
      java: `┌──────────────────────────┐
│ «abstract» DispatchMission│
├──────────────────────────┤
│ - id : long               │
│ - distanceKm : int        │
├──────────────────────────┤
│ + getId() : long          │
│ + energyUnits() : int     │  (italic = abstract)
└──────────────────────────┘`,
      notes: [
        "Like an ER diagram, but it also shows behaviour (methods) and visibility.",
        "`-` private, `+` public, `#` protected, `~` package.",
        "Type comes after a colon: `name : String`, `getArea() : double`.",
        "Abstract classes/methods are written in *italics* or marked «abstract».",
      ],
    },
    syntax: {
      code: `Relationship arrows (Lectures 2 & 4)
  Child ───▷ Parent        solid line, hollow triangle  = extends (generalisation)
  Class - - ▷ Interface    dashed line, hollow triangle = implements (realisation)
  Whole ◆─── Part          filled diamond               = composition (part cannot exist alone)
  Whole ◇─── Part          hollow diamond               = aggregation
  A ──── B   1 .. *        plain line + multiplicity    = association ("one A has many B")`,
      parts: [
        { token: "- radius : double", meaning: "`private double radius;`" },
        { token: "+ setRadius(radius : double) : void", meaning: "`public void setRadius(double radius)`" },
        { token: "───▷", meaning: "`class Circle extends Shape`" },
        { token: "◆─── 1..*", meaning: "a `List<Part>` field created and owned by the whole" },
      ],
    },
    example: {
      title: "Diagram → code: Customer HAS-A Address (Tutorial 2)",
      files: [
        {
          name: "Main.java",
          content: `// Customer ◆──── 1 Address
// Customer: - name : String, - address : Address, + Customer(name, address), + getAddress() : Address
// Address:  - city : String,  + Address(city), + getCity() : String

class Address {
    private final String city;
    public Address(String city) { this.city = city; }
    public String getCity() { return city; }
}

class Customer {
    private final String name;
    private final Address address;      // composition = a field
    public Customer(String name, Address address) { this.name = name; this.address = address; }
    public String getName() { return name; }
    public Address getAddress() { return address; }
}

public class Main {
    public static void main(String[] args) {
        Customer c = new Customer("Nimal", new Address("Colombo"));
        System.out.println(c.getName() + " lives in " + c.getAddress().getCity());
    }
}`,
        },
      ],
      expectedOutput: "Nimal lives in Colombo",
    },
    visual: { id: "inheritance", caption: "The OOP Lab diagram uses the same notation: italic abstract members, hollow-triangle generalisation." },
    trace: {
      code: `import java.util.*;
// Order ◆──── 1..* OrderLine
class OrderLine { final int qty; final double price; OrderLine(int q, double p) { qty = q; price = p; } }
class Order {
    private final List<OrderLine> lines = new ArrayList<>();
    void add(int q, double p) { lines.add(new OrderLine(q, p)); }
    double total() { double t = 0; for (OrderLine l : lines) t += l.qty * l.price; return t; }
    int size() { return lines.size(); }
}
public class Main {
    public static void main(String[] args) {
        Order o = new Order();
        o.add(2, 1.5);
        o.add(1, 10);
        System.out.println(o.size() + " " + o.total());
    }
}`,
      output: "2 13.0",
      explanation: "Multiplicity `1..*` becomes a `List<OrderLine>`. Two lines: 2×1.5 + 1×10 = 13.0.",
    },
    challenge: { taskId: "ct-uml-to-code" },
    mistakes: [
      { mistake: "Drawing the inheritance arrow pointing at the child.", fix: "The hollow triangle points at the **parent**." },
      { mistake: "Turning HAS-A into `extends`.", fix: "HAS-A is a field (composition/association), not inheritance." },
      { mistake: "Forgetting visibility symbols.", fix: "Fields are normally `-` (private); public API `+`." },
    ],
    quiz: ["qs-uml-1", "qs-uml-2", "qs-uml-3"],
    examQuestion: {
      prompt: "Write the UML attribute and operation lines for `GroundMission`.",
      modelAnswer: "```text\nGroundMission\n- medical : boolean\n+ GroundMission(id : long, distanceKm : int, loadKg : int, medical : boolean)\n+ isMedical() : boolean\n+ energyUnits() : int\n+ priority() : int\n```\nwith a solid line and hollow triangle pointing to «abstract» DispatchMission.",
    },
    summary: [
      "Box = name / attributes / operations; `-` private, `+` public, `#` protected.",
      "Solid line + hollow triangle → extends; dashed → implements.",
      "Diamond / multiplicity → fields and lists.",
      "Italic = abstract.",
    ],
  },
  {
    id: "rest-crud-extras",
    moduleId: "m06",
    title: "GET by id, DELETE 204, Optional and simple streams",
    minutes: 35,
    priority: "P0",
    skill: "rest",
    sources: [
      { kind: "university", label: "Tutorial 3 — getProductById with Optional, DELETE, search with a stream + @RequestParam" },
      { kind: "university", label: "Lecture 6 — Optional.orElseThrow and the 500 problem; 'if you finish early: DELETE 204'" },
    ],
    videos: [{ video: "spring", chapter: 12 }],
    what: "`Optional<T>` is a box that may or may not contain a value — the modern alternative to returning `null`. A **stream** processes a collection as a pipeline (`filter`, `map`, `findFirst`). REST conventions: `GET /items/{id}` returns one item or 404; `DELETE /items/{id}` returns **204 No Content**.",
    why: "The real paper's shape includes **GET by id** (Lecture 6 briefing, Task 4) and the briefing's stretch task is **DELETE → 204**. The lecture code uses `Optional` and `stream().filter(...)`, so you need to read and write them.",
    when: "Service methods that look something up; controller endpoints for single resources and deletion.",
    analogy: "An `Optional` is a parcel that may be empty. Instead of opening it and crashing on nothing (`NullPointerException`), you say what to do if it is empty: `orElseThrow(() -> new NotFound(id))`.",
    compare: {
      lang: "JavaScript",
      other: `const p = products.find(p => p.id === id);
if (!p) throw new NotFound(id);
const cheap = products.filter(p => p.price < 10)
                      .map(p => p.name);`,
      java: `Product p = products.stream()
        .filter(x -> x.getId().equals(id))
        .findFirst()
        .orElseThrow(() -> new ProductNotFoundException(id));
List<String> cheap = products.stream()
        .filter(x -> x.getPrice() < 10)
        .map(Product::getName)
        .toList();`,
      notes: [
        "`filter`/`map` work like JS array methods, but you start with `.stream()` and end with a terminal operation (`toList()`, `findFirst()`, `count()`).",
        "`findFirst()` returns `Optional<T>` — JS returns `undefined` instead.",
        "Compare `Long` ids with `.equals`, not `==` (they are objects).",
        "Lecture 6: `.orElse(null)` gave a silent 200; `.orElseThrow()` with no argument gave a 500. Throw **your** exception for a 404.",
      ],
    },
    syntax: {
      code: `// Service
public Ticket getById(Long id) {
    return repository.findById(id)                       // Optional<Ticket>
            .orElseThrow(() -> new TicketNotFoundException(id));
}

public void delete(Long id) {
    if (!repository.existsById(id)) throw new TicketNotFoundException(id);
    repository.deleteById(id);
}

// Controller
@GetMapping("/{id}")
public Ticket one(@PathVariable("id") Long id) { return service.getById(id); }

@DeleteMapping("/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void delete(@PathVariable("id") Long id) { service.delete(id); }`,
      parts: [
        { token: "Optional<Ticket>", meaning: "May contain a Ticket or be empty." },
        { token: ".orElseThrow(() -> new X(id))", meaning: "Unwrap, or throw your custom exception (→ 404 via the handler)." },
        { token: "@DeleteMapping", meaning: "Handles HTTP DELETE." },
        { token: "HttpStatus.NO_CONTENT", meaning: "204: success with an empty body." },
      ],
    },
    example: {
      title: "Optional and streams in plain Java",
      files: [
        {
          name: "Main.java",
          content: `import java.util.*;

public class Main {
    record Product(Long id, String name, double price) {}   // records only to keep the demo short

    static class ProductNotFoundException extends RuntimeException {
        ProductNotFoundException(Long id) { super("Product not found with id " + id); }
    }

    static List<Product> products = new ArrayList<>(List.of(
        new Product(1L, "Pen", 2.5), new Product(2L, "Notebook", 6.0), new Product(3L, "Java book", 45.0)));

    static Optional<Product> findById(Long id) {
        return products.stream().filter(p -> p.id().equals(id)).findFirst();
    }

    static Product getById(Long id) {
        return findById(id).orElseThrow(() -> new ProductNotFoundException(id));
    }

    public static void main(String[] args) {
        System.out.println(findById(2L).isPresent() + " " + findById(99L).isPresent());
        System.out.println(getById(3L).name());
        try {
            getById(99L);
        } catch (ProductNotFoundException e) {
            System.out.println("404 -> " + e.getMessage());
        }
        List<String> cheap = products.stream().filter(p -> p.price() < 10).map(Product::name).toList();
        System.out.println(cheap);
        System.out.println(products.stream().filter(p -> p.name().toLowerCase().contains("book")).count());
        boolean removed = products.removeIf(p -> p.id().equals(1L));
        System.out.println(removed + " " + products.size());
    }
}`,
        },
      ],
      expectedOutput: "true false\nJava book\n404 -> Product not found with id 99\n[Pen, Notebook]\n2\ntrue 2",
      explain: "`removeIf` is how an in-memory repository can delete by id.",
    },
    trace: {
      code: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        List<Integer> prices = List.of(40, 55, 120, 15);
        Optional<Integer> firstBig = prices.stream().filter(p -> p > 100).findFirst();
        Optional<Integer> none = prices.stream().filter(p -> p > 500).findFirst();
        System.out.println(firstBig.orElse(-1) + " " + none.orElse(-1));
        System.out.println(prices.stream().filter(p -> p < 60).map(p -> p * 2).toList());
    }
}`,
      output: "120 -1\n[80, 110, 30]",
      explanation: "The first price > 100 is 120. Nothing is > 500, so `orElse(-1)`. Prices < 60 are 40, 55, 15; doubled → [80, 110, 30].",
    },
    challenge: { examTask: "tickets", text: "Practise GET by id, POST 201, 404 and 400 on the Event Ticketing practice project (real-paper shape)." },
    mistakes: [
      { mistake: "`.orElse(null)` in the controller.", fix: "Returns 200 with an empty body (Lecture 6). Throw a not-found exception instead." },
      { mistake: "`.orElseThrow()` with no argument.", fix: "Throws `NoSuchElementException` → 500. Pass a supplier: `orElseThrow(() -> new XNotFound(id))`." },
      { mistake: "`p.getId() == id` with `Long`.", fix: "Use `.equals` — `==` compares object identity and fails for values above 127." },
      { mistake: "DELETE returning 200 with a body.", fix: "`@ResponseStatus(HttpStatus.NO_CONTENT)` and `void`." },
    ],
    quiz: ["qs-optional-1", "qs-optional-2", "qs-delete-204-1", "qs-stream-1", "qs-long-eq-1"],
    examQuestion: {
      prompt: "Write the service method `getById(Long id)` for a repository whose `findById` returns `Optional<Ticket>`, so that an unknown id becomes a 404.",
      modelAnswer: "```java\npublic Ticket getById(Long id) {\n    return repository.findById(id)\n            .orElseThrow(() -> new TicketNotFoundException(id));\n}\n```\nplus an `@ExceptionHandler(TicketNotFoundException.class)` returning `HttpStatus.NOT_FOUND`.",
    },
    summary: [
      "`Optional` + `orElseThrow(() -> new NotFound(id))` → 404 via the handler.",
      "Streams: `stream().filter(...).map(...).toList()` / `findFirst()` / `count()`.",
      "`Long` ids: compare with `.equals`.",
      "GET one → 200 or 404; POST → 201; DELETE → 204.",
    ],
  },
];
