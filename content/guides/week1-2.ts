import { main, type LectureGuide } from "./types";

export const week1: LectureGuide = {
  id: "week-1",
  week: "Week 1",
  lecture: "Lecture 1 + Week 1 OOP notes + Java Refresher tutorial",
  title: "Java from zero, then your first class",
  sources: [
    "WEEK-01/Lecture1_OOP_Lecture.pdf (Java recap, Product class)",
    "WEEK-01/5COSC019C_Week_01_OOP_Lecture_Notes.docx (EquipmentItem, predict-the-output table)",
    "WEEK-01/Week_01_Tutorial_Java_Refresher.docx",
  ],
  goal: "Read and run small Java programs, then turn loose variables into a class with objects.",
  minutes: 60,
  outcomes: [
    "Explain what `public static void main` is and run a program.",
    "Use `int`, `double`, `boolean`, `String` and predict tricky results like `7 / 2`.",
    "Write a method with parameters and a return value.",
    "Explain class vs object vs reference variable, `new` and `this` — the Week 1 viva questions.",
  ],
  steps: [
    {
      title: "1. Your first Java program",
      explain: [
        "Every Java program starts in a method called `main`. Java looks for exactly this line: `public static void main(String[] args)`. Whatever is inside its curly braces `{ }` runs from top to bottom.",
        "`System.out.println(...)` prints one line. Every statement ends with a semicolon `;`. Code always lives inside a **class** — here the class is called `Main`, so the file must be called `Main.java`.",
        "Press **Run on JDK**. Your code is compiled by `javac` (checks it and turns it into bytecode) and then run by `java` (the JVM). That is the same thing IntelliJ's green Run button does.",
      ],
      run: {
        files: main(`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
        System.out.println("2 + 3 = " + (2 + 3));
    }
}`),
        expectedOutput: "Hello, Java!\n2 + 3 = 5",
      },
      lines: [
        { code: "public class Main {", meaning: "Declares a class called Main. Everything in Java sits inside a class." },
        { code: "public static void main(String[] args) {", meaning: "The starting point. `static` = Java can call it without creating an object first. `void` = it returns nothing." },
        { code: "System.out.println(\"Hello, Java!\");", meaning: "Print the text and move to a new line." },
        { code: "\"2 + 3 = \" + (2 + 3)", meaning: "The brackets are worked out first (5), then joined onto the text." },
      ],
      tryIt: "Remove one semicolon and run again. Read the compiler error — it tells you the line number. Then put it back.",
      check: { q: "What happens if you rename the method to `Main` instead of `main`?", a: "It still compiles, but the JVM cannot find the entry point `main`, so it refuses to run. Java is case-sensitive." },
    },
    {
      title: "2. Variables and the four everyday types",
      explain: [
        "A variable is a named box that holds a value. In Java you must say the **type** of the box when you create it, and it can never hold a different type later.",
        "The four types your lecturer uses all the time: `int` (whole numbers), `double` (decimals), `boolean` (`true` / `false`) and `String` (text, in double quotes).",
        "This program is the Week 1 notes' **predict-the-output** table. Before you press Run, write down what you think each line prints. The surprising ones are the reason this step exists.",
      ],
      run: {
        files: main(`public class Main {
    public static void main(String[] args) {
        int quantity = 10;
        double price = 19.99;
        String name = "Laptop";
        boolean inStock = true;
        System.out.println(name + " in stock: " + inStock + ", qty " + quantity + ", price " + price);

        System.out.println(7 / 2);            // int / int
        System.out.println(7 / 2.0);          // one side is a double
        System.out.println("Total: " + 3 + 4);
        System.out.println(3 + 4 + " items");
        System.out.println(10 % 3);           // remainder
        System.out.println("Java".equals("java"));
    }
}`),
        expectedOutput: "Laptop in stock: true, qty 10, price 19.99\n3\n3.5\nTotal: 34\n7 items\n1\nfalse",
      },
      table: {
        head: ["Line", "Prints", "Why"],
        rows: [
          ["`7 / 2`", "`3`", "Both are `int`, so Java does whole-number division and throws away the .5"],
          ["`7 / 2.0`", "`3.5`", "One side is a `double`, so the result is a decimal"],
          ["`\"Total: \" + 3 + 4`", "`Total: 34`", "Left to right: text + 3 = \"Total: 3\", then + 4 joins another character"],
          ["`3 + 4 + \" items\"`", "`7 items`", "3 + 4 is maths first (7), then joined to the text"],
          ["`10 % 3`", "`1`", "`%` gives the remainder of the division"],
          ["`\"Java\".equals(\"java\")`", "`false`", "Compare Strings with `.equals()`, and it is case-sensitive"],
        ],
      },
      exam: "Integer division is a classic trap in calculations (for example an average or a percentage). If you need a decimal, make one side a `double`.",
      check: { q: "Why do we compare Strings with `.equals()` and not `==`?", a: "`==` checks whether two variables point to the very same object in memory. `.equals()` checks whether the text inside is the same — which is almost always what you mean." },
    },
    {
      title: "3. Methods: parameters in, a value out",
      explain: [
        "A **method** is a named block of code you can call again and again. This is the `calculateTotal` method from Lecture 1.",
        "Read the first line of a method from left to right: who can call it (`public`), whether it needs an object (`static` — here no), what it gives back (`double`), its name, and the **parameters** it needs in brackets.",
        "When you call it, the values you pass are called **arguments**. `return` sends the answer back to the caller.",
      ],
      run: {
        files: main(`public class Main {
    public static double calculateTotal(int qty, double unitPrice) {
        return qty * unitPrice;
    }

    public static void printSeparator() {      // void: does something, returns nothing
        System.out.println("----------");
    }

    public static void main(String[] args) {
        double total = calculateTotal(10, 19.99);
        System.out.println(total);
        System.out.printf("%.2f%n", total);  // rounded to 2 decimal places
        printSeparator();
        if (total > 100) {
            System.out.println("Expensive order");
        } else {
            System.out.println("Small order");
        }
        for (int i = 0; i < 3; i++) {
            System.out.println("Item " + i);
        }
    }
}`),
        expectedOutput: "199.89999999999998\n199.90\n----------\nExpensive order\nItem 0\nItem 1\nItem 2",
      },
      lines: [
        { code: "public static double calculateTotal(int qty, double unitPrice)", meaning: "Returns a `double`; needs an `int` and a `double` — in that order." },
        { code: "return qty * unitPrice;", meaning: "Work out the answer and hand it back." },
        { code: "double total = calculateTotal(10, 19.99);", meaning: "Call the method with two arguments and keep the answer in `total`." },
        { code: "System.out.printf(\"%.2f%n\", total);", meaning: "Formatted print: `%.2f` = two decimal places, `%n` = new line." },
        { code: "for (int i = 0; i < 3; i++)", meaning: "Start i at 0; keep going while i < 3; add 1 each time. Runs for 0, 1, 2." },
      ],
      exam: "Notice the first line prints `199.89999999999998`, not `199.9`. A `double` cannot store most decimals exactly (the Week 1 notes show the same with `0.1 + 0.2`). Lecture 1's slide says the output is `199.9` — the real JDK prints the longer number. Use `printf(\"%.2f\")` when you show money.",
      tryIt: "Call `calculateTotal(\"three\", 2.50)`. The compiler refuses: a String is not an int. That is Java catching a bug before the program even runs.",
    },
    {
      title: "4. The problem a class solves",
      explain: [
        "Week 1's notes start with an equipment-lending office. With only variables, every item needs four separate boxes: `id1, name1, cost1, available1`, then `id2, name2 ...`. Nothing in the code says these four belong together — only the programmer remembers.",
        "A **class** fixes this. You define a new type, `EquipmentItem`, that says: *every equipment item has an id, a name, a cost and an availability*. Then each real item is one **object** of that type.",
        "- **Class** = the blueprint (written once).\n- **Object** = one thing built from the blueprint with `new` (as many as you like).\n- **Fields** = the data each object holds (its *state*).\n- **Methods** = what the object can do (its *behaviour*).",
      ],
      code: `// Before: loose variables (fragile)
long id1 = 101L;  String name1 = "Laptop"; double cost1 = 850.0; boolean available1 = true;
long id2 = 102L;  String name2 = "Camera"; double cost2 = 620.0; boolean available2 = false;

// After: one type, two objects
EquipmentItem item1 = new EquipmentItem(101L, "Laptop", 850.0, true);
EquipmentItem item2 = new EquipmentItem(102L, "Camera", 620.0, false);`,
      codeTitle: "From loose data to objects (Week 1 notes, section 10)",
      check: { q: "If you create 100 EquipmentItem objects, how many EquipmentItem classes exist?", a: "One. All 100 objects are built from the same single blueprint (Lecture 1, Quick Check Q2)." },
    },
    {
      title: "5. Build the class: fields, constructor, `this`, methods",
      explain: [
        "Here is the full `EquipmentItem` built step by step as in the Week 1 notes. Read the line meanings below the code — every keyword is explained.",
        "The **constructor** is the special method with the **same name as the class and no return type**. It runs automatically when you write `new EquipmentItem(...)` and its job is to fill in the fields.",
        "Inside the constructor the parameter `name` and the field `name` have the same name. `this.name` means *the field of this object*; plain `name` means *the parameter*. So `this.name = name;` copies the value into the object.",
        "The late-fee rule below (2.50 per day) is our own simple example rule, so you can see a method use the object's data.",
      ],
      run: {
        files: main(`class EquipmentItem {
    long id;
    String name;
    double replacementCost;
    boolean available;

    EquipmentItem(long id, String name, double replacementCost, boolean available) {
        this.id = id;
        this.name = name;
        this.replacementCost = replacementCost;
        this.available = available;
    }

    void displayDetails() {
        System.out.println(id + " " + name + " cost=" + replacementCost + " available=" + available);
    }

    double calculateLateFee(int daysLate) {
        return daysLate * 2.50;
    }

    boolean isExpensive() {
        return replacementCost > 500.0;
    }
}

public class Main {
    public static void main(String[] args) {
        EquipmentItem item1 = new EquipmentItem(101L, "Laptop", 850.0, true);
        EquipmentItem item2 = new EquipmentItem(102L, "Projector", 300.0, false);
        item1.displayDetails();
        item2.displayDetails();
        System.out.println(item1.calculateLateFee(3));
        System.out.println(item1.isExpensive() + " " + item2.isExpensive());
    }
}`),
        expectedOutput: "101 Laptop cost=850.0 available=true\n102 Projector cost=300.0 available=false\n7.5\ntrue false",
      },
      lines: [
        { code: "class EquipmentItem {", meaning: "A new type. Its name starts with a capital letter (UpperCamelCase)." },
        { code: "String name;", meaning: "A field. Every EquipmentItem object gets its own `name`." },
        { code: "EquipmentItem(long id, String name, ...)", meaning: "Constructor: same name as the class, no return type." },
        { code: "this.name = name;", meaning: "Copy the parameter into this object's field." },
        { code: "new EquipmentItem(101L, \"Laptop\", 850.0, true)", meaning: "Create an object on the heap and run the constructor with these values." },
        { code: "item1.displayDetails();", meaning: "Ask the object `item1` to run its method. It uses item1's own fields." },
      ],
      tryIt: "Change `this.name = name;` to `name = name;` and run. The name prints as `null`: you copied the parameter onto itself and the field was never set. This is the most common constructor bug.",
      exam: "Task 1 in the practical asks you to complete a constructor. Every field you add must be assigned with `this.field = field;`.",
    },
    {
      title: "6. References, aliasing and `null`",
      explain: [
        "A variable of a class type does **not** contain the object. It holds a **reference** — like the address of the object in memory (Lecture 1, 'Objects live in memory': stack vs heap).",
        "So `EquipmentItem b = a;` does **not** copy the object. It copies the address. Now `a` and `b` are two names for the **same** object; change it through one and you see the change through the other. This is called *aliasing*.",
        "`null` means *no object at all*. Calling a method on `null` compiles fine but crashes when it runs with a `NullPointerException`.",
      ],
      run: {
        files: main(`class EquipmentItem {
    String name;
    boolean available = true;
    EquipmentItem(String name) { this.name = name; }
}

public class Main {
    public static void main(String[] args) {
        EquipmentItem a = new EquipmentItem("Laptop");
        EquipmentItem b = a;                 // same object, second name
        EquipmentItem c = new EquipmentItem("Laptop");

        b.available = false;
        System.out.println(a.available);     // changed through b
        System.out.println(a == b);          // same object?
        System.out.println(a == c);          // same values, different object

        EquipmentItem none = null;
        System.out.println(none == null);
        // none.available would throw NullPointerException at runtime
    }
}`),
        expectedOutput: "false\ntrue\nfalse\ntrue",
      },
      check: { q: "After `EquipmentItem x;` (no `new`), how many EquipmentItem objects exist because of that line?", a: "None. It only declares a variable that *can* refer to an EquipmentItem (Week 1 notes, section 11)." },
      exam: "Viva favourite: 'Is `item1` a class, an object or a reference?' — It is a **reference variable** that points to an object.",
    },
  ],
  viva: [
    { q: "What is the difference between a class and an object?", a: "A class is the blueprint that defines fields and methods. An object is one instance built from it with `new`, with its own field values." },
    { q: "What does `new` do?", a: "It allocates a new object on the heap, gives its fields default values, runs the constructor, and returns a reference to the object." },
    { q: "What is `this`?", a: "A reference to the current object. `this.name = name` copies the parameter into this object's field." },
    { q: "Why does `7 / 2` print 3?", a: "Both operands are `int`, so Java performs integer division and discards the fractional part." },
    { q: "Why must `main` be `static`?", a: "The JVM calls it before any object exists. A static method belongs to the class, so no object is needed to call it." },
  ],
  next: [
    { href: "/learn/java-quickstart", label: "Lesson: Java Quick Start (+ quiz)" },
    { href: "/learn/classes-objects", label: "Lesson: Classes, objects, fields and this" },
    { href: "/oop-lab#memory", label: "OOP Lab: watch objects and references in memory" },
    { href: "/playground", label: "Playground: write your own class" },
  ],
  notes: [
    "Lecture 1 slide 12 says the warm-up prints `199.9`. The real JDK prints `199.89999999999998` because `10 * 19.99` cannot be stored exactly as a double. Both are 'the same number' to a human; use `printf(\"%.2f\")` when the exact text matters.",
  ],
};

