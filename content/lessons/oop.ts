import type { Lesson } from "@/lib/curriculum/types";

export const oopLessons: Lesson[] = [
  {
    id: "classes-objects",
    moduleId: "m02",
    title: "Classes, objects, fields and `this`",
    minutes: 40,
    priority: "P0",
    skill: "oop",
    sources: [
      { kind: "university", label: "Week 01 Learning Guide — the Circle example (class vs object, this.radius)" },
      { kind: "university", label: "Lecture 1 — the Product class" },
    ],
    videos: [{ video: "java", chapter: 39 }, { video: "java", chapter: 42 }],
    what: "A **class** is a blueprint: it declares **fields** (state) and **methods** (behaviour). An **object** is one instance built from that blueprint with `new`. A variable of a class type holds a **reference** to an object.",
    why: "Objects keep data and the code that uses it together. `circle1.getArea()` needs no radius parameter because the object already owns its radius (Week 01 'central message').",
    when: "Every model class in the practical: `GroundMission`, `PlanLine`, `ErrorResponse`, `DispatchPlan` are classes; the repository holds objects of them.",
    analogy: "A class is the architectural plan of a house. Each object is a real house built from the plan — same layout, different furniture (field values). A reference is the house's address written on a card.",
    compare: {
      lang: "TypeScript",
      other: `class Circle {
  private radius: number;
  constructor(radius: number) { this.radius = radius; }
  getArea(): number { return Math.PI * this.radius ** 2; }
}
const c = new Circle(5);`,
      java: `public class Circle {
    private double radius;
    public Circle(double radius) { this.radius = radius; }
    public double getArea() { return Math.PI * radius * radius; }
}
Circle c = new Circle(5);`,
      notes: [
        "Very close to TypeScript classes — but Java types are checked at compile time **and** enforced at runtime.",
        "The constructor has the **class name** and no return type (not the word `constructor`).",
        "Inside methods, `radius` alone refers to the field unless a parameter has the same name. Then use `this.radius`.",
        "Fields not set explicitly get defaults: `0`, `false`, `null`.",
      ],
    },
    syntax: {
      code: `public class PlanLine {
    private long id;            // field (state)
    private int energyUnits;

    public PlanLine(long id, int energyUnits) {   // constructor
        this.id = id;           // this.id = field, id = parameter
        this.energyUnits = energyUnits;
    }

    public long getId() { return id; }            // method (behaviour)
}

PlanLine line = new PlanLine(103, 38);            // object creation`,
      parts: [
        { token: "private long id;", meaning: "A field. Every PlanLine object has its own `id`." },
        { token: "this.id = id;", meaning: "Copy the parameter into the current object's field." },
        { token: "new PlanLine(103, 38)", meaning: "Allocate a new object on the heap and run the constructor." },
        { token: "PlanLine line", meaning: "A reference variable that can point to a PlanLine object." },
      ],
    },
    example: {
      title: "Two independent objects",
      files: [
        {
          name: "Main.java",
          content: `class Circle {
    private double radius;

    public Circle(double radius) {
        this.radius = radius;
    }

    public double getArea() {
        return Math.PI * radius * radius;
    }

    public double getRadius() {
        return radius;
    }
}

public class Main {
    public static void main(String[] args) {
        Circle c1 = new Circle(1);
        Circle c2 = new Circle(2);
        Circle alias = c1;               // same object, second reference
        System.out.printf("%.2f %.2f%n", c1.getArea(), c2.getArea());
        System.out.println(alias == c1);  // same address?
        System.out.println(alias.getRadius());
    }
}`,
        },
      ],
      expectedOutput: "3.14 12.57\ntrue\n1.0",
      explain: "Two `new` calls → two objects. `alias = c1` copies the **reference**, so both variables point to one object.",
    },
    visual: { id: "object-memory", caption: "Watch references (stack) and objects (heap) as the code runs." },
    trace: {
      code: `class Counter {
    private int count;
    public void increment() { count++; }
    public int getCount() { return count; }
}

public class Main {
    public static void main(String[] args) {
        Counter a = new Counter();
        Counter b = a;
        Counter c = new Counter();
        a.increment();
        b.increment();
        c.increment();
        System.out.println(a.getCount() + " " + b.getCount() + " " + c.getCount());
    }
}`,
      output: "2 2 1",
      explanation: "`a` and `b` reference the **same** object, so it is incremented twice. `c` is a separate object, incremented once. Fields start at 0 by default.",
    },
    challenge: { taskId: "ct-circle" },
    mistakes: [
      { mistake: "`radius = radius;` in the constructor (parameter shadows the field).", fix: "Write `this.radius = radius;`. Otherwise the field stays 0." },
      { mistake: "Thinking `Circle b = a;` copies the object.", fix: "It copies the reference. Both variables now point to the same object." },
      { mistake: "Adding a return type to a constructor (`public void Circle()`).", fix: "Then it is an ordinary method, not a constructor. Constructors have no return type." },
      { mistake: "Calling a method on a `null` reference.", fix: "`NullPointerException` at runtime. Make sure the object was created (or found) first." },
    ],
    quiz: ["qs-class-object-1", "qs-this-1", "qs-reference-1", "qs-default-1", "qs-new-1"],
    examQuestion: {
      prompt: "Viva-style: 'Is `circle1` a class, an object, or a reference variable? What happens when `new Circle(5)` executes?'",
      modelAnswer: "`circle1` is a **reference variable** of type `Circle`. `new Circle(5)` allocates a new Circle object on the heap, initialises its fields to defaults, runs the constructor (which sets radius = 5), and returns the reference that is stored in `circle1`.",
    },
    summary: [
      "Class = blueprint (fields + methods). Object = instance created with `new`.",
      "Variables of class types hold references; assignment copies the reference.",
      "`this.field = param` resolves name clashes in constructors and setters.",
      "Each object has its own copy of instance fields.",
    ],
  },
  {
    id: "constructors-encapsulation",
    moduleId: "m02",
    title: "Constructors, access modifiers, getters/setters and encapsulation",
    minutes: 40,
    priority: "P0",
    skill: "oop",
    sources: [
      { kind: "university", label: "Lecture 2 — access modifiers, private fields, JavaBeans, full vs no-arg constructors" },
      { kind: "university", label: "Week 01 Learning Guide §10 — setRadius validation with IllegalArgumentException" },
      { kind: "mock-paper", label: "NewAirMission / DispatchPlan: no-arg constructor + getters/setters for JSON" },
    ],
    videos: [{ video: "java", chapter: 40 }, { video: "java", chapter: 41 }, { video: "java", chapter: 52 }],
    what: "**Encapsulation** means an object keeps its fields `private` and exposes controlled access through methods. **Access modifiers** decide who can see a member: `private` (this class), *default* (same package), `protected` (package + subclasses), `public` (everyone).",
    why: "If fields are public, any code can put an object into an invalid state (negative radius, negative load). Private fields + validating constructors/setters keep objects valid.",
    when: "`DispatchMission` has `private final` fields and public getters. `NewAirMission` has a no-arg constructor and setters so Spring/Jackson can build it from JSON.",
    analogy: "A bank account: you cannot reach into the vault (private field). You use the teller (public method), who checks your request (validation) before changing the balance.",
    compare: {
      lang: "TypeScript",
      other: `class Mission {
  constructor(private readonly id: number) {}
  get idValue() { return this.id; }
}`,
      java: `public class Mission {
    private final long id;
    public Mission(long id) { this.id = id; }
    public long getId() { return id; }
}`,
      notes: [
        "TypeScript `private` is compile-time only; Java `private` is enforced by the compiler **and** JVM.",
        "`readonly` → `final`: a final field must be assigned exactly once (in the constructor).",
        "Java has no `get` property syntax; the convention is `getX()` / `isX()` for booleans / `setX(...)`.",
        "Jackson (JSON) uses these getters to build JSON and the no-arg constructor + setters to read JSON.",
      ],
    },
    syntax: {
      code: `public class Circle {
    private double radius;                 // hidden state

    public Circle() { }                    // no-arg constructor
    public Circle(double radius) {         // overloaded constructor
        setRadius(radius);                 // reuse validation
    }

    public double getRadius() { return radius; }

    public void setRadius(double radius) {
        if (radius <= 0) {
            throw new IllegalArgumentException("Invalid radius: " + radius);
        }
        this.radius = radius;
    }
}`,
      parts: [
        { token: "private", meaning: "Only code inside `Circle` can touch `radius`." },
        { token: "public Circle()", meaning: "No-arg constructor. If you write **any** constructor, Java no longer adds this one for you." },
        { token: "throw new IllegalArgumentException(...)", meaning: "Reject invalid input immediately (Week 01 guide uses exactly this)." },
        { token: "getRadius / setRadius", meaning: "JavaBean naming: Jackson maps `getRadius` to the JSON field `radius`." },
      ],
    },
    example: {
      title: "Validation through a setter",
      files: [
        {
          name: "Main.java",
          content: `class Circle {
    private double radius;

    public Circle(double radius) {
        setRadius(radius);
    }

    public double getRadius() { return radius; }

    public void setRadius(double radius) {
        if (radius <= 0) {
            throw new IllegalArgumentException("Invalid radius: " + radius);
        }
        this.radius = radius;
    }
}

public class Main {
    public static void main(String[] args) {
        Circle c = new Circle(5);
        System.out.println("radius = " + c.getRadius());
        try {
            c.setRadius(-1);
        } catch (IllegalArgumentException e) {
            System.out.println("rejected: " + e.getMessage());
        }
        System.out.println("still = " + c.getRadius());
    }
}`,
        },
      ],
      expectedOutput: "radius = 5.0\nrejected: Invalid radius: -1.0\nstill = 5.0",
    },
    body: [
      {
        heading: "The four access levels (Lecture 2)",
        text: "- `private` — same class only. **Default for fields.**\n- *(no keyword)* — same package.\n- `protected` — same package **plus** subclasses anywhere. `DispatchMission`'s constructor is `protected`: only subclasses call it.\n- `public` — everywhere. Reserve for your real API.",
      },
      {
        heading: "Why the request classes have a no-arg constructor",
        text: "When `POST /missions/air` receives JSON, Jackson creates `new NewAirMission()` and calls `setId(...)`, `setDistanceKm(...)`, etc. Without the no-arg constructor (or with missing setters) the request body cannot be read. Lecture 4 warns: `@RequestBody fails at runtime` when the no-arg constructor is missing.",
      },
    ],
    trace: {
      code: `class Account {
    private int balance;
    public Account(int start) { if (start >= 0) balance = start; }
    public void withdraw(int amount) {
        if (amount > 0 && amount <= balance) balance -= amount;
    }
    public int getBalance() { return balance; }
}

public class Main {
    public static void main(String[] args) {
        Account a = new Account(-50);
        Account b = new Account(100);
        b.withdraw(30);
        b.withdraw(500);
        System.out.println(a.getBalance() + " " + b.getBalance());
    }
}`,
      output: "0 70",
      explanation: "`a` is created with -50, which the constructor ignores, so the field keeps its default 0. `b` starts at 100, withdraws 30 (→ 70). The 500 withdrawal is refused by validation.",
    },
    challenge: { taskId: "ct-product" },
    mistakes: [
      { mistake: "Public fields 'to save time'.", fix: "Keep fields `private`; add getters. Markers read code (Section A) and look for encapsulation." },
      { mistake: "Adding a parameterised constructor and breaking JSON binding.", fix: "Request classes need a no-arg constructor too (Jackson creates the object first)." },
      { mistake: "Setter assigns before validating.", fix: "Validate first, then assign — otherwise the invalid value is already stored when the exception is thrown." },
      { mistake: "Naming a boolean getter `getCritical()` and expecting `isCritical()`.", fix: "Both work for Jackson; be consistent. The supplied `NewAirMission` uses `getCritical()` — do not rename supplied methods." },
    ],
    quiz: ["qs-access-1", "qs-protected-1", "qs-final-1", "qs-noarg-1", "qs-encap-1"],
    examQuestion: {
      prompt: "The starter's `DispatchMission` fields are `private final`. A subclass `AirMission` needs `distanceKm` in its energy formula. How does it read it, and why can't it write `this.distanceKm`?",
      modelAnswer: "It calls the inherited public getter `getDistanceKm()`. The field is `private` to `DispatchMission`, so even a subclass cannot access it by name — encapsulation still applies across inheritance. `final` also means it can only be set once, in the parent constructor, which the subclass reaches with `super(...)`.",
    },
    summary: [
      "Fields `private`, access through public getters/setters.",
      "Validate in constructors/setters; throw `IllegalArgumentException` for bad input.",
      "`final` fields are assigned once, in the constructor.",
      "Writing any constructor removes the implicit no-arg one; JSON request classes need it.",
      "`protected` = package + subclasses.",
    ],
  },
  {
    id: "inheritance-super",
    moduleId: "m02",
    title: "Inheritance with `extends` and `super(...)`",
    minutes: 45,
    priority: "P0",
    skill: "oop",
    sources: [
      { kind: "university", label: "Lecture 4 — extends, super(...) first line, implicit super(), IS-A vs HAS-A" },
      { kind: "university", label: "Tutorial 4 — DigitalProduct / PhysicalProduct extends Product" },
      { kind: "university", label: "Week05.zip — Vehicle → Car, Boat, Plane" },
      { kind: "mock-paper", label: "Task 2.1 — AirMission extends DispatchMission using super(...)" },
    ],
    videos: [{ video: "java", chapter: 44 }, { video: "java", chapter: 45 }],
    what: "`class AirMission extends DispatchMission` makes `AirMission` a **subclass** that inherits the parent's fields and methods. Its constructor must initialise the parent part first by calling `super(...)`.",
    why: "Shared state (id, distance, load) and shared methods (getters) are written once in the parent. Each child adds only what is different. One `List<DispatchMission>` can then hold every kind of mission.",
    when: "Task 2.1 asks you to create `AirMission` — 'a field, a constructor calling `super(...)`' is also the first task shape in the real paper according to the Lecture 6 briefing.",
    analogy: "A child inherits the family surname and house keys from the parent, then adds their own things. Before the child can move in, the parent's part of the house must be built — that is `super(...)`.",
    compare: {
      lang: "TypeScript",
      other: `class AirMission extends DispatchMission {
  constructor(id: number, d: number, l: number,
              private wind: number) {
    super(id, d, l);
  }
}`,
      java: `public class AirMission extends DispatchMission {
    private final int windPenalty;
    public AirMission(long id, int d, int l, int windPenalty) {
        super(id, d, l);          // must be first
        this.windPenalty = windPenalty;
    }
}`,
      notes: [
        "Same `extends` and `super(...)` idea as TS/ES classes.",
        "Java allows **one** superclass per class (single inheritance). Interfaces provide 'multiple' contracts.",
        "If you omit `super(...)`, Java silently inserts `super()` — which fails to compile if the parent has no no-arg constructor. `DispatchMission` has none, so you **must** call `super(id, distanceKm, loadKg)`.",
        "Private parent fields are inherited as state but not accessible by name — use the getters.",
      ],
    },
    syntax: {
      code: `public abstract class DispatchMission {
    private final long id;
    private final int distanceKm;
    private final int loadKg;
    protected DispatchMission(long id, int distanceKm, int loadKg) {
        this.id = id; this.distanceKm = distanceKm; this.loadKg = loadKg;
    }
    public int getDistanceKm() { return distanceKm; }
    // ...
}

public class AirMission extends DispatchMission {
    private final int windPenalty;
    private final boolean critical;

    public AirMission(long id, int distanceKm, int loadKg, int windPenalty, boolean critical) {
        super(id, distanceKm, loadKg);   // 1. build the parent part
        this.windPenalty = windPenalty;  // 2. then the child's own fields
        this.critical = critical;
    }
    public int getWindPenalty() { return windPenalty; }
    public boolean isCritical() { return critical; }
}`,
      parts: [
        { token: "extends DispatchMission", meaning: "AirMission IS-A DispatchMission." },
        { token: "super(id, distanceKm, loadKg)", meaning: "Call the parent constructor. Must be the **first statement**." },
        { token: "this.windPenalty = windPenalty", meaning: "Initialise the child's own field after the parent part exists." },
        { token: "isCritical()", meaning: "Getter for a boolean, JavaBean style." },
      ],
    },
    example: {
      title: "Constructor chaining order",
      files: [
        {
          name: "Main.java",
          content: `abstract class Vehicle {
    private final String id;
    protected Vehicle(String id) {
        this.id = id;
        System.out.println("Vehicle part built: " + id);
    }
    public String getId() { return id; }
}

class Car extends Vehicle {
    private final int doors;
    public Car(String id, int doors) {
        super(id);
        this.doors = doors;
        System.out.println("Car part built: doors=" + doors);
    }
    public int getDoors() { return doors; }
}

public class Main {
    public static void main(String[] args) {
        Car c = new Car("CCC-1244", 5);
        System.out.println(c.getId() + " has " + c.getDoors() + " doors");
        Vehicle v = c;   // a Car IS-A Vehicle
        System.out.println(v.getId());
    }
}`,
        },
      ],
      expectedOutput: "Vehicle part built: CCC-1244\nCar part built: doors=5\nCCC-1244 has 5 doors\nCCC-1244",
      explain: "Adapted from the Week 05 `Vehicle`/`Car` example. The parent constructor always finishes before the child's constructor body continues.",
    },
    visual: { id: "inheritance", caption: "Click each class to see inherited vs own members." },
    body: [
      {
        heading: "IS-A vs HAS-A (Lecture 4)",
        text: "Use `extends` only when 'X **is a** Y' is true: an AirMission *is a* DispatchMission. A `DispatchPlan` *has* a list of PlanLines — that is a field (composition), not inheritance. Rule of thumb from Lecture 4: inheritance is for identity, HAS-A is for ownership.",
      },
      {
        heading: "Break it on purpose (Tutorial 4 step)",
        text: "Delete the `super(...)` line and compile. You will see an error like `constructor DispatchMission in class DispatchMission cannot be applied to given types` — Java tried to insert `super()` and the parent has no no-arg constructor. Recognising this message saves minutes in the exam.",
      },
    ],
    trace: {
      code: `class A {
    A() { System.out.print("A "); }
    A(int x) { System.out.print("A" + x + " "); }
}
class B extends A {
    B() { System.out.print("B "); }
    B(int x) { super(x); System.out.print("B" + x + " "); }
}
public class Main {
    public static void main(String[] args) {
        new B();
        System.out.println();
        new B(7);
        System.out.println();
    }
}`,
      output: "A B \nA7 B7 ",
      explanation: "`new B()` has no explicit `super(...)`, so Java inserts `super()` → prints `A ` first, then `B `. `new B(7)` calls `super(7)` → `A7 ` then `B7 `. The parent part is always built first.",
    },
    challenge: { taskId: "ct-digital-product" },
    mistakes: [
      { mistake: "Putting `super(...)` after another statement.", fix: "It must be the first line of the constructor (Lecture 4 rule)." },
      { mistake: "Re-declaring `id`, `distanceKm`, `loadKg` as fields in the child.", fix: "They already exist in the parent. Duplicates create a second, hidden copy and confuse JSON output." },
      { mistake: "Trying `this.distanceKm` in the child.", fix: "The parent field is private: use `getDistanceKm()`." },
      { mistake: "Creating `AirMission` in the wrong package.", fix: "Put it in `model` (package `edu.practice.dispatch.model`) as the paper instructs." },
    ],
    quiz: ["qs-super-first-1", "qs-implicit-super-1", "qs-single-inh-1", "qs-isa-1", "qs-super-complete-1", "qs-inherit-private-1"],
    examQuestion: {
      prompt: "Write the complete `AirMission` class header, fields and constructor for Task 2.1 (no methods yet).",
      modelAnswer: "```java\npackage edu.practice.dispatch.model;\n\npublic class AirMission extends DispatchMission {\n    private final int windPenalty;\n    private final boolean critical;\n\n    public AirMission(long id, int distanceKm, int loadKg,\n                      int windPenalty, boolean critical) {\n        super(id, distanceKm, loadKg);\n        this.windPenalty = windPenalty;\n        this.critical = critical;\n    }\n\n    public int getWindPenalty() { return windPenalty; }\n    public boolean isCritical() { return critical; }\n}\n```",
    },
    summary: [
      "`class Child extends Parent` — one parent only.",
      "`super(...)` must be the first statement; it builds the parent part.",
      "No explicit `super(...)` → Java inserts `super()`; fails if the parent lacks a no-arg constructor.",
      "Private parent fields: use getters from the child.",
      "IS-A → extends. HAS-A → a field.",
    ],
  },
  {
    id: "abstract-overriding",
    moduleId: "m02",
    title: "Abstract classes, abstract methods and `@Override`",
    minutes: 45,
    priority: "P0",
    skill: "oop",
    sources: [
      { kind: "university", label: "Lecture 5 — @Override, overriding vs overloading, abstract classes/methods" },
      { kind: "university", label: "Tutorial 5 — make Product abstract, getSummary() override" },
      { kind: "mock-paper", label: "Task 1 — GroundMission.energyUnits()/priority() override abstract methods" },
    ],
    videos: [{ video: "java", chapter: 46 }, { video: "java", chapter: 48 }, { video: "java", chapter: 27 }],
    what: "An **abstract class** cannot be instantiated with `new`. It may declare **abstract methods** — signatures with no body — that every concrete subclass **must** implement. Implementing a parent method with the same signature is **overriding**; `@Override` asks the compiler to check you did it right.",
    why: "`DispatchMission` knows every mission has an energy cost and a priority, but not *how* to compute them. Making those methods abstract forces each subclass to answer, and stops anyone creating a meaningless 'generic' mission.",
    when: "Task 1 (override `energyUnits()` and `priority()` in GroundMission) and Task 2.2 (same in AirMission). Lecture 6 lists 'Forgetting @Override' as a top time-loser.",
    analogy: "An abstract class is a job description: 'every employee must be able to `submitTimesheet()`'. It does not say how. Each concrete role (subclass) writes its own way. You can hire a Driver, but you cannot hire 'an Employee' in general.",
    compare: {
      lang: "TypeScript",
      other: `abstract class DispatchMission {
  abstract energyUnits(): number;
}
class GroundMission extends DispatchMission {
  override energyUnits() { return 39; }
}`,
      java: `public abstract class DispatchMission {
    public abstract int energyUnits();
}
public class GroundMission extends DispatchMission {
    @Override
    public int energyUnits() { return 39; }
}`,
      notes: [
        "Almost identical to TypeScript's `abstract` and `override`.",
        "Java's `@Override` is an **annotation**. Code compiles without it — but with it, a typo like `energyunits()` becomes a compile error instead of a silent new method.",
        "An abstract method ends in `;` with no `{ }` body.",
        "A class with any abstract method must itself be declared `abstract`.",
      ],
    },
    syntax: {
      code: `public class GroundMission extends DispatchMission {
    private final boolean medical;
    // constructor + isMedical() supplied by the starter ...

    @Override
    public int energyUnits() {
        long energy = 2L * getDistanceKm() + 5L * getLoadKg();
        return Math.toIntExact(energy);      // throws if it does not fit in int
    }

    @Override
    public int priority() {
        return medical ? 3 : 1;
    }
}`,
      parts: [
        { token: "@Override", meaning: "Compiler checks a matching parent method exists." },
        { token: "public int energyUnits()", meaning: "Same name, same parameters, compatible return type, not less visible than the parent." },
        { token: "2L * getDistanceKm()", meaning: "Multiply in `long` so the intermediate result cannot overflow." },
        { token: "medical ? 3 : 1", meaning: "Ternary operator, same as JS." },
      ],
    },
    example: {
      title: "GroundMission completed (Task 1)",
      files: [
        {
          name: "Main.java",
          content: `abstract class DispatchMission {
    private final long id; private final int distanceKm; private final int loadKg;
    protected DispatchMission(long id, int distanceKm, int loadKg) {
        this.id = id; this.distanceKm = distanceKm; this.loadKg = loadKg;
    }
    public long getId() { return id; }
    public int getDistanceKm() { return distanceKm; }
    public int getLoadKg() { return loadKg; }
    public abstract int energyUnits();
    public abstract int priority();
}

class GroundMission extends DispatchMission {
    private final boolean medical;
    public GroundMission(long id, int distanceKm, int loadKg, boolean medical) {
        super(id, distanceKm, loadKg);
        this.medical = medical;
    }
    public boolean isMedical() { return medical; }

    @Override
    public int energyUnits() {
        long energy = 2L * getDistanceKm() + 5L * getLoadKg();
        return Math.toIntExact(energy);
    }

    @Override
    public int priority() {
        if (medical) {
            return 3;
        }
        return 1;
    }
}

public class Main {
    public static void main(String[] args) {
        DispatchMission m101 = new GroundMission(101, 12, 3, true);
        DispatchMission m102 = new GroundMission(102, 4, 2, false);
        System.out.println(m101.getId() + ": energy=" + m101.energyUnits() + " priority=" + m101.priority());
        System.out.println(m102.getId() + ": energy=" + m102.energyUnits() + " priority=" + m102.priority());
        // new DispatchMission(1, 1, 1);  // compile error: abstract
    }
}`,
        },
      ],
      expectedOutput: "101: energy=39 priority=3\n102: energy=18 priority=1",
      explain: "This is a full, correct Task 1. Try uncommenting the last line to see the compiler refuse to instantiate an abstract class.",
    },
    body: [
      {
        heading: "Overriding vs overloading (Lecture 5)",
        text: "**Overriding**: same signature in a subclass, decided at **runtime** by the object type. **Overloading**: same name, **different parameters**, in the same class, decided at **compile time**. `rent(Vehicle v)` and `rent(Car c)` in the Week 05 code are overloads.",
      },
      {
        heading: "Override rules",
        text: "- Same name and parameter types.\n- Return type the same (or a subtype).\n- Cannot be **less visible**: a `public` parent method cannot become `protected`.\n- `static` and `private` methods are not overridden.",
      },
    ],
    trace: {
      code: `abstract class Shape {
    abstract String name();
    String describe() { return "I am a " + name(); }
}
class Square extends Shape {
    @Override String name() { return "square"; }
}
class Circle extends Shape {
    @Override String name() { return "circle"; }
    @Override String describe() { return "Round " + super.describe(); }
}
public class Main {
    public static void main(String[] args) {
        Shape[] shapes = { new Square(), new Circle() };
        for (Shape s : shapes) System.out.println(s.describe());
    }
}`,
      output: "I am a square\nRound I am a circle",
      explanation: "`describe()` in Shape calls `name()` — which runs the **object's** override. Circle overrides `describe()` and uses `super.describe()` to reuse the parent version, which again calls Circle's `name()`.",
    },
    challenge: { taskId: "ct-ground-mission" },
    mistakes: [
      { mistake: "Leaving `throw new UnsupportedOperationException(\"Task 1\")` above your code.", fix: "Delete the TODO throw — code after it is unreachable and will not compile." },
      { mistake: "Misspelling the method (`energyunits`) without `@Override`.", fix: "Always add `@Override`; the compiler then catches the typo." },
      { mistake: "Changing the signature (e.g. `public long energyUnits()`).", fix: "Keep the parent's exact signature: `public int energyUnits()`." },
      { mistake: "Trying `new DispatchMission(...)`.", fix: "Abstract classes cannot be instantiated; create a concrete subclass." },
    ],
    quiz: ["qs-abstract-new-1", "qs-override-annot-1", "qs-overload-vs-override-1", "qs-abstract-method-1", "qs-override-visibility-1", "qs-find-override-1"],
    examQuestion: {
      prompt: "Viva: 'Why is `DispatchMission` abstract rather than a normal class with `energyUnits()` returning 0?'",
      modelAnswer: "A generic mission has no meaningful energy formula, so it should never exist on its own. Making the class abstract prevents `new DispatchMission(...)`, and making `energyUnits()`/`priority()` abstract forces every subclass to implement them — the compiler rejects a subclass that forgets. Returning 0 would silently produce wrong plans for any subclass that forgot to override.",
    },
    summary: [
      "Abstract class: shared state/code + 'holes' (abstract methods); no `new`.",
      "Concrete subclasses must override every abstract method.",
      "Always write `@Override`.",
      "Overriding = runtime, same signature. Overloading = compile time, different parameters.",
    ],
  },
  {
    id: "polymorphism",
    moduleId: "m02",
    title: "Polymorphism, interfaces, static members and the four pillars",
    minutes: 50,
    priority: "P0",
    skill: "oop",
    sources: [
      { kind: "university", label: "Lecture 5 — the instanceof chain problem; 'reference type decides what you may call, object type decides what runs'" },
      { kind: "university", label: "Week05.zip Test.java — static vs dynamic binding" },
      { kind: "university", label: "Tutorial 5 — Discountable interface" },
      { kind: "mock-paper", label: "Task 2.3 — 'Do not use concrete subclass type checks'" },
    ],
    videos: [{ video: "java", chapter: 50 }, { video: "java", chapter: 51 }, { video: "java", chapter: 49 }, { video: "java", chapter: 43 }],
    what: "**Polymorphism**: one call, many behaviours. A variable of type `DispatchMission` can point to a `GroundMission` or an `AirMission`; calling `m.energyUnits()` runs the version belonging to the **actual object**, chosen at runtime (dynamic dispatch).",
    why: "The planner can treat every mission the same way. Adding a new mission type means adding one class — no `if (m instanceof ...)` chain to update. Lecture 5: 'Stop asking objects what they are. Ask them to do something.'",
    when: "Task 2.3 explicitly requires it: the planner sorts and selects using `priority()` and `energyUnits()` only. The grader even tests your planner with a third mission type you have never seen.",
    analogy: "A dispatcher shouts 'report your fuel cost!' on the radio. The truck and the drone each answer in their own way. The dispatcher never needs to ask 'are you a truck?'.",
    compare: {
      lang: "TypeScript",
      other: `function total(ms: DispatchMission[]) {
  return ms.reduce((s, m) => s + m.energyUnits(), 0);
}
// works for any subclass — same idea`,
      java: `static int total(List<DispatchMission> ms) {
    int sum = 0;
    for (DispatchMission m : ms) {
        sum += m.energyUnits();   // runs Ground or Air version
    }
    return sum;
}`,
      notes: [
        "Same runtime-dispatch idea as JS/TS methods on classes.",
        "The difference: Java checks at **compile time** that the *reference type* has the method. `DispatchMission m` can call `m.energyUnits()` but not `m.isCritical()`.",
        "Java `interface` ≈ TS `interface`, but it exists at runtime and a class must declare `implements`.",
      ],
    },
    syntax: {
      code: `DispatchMission m = new AirMission(103, 8, 1, 3, true);
//  ^ reference type          ^ object type

m.energyUnits();      // OK: declared in DispatchMission → runs AirMission's version
m.isCritical();       // COMPILE ERROR: DispatchMission has no isCritical()

public interface Discountable {         // a contract: "can do"
    void applyDiscount(double rate);
}
public class DigitalProduct extends Product implements Discountable { ... }`,
      parts: [
        { token: "DispatchMission m", meaning: "Reference type — decides what you are **allowed** to call (compile time)." },
        { token: "new AirMission(...)", meaning: "Object type — decides which override **actually runs** (runtime)." },
        { token: "interface", meaning: "Method signatures only (a contract). A class can implement many interfaces but extend one class." },
        { token: "static", meaning: "Belongs to the class, shared by all objects; not polymorphic." },
      ],
    },
    example: {
      title: "One loop, two mission types",
      files: [
        {
          name: "Main.java",
          content: `import java.util.ArrayList;
import java.util.List;

abstract class DispatchMission {
    private final long id; private final int distanceKm; private final int loadKg;
    protected DispatchMission(long id, int distanceKm, int loadKg) { this.id = id; this.distanceKm = distanceKm; this.loadKg = loadKg; }
    public long getId() { return id; }
    public int getDistanceKm() { return distanceKm; }
    public int getLoadKg() { return loadKg; }
    public abstract int energyUnits();
    public abstract int priority();
}

class GroundMission extends DispatchMission {
    private final boolean medical;
    GroundMission(long id, int d, int l, boolean medical) { super(id, d, l); this.medical = medical; }
    @Override public int energyUnits() { return Math.toIntExact(2L * getDistanceKm() + 5L * getLoadKg()); }
    @Override public int priority() { return medical ? 3 : 1; }
}

class AirMission extends DispatchMission {
    private final int windPenalty; private final boolean critical;
    AirMission(long id, int d, int l, int windPenalty, boolean critical) { super(id, d, l); this.windPenalty = windPenalty; this.critical = critical; }
    @Override public int energyUnits() { return Math.toIntExact(3L * getDistanceKm() + 8L * getLoadKg() + 2L * windPenalty); }
    @Override public int priority() { return critical ? 5 : 2; }
}

public class Main {
    public static void main(String[] args) {
        List<DispatchMission> missions = new ArrayList<>();
        missions.add(new GroundMission(101, 12, 3, true));
        missions.add(new GroundMission(102, 4, 2, false));
        missions.add(new AirMission(103, 8, 1, 3, true));
        int total = 0;
        for (DispatchMission m : missions) {
            System.out.println(m.getId() + " " + m.getClass().getSimpleName()
                    + " energy=" + m.energyUnits() + " priority=" + m.priority());
            total += m.energyUnits();
        }
        System.out.println("total=" + total);
    }
}`,
        },
      ],
      expectedOutput: "101 GroundMission energy=39 priority=3\n102 GroundMission energy=18 priority=1\n103 AirMission energy=38 priority=5\ntotal=95",
    },
    visual: { id: "polymorphism", caption: "Pick the object type and watch which override runs." },
    body: [
      {
        heading: "The instanceof chain (what NOT to do — Lecture 5)",
        text: "Code like `if (m instanceof GroundMission g) { ... } else if (m instanceof AirMission a) { ... }` works today, but every new type means editing this chain, and the practice paper forbids it for the planner. Put the type-specific logic in each class's override instead.",
        code: `// ✗ avoid
if (m instanceof AirMission) { energy = ((AirMission) m).airEnergy(); }
// ✓ polymorphic
energy = m.energyUnits();`,
      },
      {
        heading: "The four pillars, in this project",
        text: "- **Encapsulation** — `private final` fields in `DispatchMission` with getters.\n- **Abstraction** — `abstract DispatchMission` exposes *what* (energy, priority), hides *how*.\n- **Inheritance** — `GroundMission`/`AirMission extends DispatchMission`, constructors use `super(...)`.\n- **Polymorphism** — the planner calls `energyUnits()`/`priority()` on `DispatchMission` references.",
      },
      {
        heading: "static vs instance",
        text: "An instance field (`private final int windPenalty`) has one copy **per object**. A `static` field has **one copy for the class**. `static` methods cannot use `this` and are chosen at compile time — they are not polymorphic. `main` is static because the JVM calls it before any object exists.",
      },
      {
        heading: "Composition vs inheritance",
        text: "`DispatchPlan` contains `List<PlanLine>` (HAS-A, composition). Prefer composition when the relationship is ownership; inheritance only for genuine IS-A. Lecture 4's example: `ShoppingCart extends Product` is wrong; `ShoppingCart` has `List<Product> items`.",
      },
    ],
    trace: {
      code: `class Animal {
    String sound() { return "..."; }
    static String kind() { return "animal"; }
}
class Dog extends Animal {
    @Override String sound() { return "woof"; }
    static String kind() { return "dog"; }
}
public class Main {
    public static void main(String[] args) {
        Animal a = new Dog();
        System.out.println(a.sound());
        System.out.println(Animal.kind() + " " + Dog.kind());
        Dog d = (Dog) a;
        System.out.println(d.sound());
    }
}`,
      output: "woof\nanimal dog\nwoof",
      explanation: "`a.sound()` dispatches on the object (a Dog) → `woof`. Static methods are called on the class name and are not overridden — each class has its own `kind()`. The cast does not change the object, so `d.sound()` is still `woof`.",
    },
    challenge: { taskId: "ct-air-mission" },
    mistakes: [
      { mistake: "Using `instanceof` checks in the planner.", fix: "Call the abstract methods on `DispatchMission`. The grader uses an unseen subclass to catch this." },
      { mistake: "Expecting a `DispatchMission` reference to expose subclass-only methods.", fix: "Only methods declared on the reference type are callable without a cast." },
      { mistake: "Believing casting changes the object.", fix: "A cast only changes the reference type; the object (and its overrides) stays the same." },
      { mistake: "Making helper methods static and expecting overriding.", fix: "Static methods are bound at compile time; use instance methods for polymorphism." },
    ],
    quiz: ["qs-poly-runtime-1", "qs-poly-compile-1", "qs-interface-1", "qs-static-1", "qs-pillars-1", "qs-instanceof-1", "qs-poly-predict-1"],
    examQuestion: {
      prompt: "Explain, in two sentences, how your `plan()` method is polymorphic and why that matters if a `SeaMission` class is added next week.",
      modelAnswer: "`plan()` works only with `DispatchMission` references and calls `priority()` and `energyUnits()`, so at runtime the JVM runs each object's own override. A new `SeaMission extends DispatchMission` only needs its own two overrides — `plan()` needs no changes, because it never checks concrete types.",
    },
    summary: [
      "Reference type → what you may call (compile time). Object type → what runs (runtime).",
      "Replace `instanceof` chains with overridden methods.",
      "Interfaces = 'can do' contracts; a class implements many, extends one.",
      "Static members belong to the class; not polymorphic.",
      "Four pillars: encapsulation, abstraction, inheritance, polymorphism.",
    ],
  },
];
