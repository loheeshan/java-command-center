import { main, type LectureGuide } from "./types";

const PRODUCTS = `class Product {
    private Long id;
    private String name;
    private double price;
    public Product(Long id, String name, double price) { this.id = id; this.name = name; this.price = price; }
    public String getName() { return name; }
    public double getPrice() { return price; }
    public String getSummary() {
        return name + " -- " + price;
    }
}

class DigitalProduct extends Product {
    private String downloadUrl;
    public DigitalProduct(Long id, String name, double price, String downloadUrl) {
        super(id, name, price);
        this.downloadUrl = downloadUrl;
    }
    public String getDownloadUrl() { return downloadUrl; }
    @Override
    public String getSummary() {
        return "Digital: " + getName() + " | Download: " + downloadUrl;
    }
}

class PhysicalProduct extends Product {
    private double weightKg;
    public PhysicalProduct(Long id, String name, double price, double weightKg) {
        super(id, name, price);
        this.weightKg = weightKg;
    }
    @Override
    public String getSummary() {
        return "Physical: " + getName() + " | " + weightKg + "kg";
    }
}
`;

export const lecture5: LectureGuide = {
  id: "lecture-5",
  week: "Week 5",
  lecture: "Lecture 5 — Polymorphism: One Call, Many Answers",
  title: "Polymorphism: @Override, runtime dispatch, abstract classes, interfaces",
  sources: [
    "WEEK-05/Lecture5_OOP_Lecture.pdf",
    "WEEK-06/Tutorial5_OOP_Lab_Guide_Student.pdf (getSummary, abstract Product, Discountable)",
    "WEEK-05/Week05.zip (static vs dynamic binding, overloaded methods)",
  ],
  goal: "Let each subclass answer the same method call its own way, and use abstract classes and interfaces correctly.",
  minutes: 75,
  outcomes: [
    "Explain why an `instanceof` chain is bad design.",
    "Override `getSummary()` correctly with `@Override` (and spot the typo bug).",
    "Tell overriding from overloading.",
    "Explain 'the reference type decides what you may call; the object type decides what runs'.",
    "Make a class abstract and use an interface (`Discountable`).",
  ],
  steps: [
    {
      title: "1. The problem: asking every object what it is",
      explain: [
        "Lecture 4 ended with one `List<Product>` holding digital and physical products. To print a different summary for each, the obvious code checks the type with `instanceof` and **casts** in every branch.",
        "It works — but every new type (say a `BundleProduct`) means editing this chain and every other chain like it. Forget one and it silently falls into the generic `else`. The principle it breaks is **Open/Closed**: open for extension, closed for modification.",
        "Lecture 5's key sentence: **Stop asking objects what they are. Ask them to do something, and let each type answer in its own way.**",
      ],
      code: `for (Product p : products) {
    if (p instanceof DigitalProduct) {
        DigitalProduct d = (DigitalProduct) p;           // cast
        print("Digital: " + d.getName() + " | " + d.getDownloadUrl());
    } else if (p instanceof PhysicalProduct) {
        PhysicalProduct ph = (PhysicalProduct) p;        // cast
        print("Physical: " + ph.getName() + " | " + ph.getWeightKg() + "kg");
    } else {
        print(p.getName());
    }
}`,
      codeTitle: "Lecture 5 slide 5 — the instanceof chain (avoid)",
      exam: "The mock paper says it directly: \"Do not use concrete subclass type checks\". The grader even runs your code with a subclass you have never seen.",
    },
    {
      title: "2. Overriding: one method, three versions",
      explain: [
        "Give the **parent** a method `getSummary()`. Then each **child** writes its own version with exactly the same name and parameters, marked `@Override`. That is **method overriding**.",
        "Now the loop is one line: `p.getSummary()`. No casts, no type checks. This is Lecture 5's 'Predict the output' slide — predict the three lines, then run it. Every variable is declared `Product`, yet three different lines print.",
      ],
      run: {
        files: main(`${PRODUCTS}
public class Main {
    public static void main(String[] args) {
        Product a = new Product(1L, "Mug", 8.50);
        Product b = new DigitalProduct(2L, "E-book", 9.99, "/dl/2");
        Product c = new PhysicalProduct(3L, "Monitor", 249.99, 5.4);
        System.out.println(a.getSummary());
        System.out.println(b.getSummary());
        System.out.println(c.getSummary());
    }
}`),
        expectedOutput: "Mug -- 8.5\nDigital: E-book | Download: /dl/2\nPhysical: Monitor | 5.4kg",
      },
      lines: [
        { code: "@Override", meaning: "Tells the compiler: 'this replaces a parent method — check that one really exists'." },
        { code: "public String getSummary()", meaning: "Same name, same (empty) parameter list, same return type as the parent's." },
        { code: "getName()", meaning: "The child uses the getter because `name` is private in Product (Lecture 4's rule still holds)." },
      ],
      exam: "This is **Task 1 and Task 2** in the real-paper shape: the subclass's own `getSummary()` (or similar) with the exact text format the paper gives. Copy the format character for character.",
    },
    {
      title: "3. What `@Override` actually protects you from",
      explain: [
        "`@Override` is an annotation, not a keyword — the code compiles without it. But it makes the compiler check that a matching parent method exists.",
        "Typo `getsummary()` (small s) **with** `@Override` → compile error *method does not override or implement a method from a supertype* — you find the bug in seconds.",
        "The same typo **without** `@Override` → it compiles, `getsummary()` is just a new method nobody calls, and the parent's generic summary prints instead. The lecture calls this **the single most common silent bug in the assessed lab practical**.",
        "Four rules for a valid override: **same name**, **same parameter list**, return type the same (or a subtype), access **never weaker** (a public method cannot become private). In IntelliJ, Ctrl+O generates a correct signature.",
      ],
      code: `public class DigitalProduct extends Product {
    @Override
    public String getsummary() {   // lower-case 's'
        return "Digital: " + getName();
    }
}
// javac: error: method does not override or implement a method from a supertype`,
      codeTitle: "Lecture 5 slide 11",
    },
    {
      title: "4. Overriding is not overloading",
      explain: [
        "**Overriding**: same name, **same** parameters, in a **child** class. Which version runs is decided at **runtime** by the real object.",
        "**Overloading**: same name, **different** parameters, usually in the **same** class. Which one runs is decided at **compile time** by the arguments you pass.",
        "Watch out: change the parameter list on an 'override' and you have silently written an overload — the parent's version keeps running.",
      ],
      run: {
        files: main(`class Product {
    private String name;
    private double price;
    public Product(String name, double price) { this.name = name; this.price = price; }
    public String getName() { return name; }

    public String getSummary() {                    // version 1
        return name;
    }
    public String getSummary(boolean verbose) {     // OVERLOAD: different parameters
        return verbose ? name + " costs " + price : name;
    }
}

class DigitalProduct extends Product {
    public DigitalProduct(String name, double price) { super(name, price); }
    @Override
    public String getSummary() {                    // OVERRIDE: same signature
        return "Digital: " + getName();
    }
}

public class Main {
    public static void main(String[] args) {
        Product p = new DigitalProduct("E-book", 9.99);
        System.out.println(p.getSummary());        // overridden version runs
        System.out.println(p.getSummary(true));    // the overload, inherited from Product
    }
}`),
        expectedOutput: "Digital: E-book\nE-book costs 9.99",
      },
      check: { q: "Parent has `getSummary()`, child writes `getSummary(boolean verbose)`. Override or overload?", a: "Overload. The parameter lists differ, so the child now has two methods and the parent's `getSummary()` still runs for plain calls." },
    },
    {
      title: "5. Every object has two types",
      explain: [
        "In `Product p = new DigitalProduct(...)` there are two types:",
        "- **Reference type** = `Product` (left of `=`). Fixed at compile time. It decides **which methods you are allowed to call**.\n- **Object type** = `DigitalProduct` (after `new`). Decided at runtime. It decides **which version actually runs**.",
        "So `p.getSummary()` compiles (Product declares it) and runs DigitalProduct's version. But `p.getDownloadUrl()` does **not** compile — Product has no such method, even though the object does.",
        "If a child has no override, the JVM walks **up** the hierarchy and runs the parent's version. Lecture 5 summary: **the reference type decides what you may call; the object type decides what runs.**",
      ],
      run: {
        files: main(`${PRODUCTS}
class BundleProduct extends Product {          // no getSummary() of its own
    public BundleProduct(Long id, String name, double price) { super(id, name, price); }
}

public class Main {
    public static void main(String[] args) {
        Product p = new DigitalProduct(2L, "E-book", 9.99, "/dl/2");
        System.out.println(p.getSummary());
        // p.getDownloadUrl();   // would NOT compile: Product has no getDownloadUrl()

        Product bundle = new BundleProduct(4L, "Starter pack", 30.0);
        System.out.println(bundle.getSummary());   // falls back to Product's version
    }
}`),
        expectedOutput: "Digital: E-book | Download: /dl/2\nStarter pack -- 30.0",
      },
      exam: "Viva: 'Product p = new DigitalProduct(...). Which getSummary() runs?' — DigitalProduct's. The object type chooses the implementation.",
    },
    {
      title: "6. Static vs dynamic binding",
      explain: [
        "Week05.zip contains an `Animal`/`Human` demo of this idea and an overloaded `rent(...)` method. Here is the same idea in a minimal program you can run.",
        "Only **instance methods that are overridden** are chosen at runtime (dynamic binding). Two things are decided at **compile time** from the reference type (static binding):",
        "- **static methods** — they belong to the class, so `a.kind()` on an `Animal` reference runs Animal's, even if the object is a Dog.\n- **which overload** — `describe(a)` picks `describe(Animal)` because `a` is declared Animal.",
      ],
      run: {
        files: main(`class Animal {
    static String kind() { return "Animal (static)"; }
    String sound() { return "..."; }
}

class Dog extends Animal {
    static String kind() { return "Dog (static)"; }
    @Override
    String sound() { return "Woof"; }
}

public class Main {
    static String describe(Animal a) { return "describe(Animal)"; }
    static String describe(Dog d) { return "describe(Dog)"; }

    public static void main(String[] args) {
        Animal a = new Dog();
        System.out.println(a.sound());     // dynamic: object type Dog
        System.out.println(Animal.kind()); // static methods: by class name
        System.out.println(describe(a));   // overload chosen at compile time
        System.out.println(describe(new Dog()));
    }
}`),
        expectedOutput: "Woof\nAnimal (static)\ndescribe(Animal)\ndescribe(Dog)",
      },
    },
    {
      title: "7. Abstract classes: a parent nobody should create",
      explain: [
        "In the shop there is no 'plain' product — everything is digital or physical. So mark the parent `abstract`:",
        "- `new Product(...)` now gives a compile error *Product is abstract; cannot be instantiated*.\n- It **keeps** its fields, constructors and normal methods (`getName()` is still written once and inherited).\n- An **abstract method** has no body — it ends with `;` — and **every** concrete subclass must implement it, or it will not compile.",
        "Rule from the slide: use an abstract class when subclasses share **real state and real code**, and there is at least one thing only they can answer.",
      ],
      run: {
        files: main(`abstract class Product {
    private String name;
    private double price;
    public Product(String name, double price) { this.name = name; this.price = price; }
    public String getName() { return name; }
    public double getPrice() { return price; }
    public abstract String getSummary();     // no body: subclasses must write it
}

class DigitalProduct extends Product {
    private String downloadUrl;
    public DigitalProduct(String name, double price, String downloadUrl) {
        super(name, price);
        this.downloadUrl = downloadUrl;
    }
    @Override
    public String getSummary() { return "Digital: " + getName() + " | " + downloadUrl; }
}

class PhysicalProduct extends Product {
    private double weightKg;
    public PhysicalProduct(String name, double price, double weightKg) {
        super(name, price);
        this.weightKg = weightKg;
    }
    @Override
    public String getSummary() { return "Physical: " + getName() + " | " + weightKg + "kg"; }
}

public class Main {
    public static void main(String[] args) {
        // Product p = new Product("Mug", 8.5);   // compile error: Product is abstract
        java.util.List<Product> products = java.util.List.of(
            new DigitalProduct("E-book", 9.99, "/dl/1"),
            new PhysicalProduct("Monitor", 249.99, 5.4));
        for (Product p : products) {
            System.out.println(p.getSummary());
        }
    }
}`),
        expectedOutput: "Digital: E-book | /dl/1\nPhysical: Monitor | 5.4kg",
      },
      exam: "In the practical the base class (like `Ticket` or `DispatchMission`) is often abstract. Your new subclass in Task 2 must implement **every** abstract method or the project will not compile — and Section B only runs if it compiles.",
    },
    {
      title: "8. Interfaces: what a class can DO",
      explain: [
        "A class can `extend` only **one** class, but it can `implement` **many interfaces**. Inheritance answers *what is this thing?*; an interface answers *what can this thing do?*",
        "An interface is a **contract**: method headers with no bodies (classic Java). Each class that `implements` it must write those methods. Below is Lecture 5's `Discountable`: same contract, two different rules — digital products take the full discount; physical ones are capped at 20%.",
        "When you have a `Product` reference, ask about the **capability** with `if (p instanceof Discountable d)` — the lecture says that is legitimate, because you are asking about a capability, not switching on concrete classes.",
      ],
      run: {
        files: main(`interface Discountable {
    void applyDiscount(double rate);
    double getDiscountedPrice();
}

abstract class Product {
    private String name;
    private double price;
    public Product(String name, double price) { this.name = name; this.price = price; }
    public String getName() { return name; }
    public double getPrice() { return price; }
}

class DigitalProduct extends Product implements Discountable {
    private double discountedPrice;
    public DigitalProduct(String name, double price) { super(name, price); discountedPrice = price; }
    @Override
    public void applyDiscount(double rate) {
        discountedPrice = getPrice() * (1 - rate);           // full rate applies
    }
    @Override
    public double getDiscountedPrice() { return discountedPrice; }
}

class PhysicalProduct extends Product implements Discountable {
    private double discountedPrice;
    public PhysicalProduct(String name, double price) { super(name, price); discountedPrice = price; }
    @Override
    public void applyDiscount(double rate) {
        double capped = Math.min(rate, 0.20);                // cap at 20%
        discountedPrice = getPrice() * (1 - capped);
    }
    @Override
    public double getDiscountedPrice() { return discountedPrice; }
}

class GiftCard extends Product {                             // NOT discountable
    public GiftCard(String name, double price) { super(name, price); }
}

public class Main {
    public static void main(String[] args) {
        java.util.List<Product> products = java.util.List.of(
            new DigitalProduct("E-book", 10.0),
            new PhysicalProduct("Monitor", 200.0),
            new GiftCard("Gift card", 50.0));
        for (Product p : products) {
            if (p instanceof Discountable d) {
                d.applyDiscount(0.5);
                System.out.println(p.getName() + " -> " + d.getDiscountedPrice());
            } else {
                System.out.println(p.getName() + " -> no discount");
            }
        }
    }
}`),
        expectedOutput: "E-book -> 5.0\nMonitor -> 160.0\nGift card -> no discount",
      },
      table: {
        head: ["abstract class — what it IS", "interface — what it CAN DO"],
        rows: [
          ["Can hold fields and constructors (shared state)", "No instance fields, no constructor — a pure contract"],
          ["Can mix abstract and normal methods", "Classic Java: method headers only"],
          ["A class extends only one", "A class implements as many as it needs"],
          ["Choose when subclasses share data and code", "Choose when unrelated classes need the same capability"],
        ],
      },
    },
    {
      title: "9. UML for abstraction",
      explain: [
        "- An **abstract** class name (and abstract methods) is written in *italics*. On paper, many people also write {abstract}.\n- An interface has the stereotype **«interface»** above its name.\n- `extends` = solid line + hollow triangle at the parent.\n- `implements` = **dashed** line + hollow triangle at the interface.",
      ],
      code: `      +-------------------------+          +---------------------------+
      |   «abstract» Product    |          |      «interface»          |
      |   (name in italics)     |          |      Discountable         |
      +-------------------------+          +---------------------------+
      | - name : String         |          | + applyDiscount(double)   |
      | - price : double        |          | + getDiscountedPrice()    |
      +-------------------------+          +---------------------------+
      | + getSummary() : String |                       ^
      +-------------------------+                       :  dashed line =
                 /_\\  solid line = extends             :  implements
         +--------+---------+ . . . . . . . . . . . . . .
         |                  |
  DigitalProduct      PhysicalProduct`,
      codeTitle: "Lecture 5 slide 33 — the full picture",
    },
  ],
  viva: [
    { q: "What is polymorphism?", a: "One method call that behaves differently depending on the actual object's class, chosen at runtime (dynamic dispatch)." },
    { q: "What does @Override do?", a: "It asks the compiler to check that the method really overrides a parent method, so a typo becomes a compile error instead of a silent bug." },
    { q: "Overriding vs overloading?", a: "Overriding: same signature in a subclass, chosen at runtime by the object. Overloading: same name, different parameters, chosen at compile time by the arguments." },
    { q: "Product p = new DigitalProduct(...). Can you call p.getDownloadUrl()?", a: "No. The reference type Product has no such method. The reference type decides what you may call." },
    { q: "Abstract class or interface?", a: "Abstract class for shared state and code in an IS-A hierarchy; interface for a capability that unrelated classes can share — and a class can implement many." },
    { q: "Why avoid instanceof chains?", a: "Every new type forces edits in every chain (breaks Open/Closed); polymorphism lets each class answer for itself." },
  ],
  next: [
    { href: "/learn/abstract-overriding", label: "Lesson: Abstract classes and overriding" },
    { href: "/learn/polymorphism", label: "Lesson: Polymorphism" },
    { href: "/learn/interfaces-enums", label: "Lesson: Interfaces and enums" },
    { href: "/oop-lab#polymorphism", label: "OOP Lab: pick an object type, watch which method runs" },
    { href: "/exam/tickets", label: "Exam practice: Task 2 — create a new subclass" },
  ],
};