export const lecture2: LectureGuide = {
  id: "lecture-2",
  week: "Week 2",
  lecture: "Lecture 2 — Encapsulation & UML Class Diagrams",
  title: "Encapsulation: private fields, getters, two constructors, static, UML",
  sources: ["WEEK-02/Lecture2_OOP_Lecture.pdf", "WEEK-01 Learning Guide (Circle setter validation)", "WEEK-03/Tutorial2_OOP_Lab_Guide_Student.pdf (Customer / Address)"],
  goal: "Protect an object's data with `private`, expose it with getters, and draw the class in UML.",
  minutes: 55,
  outcomes: [
    "Name the four access levels and their UML symbols (- ~ # +).",
    "Explain why Spring/Jackson needs getters and a no-arg constructor.",
    "Write getters, a validating setter and both constructors for a class.",
    "Use a `static` field and explain 'one copy per class'.",
    "Draw a three-compartment UML class box from Java code.",
  ],
  steps: [
    {
      title: "1. The four access levels",
      explain: [
        "Every field and method has an **access level** that decides which other code may use it. Encapsulation means: keep the data `private`, and let other code use the object only through its `public` methods.",
        "Rule of thumb from the slide: **fields private, methods that are part of the API public**.",
      ],
      table: {
        head: ["Keyword", "UML", "Who can use it"],
        rows: [
          ["`private`", "`-`", "Only code inside the same class"],
          ["(no keyword) default", "`~`", "Classes in the same package"],
          ["`protected`", "`#`", "Same package, plus subclasses anywhere"],
          ["`public`", "`+`", "Everyone"],
        ],
      },
      code: `public class Product {
    private Long id;
    private String name;
    private double price;
    // constructor ...
}

// In another class:
Product p = new Product(1L, "Laptop", 999.99);
System.out.println(p.name);   // COMPILE ERROR: name has private access in Product`,
      codeTitle: "Lecture 2 slide 6 — the compiler protects the fields",
    },
    {
      title: "2. Why it matters in Spring: Jackson reads getters",
      explain: [
        "When a Spring controller returns a `Product`, a library called **Jackson** turns it into JSON text for the browser. Jackson does not read private fields directly — it calls the public `getX()` methods.",
        "Lecture 2's live demo: make the fields private and delete the getters, and `GET /products/1` returns `{}` — empty JSON, and **no error**. Add the getters back and the fields reappear.",
        "So encapsulation is not just style: a missing getter silently removes that field from your API response.",
      ],
      code: `private String name;      // private: Jackson cannot read it directly

public String getName() { // public getter: Jackson calls this
    return name;          // -> "name": "Laptop" appears in the JSON
}`,
      exam: "If a field is missing from your JSON in the practical, check its getter first (spelling: `getDownloadUrl` for field `downloadUrl`).",
    },
    {
      title: "3. Getters, setters and the JavaBean naming rules",
      explain: [
        "The naming convention (JavaBeans) that Jackson and Spring rely on:",
        "- field `name` → getter `getName()`\n- field `price` → `getPrice()` and setter `setPrice(double price)`\n- `boolean` field `inStock` → `isInStock()` (uses **is**, not get)",
        "A setter is also the place to **protect** the data. The Week 1 Circle example refuses a negative radius with `IllegalArgumentException`. Here the same idea for a price:",
      ],
      run: {
        files: main(`class Product {
    private Long id;
    private String name;
    private double price;
    private boolean inStock;

    public Product(Long id, String name, double price, boolean inStock) {
        this.id = id;
        this.name = name;
        setPrice(price);          // reuse the validation
        this.inStock = inStock;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public double getPrice() { return price; }
    public boolean isInStock() { return inStock; }

    public void setPrice(double price) {
        if (price < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }
        this.price = price;
    }
}

public class Main {
    public static void main(String[] args) {
        Product p = new Product(1L, "Laptop", 999.99, true);
        System.out.println(p.getName() + " " + p.getPrice() + " " + p.isInStock());
        p.setPrice(899.99);
        System.out.println(p.getPrice());
        try {
            p.setPrice(-5);
        } catch (IllegalArgumentException e) {
            System.out.println("Rejected: " + e.getMessage());
        }
        System.out.println(p.getPrice());   // unchanged
    }
}`),
        expectedOutput: "Laptop 999.99 true\n899.99\nRejected: Price cannot be negative\n899.99",
      },
      check: { q: "If a field has a getter but no setter, can its value still change?", a: "Yes — but only from inside the class itself. Outside code cannot change it directly (Lecture 2 Quick Check Q2)." },
    },
    {
      title: "4. Two constructors, two audiences",
      explain: [
        "Lecture 2 section 04: give your model classes **two** constructors.",
        "- The **full constructor** is for *your* code. It sets every field in one step, so you never get a half-filled object.\n- The **no-arg constructor** `public Product() {}` is for *Jackson*. When JSON arrives in a POST body (`@RequestBody`), Jackson first does `new Product()` and then fills the fields one by one with the setters.",
        "Without the no-arg constructor, the POST fails at runtime because Jackson cannot build the object. Note: once you write any constructor yourself, Java no longer gives you the free empty one — you must write it.",
      ],
      run: {
        files: main(`class Product {
    private Long id;
    private String name;
    private double price;

    public Product() {}                                   // for Jackson

    public Product(Long id, String name, double price) {  // for your code
        this.id = id;
        this.name = name;
        this.price = price;
    }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setPrice(double price) { this.price = price; }
    public String describe() { return id + " " + name + " " + price; }
}

public class Main {
    public static void main(String[] args) {
        Product mine = new Product(1L, "Laptop", 999.99);
        System.out.println(mine.describe());

        // What Jackson does with {"id":2,"name":"Mouse","price":19.99}:
        Product fromJson = new Product();
        System.out.println(fromJson.describe());   // fields still at defaults
        fromJson.setId(2L);
        fromJson.setName("Mouse");
        fromJson.setPrice(19.99);
        System.out.println(fromJson.describe());
    }
}`),
        expectedOutput: "1 Laptop 999.99\nnull null 0.0\n2 Mouse 19.99",
      },
      exam: "Lecture 4 repeats this: a 500/400 error on POST almost always means a missing no-arg constructor on the class (or subclass) being posted.",
    },
    {
      title: "5. Immutability: fields that never change",
      explain: [
        "If a value should never change after the object is created (a product id, for example), give it **no setter**. You can also mark the field `final`: Java then forces it to be set exactly once, in the constructor.",
        "Fewer setters = fewer ways for the object to get into a wrong state.",
      ],
      code: `public class Product {
    private final Long id;
    private final String name;
    private final double price;

    public Product(Long id, String name, double price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }
    public Long getId() { return id; }
    // no setId(): the id is fixed for the lifetime of the object
}`,
      exam: "Careful: Lecture 2 slide 21 shows `final` fields **together with** `public Product() {}`. That does not compile — a `final` field must be assigned in every constructor (javac: \"variable id might not have been initialized\"). If a class needs a no-arg constructor for Jackson, do not make its fields `final`.",
    },
    {
      title: "6. `static`: one copy for the whole class",
      explain: [
        "A normal (instance) field has one copy **per object**. A `static` field has **one copy shared by the whole class**.",
        "Lecture 2's example counts how many Products were created. Each constructor call adds 1 to the *same* counter. Call static methods on the **class name**: `Product.getInstanceCount()`.",
        "In UML a static member is **underlined**.",
      ],
      run: {
        files: main(`class Product {
    private static int instanceCount = 0;   // shared by all Products
    private String name;                     // one per object

    public Product(String name) {
        this.name = name;
        instanceCount++;
    }

    public static int getInstanceCount() {
        return instanceCount;
    }
}

public class Main {
    public static void main(String[] args) {
        Product p1 = new Product("Laptop");
        Product p2 = new Product("Mouse");
        Product p3 = new Product("Monitor");
        System.out.println("Instances created: " + Product.getInstanceCount());
    }
}`),
        expectedOutput: "Instances created: 3",
      },
      check: { q: "Why can a static method not use `this`?", a: "It belongs to the class, not to any object, so there is no 'current object' for `this` to refer to." },
    },
    {
      title: "7. UML class diagram: the three compartments",
      explain: [
        "UML is the drawing language for class design. Every class box has three parts, top to bottom: **name**, **attributes** (fields), **methods**.",
        "Write attributes as `visibility name : Type` and methods as `visibility name(params) : ReturnType`. Static members are underlined. Constructors are written like methods with no return type.",
      ],
      code: `+-------------------------------------+
|              Product                |
+-------------------------------------+
| - id : Long                         |
| - name : String                     |
| - price : double                    |
+-------------------------------------+
| + Product(id, name, price)          |
| + getId() : Long                    |
| + getName() : String                |
| + getPrice() : double               |
| + setPrice(price : double) : void   |
+-------------------------------------+`,
      codeTitle: "Product in UML (Lecture 2 slide 34)",
      tryIt: "Cover the Java code from step 3 and draw its UML box on paper. Then compare: every `private` became `-`, every `public` became `+`.",
      exam: "Tutorial 2 adds a `Customer` that **has an** `Address` (a field of type Address). In UML that is a plain line (association) from Customer to Address — not the inheritance triangle.",
    },
  ],
  viva: [
    { q: "What is encapsulation?", a: "Keeping an object's fields private and allowing access only through public methods, so the class controls and validates its own data." },
    { q: "Why does Spring need getters?", a: "Jackson builds the JSON by calling public getters. A private field without a getter is silently left out of the response." },
    { q: "Why does the class need a no-arg constructor if it already has a full one?", a: "Jackson creates the object with `new Product()` before setting the fields from incoming JSON (`@RequestBody`)." },
    { q: "What does an underlined attribute mean in UML?", a: "It is static: one shared copy for the class, not one per object." },
    { q: "How do you write `private double price` in UML?", a: "`- price : double`" },
  ],
  next: [
    { href: "/learn/constructors-encapsulation", label: "Lesson: Constructors, access modifiers, encapsulation" },
    { href: "/learn/uml-class-diagrams", label: "Lesson: UML class diagrams" },
    { href: "/playground", label: "Challenge: build a Product class with validation" },
  ],
  notes: [
    "Lecture 2 slide 21 combines `final` fields with an empty no-arg constructor; javac rejects that. This guide explains why and what to do instead.",
  ],
};
