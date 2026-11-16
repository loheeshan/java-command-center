import { main, type LectureGuide } from "./types";

export const lecture3: LectureGuide = {
  id: "lecture-3",
  week: "Week 3",
  lecture: "Lecture 3 — Collections, Generics & the Service Layer",
  title: "Lists, maps, generics and moving logic into a service",
  sources: ["WEEK-03/Lecture3_OOP_Lecture.pdf", "WEEK-04/Tutorial3_OOP_Lab_Guide_Student.pdf (ProductService, GET/POST/GET by id/DELETE)"],
  goal: "Hold many objects in a `List` or `Map`, and keep that logic in a service class instead of the controller.",
  minutes: 55,
  outcomes: [
    "Explain why a `List` beats an array for a catalogue.",
    "Use the six everyday list operations and loop over a list.",
    "Explain what `<Product>` (generics) buys you.",
    "Use a `HashMap` for lookup by id.",
    "Explain cohesion, coupling and why the controller calls a service.",
  ],
  steps: [
    {
      title: "1. Why collections?",
      explain: [
        "After Lecture 2 the shop has exactly one hard-coded product. Making `p1`, `p2`, `p3` variables does not scale: 500 products would need 500 variable names, and nobody can add a product while the app is running.",
        "An **array** (`Product[]`) holds many values but its length is fixed when you create it. A **List** starts empty and grows when you `add()`. Real Spring projects use lists.",
        "Note the type on each side: `List<Product> products = new ArrayList<>();` — `List` is the **interface** (the promise: ordered, can add/get/remove), `ArrayList` is the **class** that actually does it. Declare variables with the interface so the implementation could change later.",
      ],
    },
    {
      title: "2. The six list operations you will actually use",
      explain: [
        "Lecture 3 says these six cover every list operation in your coursework: `add`, `get`, `size`, `remove`, `contains`, `isEmpty`. Indexes start at **0**.",
      ],
      run: {
        files: main(`import java.util.ArrayList;
import java.util.List;

class Product {
    private Long id;
    private String name;
    private double price;
    public Product(Long id, String name, double price) { this.id = id; this.name = name; this.price = price; }
    public Long getId() { return id; }
    public String getName() { return name; }
    public double getPrice() { return price; }
}

public class Main {
    public static void main(String[] args) {
        List<Product> products = new ArrayList<>();
        System.out.println(products.isEmpty());
        products.add(new Product(1L, "Laptop", 899.99));
        products.add(new Product(2L, "Mouse", 24.99));
        products.add(new Product(3L, "Monitor", 249.99));
        System.out.println(products.size());
        System.out.println(products.get(0).getName());   // first element
        products.remove(1);                               // removes the Mouse
        System.out.println(products.size() + " " + products.get(1).getName());

        List<String> names = new ArrayList<>(List.of("Laptop", "Monitor"));
        System.out.println(names.contains("Monitor"));    // uses equals()
    }
}`),
        expectedOutput: "true\n3\nLaptop\n2 Monitor\ntrue",
      },
      check: { q: "A list has 3 elements. What does `get(3)` do?", a: "It throws `IndexOutOfBoundsException`. The valid indexes are 0, 1 and 2." },
    },
    {
      title: "3. Walking the list, and finding one item",
      explain: [
        "Read `for (Product p : products)` as **for each Product p in products**. This enhanced for loop is what you will write most.",
        "To find one product by id 'the long way', loop and compare. Compare `Long` ids with `.equals()` — they are objects, like Strings.",
        "Lecture 3 returns `null` when nothing matches and says 'we will fix this in Lecture 6'. In the exam that 'fix' is throwing your own not-found exception (Task 3).",
      ],
      run: {
        files: main(`import java.util.ArrayList;
import java.util.List;

class Product {
    private Long id;
    private String name;
    public Product(Long id, String name) { this.id = id; this.name = name; }
    public Long getId() { return id; }
    public String getName() { return name; }
}

public class Main {
    static Product findById(List<Product> products, Long id) {
        for (Product p : products) {
            if (p.getId().equals(id)) {
                return p;
            }
        }
        return null;   // Lecture 6 replaces this with an exception
    }

    public static void main(String[] args) {
        List<Product> products = new ArrayList<>();
        products.add(new Product(1L, "Laptop"));
        products.add(new Product(2L, "Mouse"));

        for (Product p : products) {
            System.out.println(p.getId() + ": " + p.getName());
        }
        products.forEach(p -> System.out.println("lambda: " + p.getName()));

        System.out.println(findById(products, 2L).getName());
        System.out.println(findById(products, 99L));
    }
}`),
        expectedOutput: "1: Laptop\n2: Mouse\nlambda: Laptop\nlambda: Mouse\nMouse\nnull",
      },
    },
    {
      title: "4. Generics: the label on the box",
      explain: [
        "`List<Product>` means *a list that only holds Products*. The `<Product>` part is called a **generic type**. Lecture 3's analogy: a labelled box — only Products go in, so you always know what comes out.",
        "Without it (a 'raw' `List`), you could add a String by mistake and only find out when the program crashes with `ClassCastException`. With it, the compiler stops you before the program even runs.",
      ],
      code: `List<Product> items = new ArrayList<>();
items.add(new Product(1L, "Mug", 8.50));   // A: compiles
items.add("Mug");                           // B: compile error - a String is not a Product
String s = items.get(0);                    // C: compile error - get(0) gives a Product
int total = items.size();                   // D: compiles - size() is always an int`,
      codeTitle: "Lecture 3 'Will it compile?' vote",
      exam: "Report sentence from the slide: \"The catalogue is held in a List<Product>, so the compiler guarantees every element is a Product.\"",
    },
    {
      title: "5. Map<K,V>: find by key without scanning",
      explain: [
        "A `Map` stores **key → value** pairs. `HashMap<Long, Product>` lets you jump straight to the product with id 2, instead of checking every element of a list.",
        "Main operations: `put(key, value)`, `get(key)` (returns `null` if missing), `containsKey(key)`, `remove(key)`, `size()`, `values()`.",
      ],
      run: {
        files: main(`import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<Long, String> products = new HashMap<>();
        products.put(1L, "Laptop");
        products.put(2L, "Mouse");
        products.put(2L, "Wireless Mouse");   // same key: replaces the value
        System.out.println(products.size());
        System.out.println(products.get(2L));
        System.out.println(products.get(99L));
        System.out.println(products.containsKey(1L));
        products.remove(1L);
        System.out.println(products.containsKey(1L));
    }
}`),
        expectedOutput: "2\nWireless Mouse\nnull\ntrue\nfalse",
      },
    },
    {
      title: "6. Cohesion, coupling and the service layer",
      explain: [
        "**Cohesion**: one class, one clear job. **Coupling**: how much one class depends on the insides of another. Good design = **high cohesion, low coupling** (the vocabulary your report is marked on).",
        "So the **controller** only deals with HTTP (paths, status codes). The list of products and the logic (find, add, delete) move into a **service** class. The controller calls the service.",
        "Below is the service as plain Java, so you can run it. In Spring you add `@Service` on the class and the controller receives it (Lecture 7 explains how).",
      ],
      run: {
        files: main(`import java.util.ArrayList;
import java.util.List;

class Product {
    private Long id;
    private String name;
    public Product(Long id, String name) { this.id = id; this.name = name; }
    public Long getId() { return id; }
    public String getName() { return name; }
}

class ProductService {                        // @Service in Spring
    private final List<Product> products = new ArrayList<>();

    public List<Product> getAll() { return products; }

    public Product add(Product p) {
        products.add(p);
        return p;
    }

    public Product getById(Long id) {
        for (Product p : products) {
            if (p.getId().equals(id)) return p;
        }
        return null;
    }

    public boolean delete(Long id) {
        return products.removeIf(p -> p.getId().equals(id));
    }
}

public class Main {
    public static void main(String[] args) {
        ProductService service = new ProductService();
        service.add(new Product(1L, "Laptop"));
        service.add(new Product(2L, "Mouse"));
        System.out.println(service.getAll().size());
        System.out.println(service.getById(1L).getName());
        System.out.println(service.delete(2L) + " " + service.getAll().size());
    }
}`),
        expectedOutput: "2\nLaptop\ntrue 1",
      },
      code: `@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping                       // GET /products
    public List<Product> getAll() { return productService.getAll(); }

    @GetMapping("/{id}")              // GET /products/1
    public Product getById(@PathVariable Long id) { return productService.getById(id); }

    @PostMapping                      // POST /products  (JSON body)
    public Product add(@RequestBody Product p) { return productService.add(p); }

    @DeleteMapping("/{id}")           // DELETE /products/1
    public void delete(@PathVariable Long id) { productService.delete(id); }
}`,
      codeTitle: "The same idea in Spring: four CRUD endpoints (needs the full project, so read only)",
      exam: "In the practical the starter project already has controller → service → repository. Your job is to fill in methods in the right layer. Logic in the service, HTTP in the controller.",
    },
  ],
  viva: [
    { q: "Why `List` on the left and `ArrayList` on the right?", a: "The variable depends only on the List contract (interface). The implementation can be swapped later without changing other code." },
    { q: "What do generics give you?", a: "Type safety checked by the compiler, no casts, and code that documents what the collection holds." },
    { q: "When would you use a Map instead of a List?", a: "When you look things up by a key (like an id) — the map finds it directly instead of scanning every element." },
    { q: "What are cohesion and coupling?", a: "Cohesion: how focused a class is on one job (want high). Coupling: how much classes depend on each other's details (want low)." },
    { q: "Why have a service layer?", a: "To keep business logic out of the controller, so the controller only handles HTTP and the logic can be reused and tested separately." },
  ],
  next: [
    { href: "/learn/collections-generics", label: "Lesson: Collections and generics" },
    { href: "/learn/spring-layers-di", label: "Lesson: Spring layers" },
    { href: "/algorithms", label: "Lab: sorting a list visually" },
  ],
};

export const lecture4: LectureGuide = {
  id: "lecture-4",
  week: "Week 4",
  lecture: "Lecture 4 — Inheritance: Reuse Without Repetition",
  title: "Inheritance: extends, super(...), IS-A vs HAS-A",
  sources: ["WEEK-04/Lecture4_OOP_Lecture.pdf", "WEEK-05/Tutorial4_OOP_Lab_Guide_Student.pdf (DigitalProduct, PhysicalProduct)"],
  goal: "Make DigitalProduct and PhysicalProduct reuse Product with `extends`, and wire their constructors with `super(...)`.",
  minutes: 60,
  outcomes: [
    "Explain the duplicate-code problem inheritance solves.",
    "Write a subclass with its own fields and a constructor that calls `super(...)` first.",
    "Explain what a subclass does and does not inherit (constructors, private fields).",
    "Decide IS-A (extends) vs HAS-A (a field).",
    "Draw the inheritance arrow correctly in UML.",
  ],
  steps: [
    {
      title: "1. The problem: copy-paste classes",
      explain: [
        "The shop now sells e-books. The quick way is to copy `Product` into `DigitalProduct` and add `downloadUrl`. It compiles and works — that is why this mistake survives.",
        "Then marketing asks for a `discountPrice` on every product. Now you must edit **both** files (field, getter, setter in each). Miss one, and the classes silently disagree. The lecture calls this smell **shotgun surgery**; the principle it breaks is **DRY — Don't Repeat Yourself**.",
      ],
      code: `public class DigitalProduct {
    private Long id;            // copied from Product
    private String name;        // copied
    private double price;       // copied
    private String downloadUrl; // the only new thing
}`,
      codeTitle: "Lecture 4 slide 4 — the wrong way",
    },
    {
      title: "2. `extends`: the child gets the parent's members",
      explain: [
        "`public class DigitalProduct extends Product` means *a DigitalProduct is a Product, plus more*. `Product` is the **superclass** (parent); `DigitalProduct` is the **subclass** (child).",
        "The child only declares what is **different** (`downloadUrl`, `fileSizeMB`). It automatically has `getName()` and `getPrice()` from Product — you did not write them in DigitalProduct, but you can call them.",
        "Java allows only **one** parent per class (single inheritance).",
      ],
      run: {
        files: main(`class Product {
    private Long id;
    private String name;
    private double price;

    public Product(Long id, String name, double price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }
    public String getName() { return name; }
    public double getPrice() { return price; }
}

class DigitalProduct extends Product {
    private String downloadUrl;
    private double fileSizeMB;

    public DigitalProduct(Long id, String name, double price, String downloadUrl, double fileSizeMB) {
        super(id, name, price);            // parent sets id, name, price
        this.downloadUrl = downloadUrl;    // child sets its own fields
        this.fileSizeMB = fileSizeMB;
    }
    public String getDownloadUrl() { return downloadUrl; }
    public double getFileSizeMB() { return fileSizeMB; }
}

public class Main {
    public static void main(String[] args) {
        DigitalProduct ebook = new DigitalProduct(1L, "Clean Code", 29.99, "/downloads/clean-code.pdf", 4.2);
        System.out.println(ebook.getName());          // inherited from Product
        System.out.println(ebook.getPrice());         // inherited
        System.out.println(ebook.getDownloadUrl());   // its own
        Product p = ebook;                            // a child IS-A parent
        System.out.println(p.getName());
    }
}`),
        expectedOutput: "Clean Code\n29.99\n/downloads/clean-code.pdf\nClean Code",
      },
      table: {
        head: ["Inherited", "Not inherited"],
        rows: [
          ["public and protected fields and methods", "Constructors — never, ever"],
          ["package-private members (same package)", "private fields and methods (use the getters)"],
          ["the parent's public API: getName(), getPrice()", "static initialiser blocks"],
        ],
      },
    },
    {
      title: "3. `super(...)`: the child hands work to the parent",
      explain: [
        "Constructors are **not inherited**. So the child's constructor must call the parent's constructor with `super(...)` to fill in the inherited fields.",
        "The order (Lecture 4 slide 14): **1** the child constructor is entered → **2** `super(...)` runs the parent constructor first → **3** the parent finishes → **4** the child sets its own fields.",
        "Rule: `super(...)` must be the **very first statement** in the child constructor. The program below prints the order so you can see it.",
      ],
      run: {
        files: main(`class Product {
    private String name;
    public Product(String name) {
        System.out.println("2. Product constructor sets name");
        this.name = name;
    }
    public String getName() { return name; }
}

class PhysicalProduct extends Product {
    private double weightKg;
    public PhysicalProduct(String name, double weightKg) {
        super(name);                                   // must be first
        System.out.println("3. PhysicalProduct sets weightKg");
        this.weightKg = weightKg;
    }
    public double getWeightKg() { return weightKg; }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("1. calling new PhysicalProduct(...)");
        PhysicalProduct monitor = new PhysicalProduct("Monitor", 5.4);
        System.out.println("4. done: " + monitor.getName() + " " + monitor.getWeightKg() + "kg");
    }
}`),
        expectedOutput: "1. calling new PhysicalProduct(...)\n2. Product constructor sets name\n3. PhysicalProduct sets weightKg\n4. done: Monitor 5.4kg",
      },
      tryIt: "Move `super(name);` below the println line and run: compile error. Then delete it completely: the error becomes 'constructor Product in class Product cannot be applied to given types' — Java tried to insert `super()` with no arguments, and Product has no no-arg constructor.",
      exam: "This is exactly **Task 1** of the real-paper shape: complete a subclass — add the field, call `super(...)` with the right arguments **in the right order**, set the child field.",
    },
    {
      title: "4. If you forget `super(...)`",
      explain: [
        "If you write no `super(...)`, Java silently inserts `super()` — the **no-argument** version. If the parent only has a constructor with parameters, there is nothing to call and you get a compile error.",
        "Two fixes from the slide: call `super(id, name, price)` explicitly (what you want for your own code), **and** give the class a no-arg constructor for Jackson. In Spring model classes, have both — including in the subclass:",
      ],
      code: `public class DigitalProduct extends Product {
    private String downloadUrl;
    private double fileSizeMB;

    public DigitalProduct() {}       // for Jackson (calls Product's no-arg constructor)

    public DigitalProduct(Long id, String name, double price,
                          String downloadUrl, double fileSizeMB) {
        super(id, name, price);      // must be the first line
        this.downloadUrl = downloadUrl;
        this.fileSizeMB = fileSizeMB;
    }
}`,
      codeTitle: "Lecture 4 slide 33 — the complete subclass",
      exam: "If POSTing a subclass gives a 500/400 error, check for the missing no-arg constructor first (Lecture 4 slide 35).",
    },
    {
      title: "5. Private still means private",
      explain: [
        "Inheritance does **not** break encapsulation. `price` is `private` in Product, so inside DigitalProduct writing `price` directly is a compile error. Call `getPrice()` instead — that is the correct answer.",
        "`protected` is the middle ground: visible to subclasses. Lecture 4's practical rule: **fields private, methods public, protected only when a subclass has a real need**.",
      ],
      code: `class DigitalProduct extends Product {
    public String label() {
        // return name + " " + price;          // COMPILE ERROR: private in Product
        return getName() + " " + getPrice();   // correct: use the public getters
    }
}`,
      exam: "In `getSummary()` methods (Task 1 and 2) use the getters for parent fields — `getName()`, not `name`.",
    },
    {
      title: "6. IS-A or HAS-A?",
      explain: [
        "Say the sentence out loud. *\"A DigitalProduct **is a** Product\"* — true, so use `extends`. *\"A ShoppingCart **is a** Product\"* — false; a cart **has** products, so give it a **field**: `private List<Product> items`.",
        "HAS-A comes in two strengths: **composition** (strong — an Order owns its OrderLines; delete the order and the lines go; UML filled diamond) and **aggregation** (weak — a cart holds Products that exist without it; UML hollow diamond). In Java both are just a field.",
      ],
      run: {
        files: main(`import java.util.ArrayList;
import java.util.List;

class Product {
    private String name;
    private double price;
    public Product(String name, double price) { this.name = name; this.price = price; }
    public double getPrice() { return price; }
}

class ShoppingCart {                                  // HAS-A, not IS-A
    private final List<Product> items = new ArrayList<>();
    public void add(Product p) { items.add(p); }
    public double getTotal() {
        double total = 0;
        for (Product p : items) total += p.getPrice();
        return total;
    }
}

public class Main {
    public static void main(String[] args) {
        ShoppingCart cart = new ShoppingCart();
        cart.add(new Product("Mug", 8.50));
        cart.add(new Product("Book", 12.00));
        System.out.println(cart.getTotal());
    }
}`),
        expectedOutput: "20.5",
      },
      table: {
        head: ["Pair", "Answer"],
        rows: [
          ["PhysicalProduct → Product", "IS-A (extends)"],
          ["ShoppingCart → Product", "HAS-A (field)"],
          ["Car → Engine", "HAS-A (composition)"],
          ["Manager → Employee", "IS-A"],
          ["Order → Customer", "HAS-A"],
        ],
      },
    },
    {
      title: "7. One list, two types",
      explain: [
        "Because both subclasses **are** Products, one `List<Product>` can hold both. No casting, no separate lists — and `GET /products` returns both in one JSON array, each with its own extra fields.",
        "This is the setup for Lecture 5: call **one** method on every item and let each type answer differently.",
      ],
      run: {
        files: main(`import java.util.ArrayList;
import java.util.List;

class Product {
    private Long id; private String name; private double price;
    public Product(Long id, String name, double price) { this.id = id; this.name = name; this.price = price; }
    public String getName() { return name; }
}
class DigitalProduct extends Product {
    private String downloadUrl;
    public DigitalProduct(Long id, String name, double price, String downloadUrl) {
        super(id, name, price);
        this.downloadUrl = downloadUrl;
    }
}
class PhysicalProduct extends Product {
    private double weightKg;
    public PhysicalProduct(Long id, String name, double price, double weightKg) {
        super(id, name, price);
        this.weightKg = weightKg;
    }
}

public class Main {
    public static void main(String[] args) {
        List<Product> products = new ArrayList<>();
        products.add(new DigitalProduct(1L, "E-book", 9.99, "/dl/1"));
        products.add(new PhysicalProduct(2L, "Monitor", 249.99, 5.4));
        for (Product p : products) {
            System.out.println(p.getName() + " is a " + p.getClass().getSimpleName());
        }
    }
}`),
        expectedOutput: "E-book is a DigitalProduct\nMonitor is a PhysicalProduct",
      },
    },
    {
      title: "8. UML: the hollow triangle points at the parent",
      explain: [
        "Inheritance in UML is a **solid line with a hollow triangle**, and the triangle sits at the **parent** end. Arrow direction is commonly marked wrong.",
        "Do **not** repeat inherited attributes in the child box — the arrow already says they are there.",
      ],
      code: `              +---------------------+
              |      Product        |
              +---------------------+
              | - id : Long         |
              | - name : String     |
              | - price : double    |
              +---------------------+
                        /_\\   (hollow triangle at the parent)
                         |
          +--------------+---------------+
          |                              |
+-----------------------+   +-----------------------+
|    DigitalProduct     |   |    PhysicalProduct    |
+-----------------------+   +-----------------------+
| - downloadUrl : String|   | - weightKg : double   |
| - fileSizeMB : double |   | - dimensions : String |
+-----------------------+   +-----------------------+`,
      codeTitle: "Lecture 4 slide 31 — the hierarchy you build in Tutorial 4",
    },
  ],
  viva: [
    { q: "Which member of a parent class is never inherited?", a: "The constructor. A subclass must call it with `super(...)`." },
    { q: "Why must `super(...)` be the first line?", a: "The parent part of the object must be initialised before the child adds anything to it; Java enforces it at compile time." },
    { q: "Can a subclass use the parent's private field directly?", a: "No. It must use the public getter (or the field must be protected)." },
    { q: "Why does `Product p = ebook;` compile?", a: "Because a DigitalProduct IS-A Product, so a child object fits anywhere the parent type is expected." },
    { q: "When should you NOT use inheritance?", a: "When the relationship is HAS-A (ownership), e.g. a cart has products. Use a field instead." },
  ],
  next: [
    { href: "/learn/inheritance-super", label: "Lesson: Inheritance and super(...)" },
    { href: "/oop-lab#inheritance", label: "OOP Lab: inheritance visualizer" },
    { href: "/exam/tickets", label: "Exam practice Task 1 & 2: complete and create a subclass" },
  ],
};
