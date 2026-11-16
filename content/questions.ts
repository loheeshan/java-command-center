import type { Question } from "@/lib/quiz/types";

/** Wraps statements in a runnable Main class. */
const main = (body: string, extra = "") =>
  `${extra}public class Main {
    public static void main(String[] args) {
${body
  .split("\n")
  .map((l) => "        " + l)
  .join("\n")}
    }
}`;

export const QUESTIONS: Question[] = [
  // ───────── Quick start ─────────
  { id: "qs-jvm-1", type: "mcq", lessonId: "java-quickstart", concept: "JDK/JVM", difficulty: "easy",
    prompt: "What does `javac` produce from `Main.java`?",
    options: ["Main.exe, a native program", "Main.class containing bytecode", "Main.js", "Nothing — it runs the program directly"], answer: 1,
    explanation: "`javac` compiles source into bytecode stored in `.class` files. The JVM then executes the bytecode.",
    misconception: "Java is not interpreted line by line like a script, and it does not compile to a native .exe." },
  { id: "qs-main-1", type: "completion", lessonId: "java-quickstart", concept: "main method", difficulty: "easy",
    prompt: "Complete the entry-point signature.", code: "public ____ void main(String[] args) {", accept: ["static"],
    explanation: "`main` is `static` so the JVM can call it without creating an object first.",
    misconception: "Without `static`, the JVM would need an instance of the class before it could start." },
  { id: "qs-compile-1", type: "find-error", lessonId: "java-quickstart", concept: "compile errors", difficulty: "easy",
    prompt: "Which line causes the compile error?",
    code: "public class Main {\n    public static void main(String[] args) {\n        int marks = 100\n        System.out.println(marks);\n    }\n}", line: 3,
    explanation: "Line 3 is missing its semicolon. javac reports `';' expected`.",
    hint: "Every statement ends with something." },
  { id: "qs-println-1", type: "predict", lessonId: "java-quickstart", concept: "println vs print", difficulty: "easy", runnable: true,
    prompt: "What is printed?", code: main('System.out.print("Hi");\nSystem.out.print(" there");\nSystem.out.println("!");\nSystem.out.println(2 + 3 + "x" + 2 + 3);'),
    output: "Hi there!\n5x23",
    explanation: "`print` adds no newline. `2 + 3` is evaluated first (5), then String concatenation continues left to right: \"5x\" + 2 + 3 = \"5x23\".",
    misconception: "`+` with a String on the left concatenates; it does not add numbers that come after the String." },
  { id: "qs-file-name-1", type: "mcq", lessonId: "java-quickstart", concept: "file naming", difficulty: "easy",
    prompt: "`public class AirMission` must be saved in which file?",
    options: ["airMission.java", "AirMission.class", "AirMission.java", "Any .java file in the model folder"], answer: 2,
    explanation: "A public class must be in a file with exactly the same name (case-sensitive) plus `.java`." },

  // ───────── Syntax bridge ─────────
  { id: "qs-intdiv-1", type: "predict", lessonId: "java-syntax-bridge", concept: "integer division", difficulty: "easy", runnable: true,
    prompt: "What is printed?", code: main("int a = 7, b = 2;\nSystem.out.println(a / b);\nSystem.out.println(a % b);\nSystem.out.println((double) a / b);"),
    output: "3\n1\n3.5",
    explanation: "int / int truncates (3). `%` is the remainder (1). Casting `a` to double first makes the division decimal (3.5).",
    misconception: "Java does not produce a decimal result when both operands are integers." },
  { id: "qs-string-eq-1", type: "mcq", lessonId: "java-syntax-bridge", concept: "String equality", difficulty: "easy",
    prompt: "How should you test whether String `type` holds the text \"air\"?",
    options: ['type == "air"', 'type.equals("air")', 'type === "air"', 'type.compare("air")'], answer: 1,
    explanation: "`.equals` compares contents. `==` compares references, which can differ for equal text. `===` does not exist in Java.",
    misconception: "In JavaScript `==`/`===` compare string values; in Java `==` on objects compares identity." },
  { id: "qs-cast-1", type: "predict", lessonId: "java-syntax-bridge", concept: "casting", difficulty: "medium", runnable: true,
    prompt: "What is printed?", code: main("double d = 9.99;\nint i = (int) d;\nlong big = 3_000_000_000L;\nint wrapped = (int) big;\nSystem.out.println(i);\nSystem.out.println(wrapped);"),
    output: "9\n-1294967296",
    explanation: "Casting double → int truncates (9). Casting a long that is too large for int keeps only the low 32 bits, producing a wrong negative value — which is why the paper requires `Math.toIntExact`.",
    misconception: "An `(int)` cast never throws; it silently changes the value." },
  { id: "qs-switch-1", type: "predict", lessonId: "java-syntax-bridge", concept: "switch", difficulty: "easy", runnable: true,
    prompt: "What is printed?", code: main('String t = "air";\nint p = switch (t) {\n    case "ground" -> 1;\n    case "air" -> 2;\n    default -> 0;\n};\nSystem.out.println(p);'),
    output: "2",
    explanation: "Arrow-style switch expressions return a value and never fall through." },
  { id: "qs-continue-1", type: "predict", lessonId: "java-syntax-bridge", concept: "loops", difficulty: "medium", runnable: true,
    prompt: "What is printed?", code: main('int remaining = 50;\nint[] e = {38, 39, 18};\nfor (int x : e) {\n    if (x > remaining) continue;\n    remaining -= x;\n}\nSystem.out.println(remaining);'),
    output: "12",
    explanation: "38 fits (12 left). 39 > 12 → continue. 18 > 12 → continue. Result 12.",
    misconception: "`continue` skips only the current iteration; the loop keeps going." },
  { id: "qs-types-1", type: "multi", lessonId: "java-syntax-bridge", concept: "primitive types", difficulty: "easy",
    prompt: "Which of these are primitive types?", options: ["int", "String", "boolean", "Long", "double"], answers: [0, 2, 4],
    explanation: "`int`, `boolean`, `double` are primitives (lowercase). `String` and `Long` are classes (reference types).",
    misconception: "Capitalised type names are classes. `Long` is the wrapper for primitive `long`." },

  // ───────── Methods / arrays / lists ─────────
  { id: "qs-method-1", type: "find-error", lessonId: "methods-arrays-lists", concept: "return", difficulty: "easy",
    prompt: "Which line causes the compile error?",
    code: "static int priority(boolean medical) {\n    if (medical) {\n        return 3;\n    }\n}", line: 5,
    explanation: "When `medical` is false no value is returned. javac reports `missing return statement` at the closing brace (line 5).",
    hint: "What happens when the condition is false?" },
  { id: "qs-list-1", type: "mcq", lessonId: "methods-arrays-lists", concept: "ArrayList API", difficulty: "easy",
    prompt: "Which line adds mission id 101 to `List<Long> skipped`?", options: ["skipped.push(101L);", "skipped.add(101L);", "skipped[skipped.length] = 101;", "skipped.append(101);"], answer: 1,
    explanation: "Java lists use `add`. `push`/`append` belong to other languages; arrays cannot grow." },
  { id: "qs-passbyvalue-1", type: "predict", lessonId: "methods-arrays-lists", concept: "pass by value", difficulty: "medium", runnable: true,
    prompt: "What is printed?",
    code: main('int x = 10;\nchange(x);\nint[] arr = {10};\nchangeArr(arr);\nSystem.out.println(x + " " + arr[0]);', "").replace("public class Main {", "public class Main {\n    static void change(int v) { v = 99; }\n    static void changeArr(int[] a) { a[0] = 99; }"),
    output: "10 99",
    explanation: "Java passes copies. For `int`, the copy is the value, so `x` is unchanged. For an array, the copy is the reference — both point to the same array, so `a[0] = 99` is visible outside.",
    misconception: "Java is always pass-by-value; for objects the value being copied is a reference." },
  { id: "qs-array-1", type: "mcq", lessonId: "methods-arrays-lists", concept: "arrays vs lists", difficulty: "easy",
    prompt: "How do you get the number of elements in `int[] energies` and in `List<Integer> list`?",
    options: ["energies.length and list.size()", "energies.size() and list.length", "energies.length() and list.count()", "len(energies) and len(list)"], answer: 0,
    explanation: "Arrays have a `length` field (no brackets); collections have a `size()` method." },

  // ───────── Classes & objects ─────────
  { id: "qs-class-object-1", type: "concept", lessonId: "classes-objects", concept: "class vs object", difficulty: "easy",
    prompt: "In `GroundMission g = new GroundMission(101, 12, 3, true);`, what is `GroundMission` (the first word)?",
    options: ["An object", "A class (the type)", "A method", "A package"], answer: 1,
    explanation: "The first `GroundMission` is the declared type — a class. `g` is a reference variable; `new GroundMission(...)` creates the object." },
  { id: "qs-this-1", type: "predict", lessonId: "classes-objects", concept: "this", difficulty: "medium", runnable: true,
    prompt: "What is printed?",
    code: `class Box {
    private int size;
    Box(int size) { size = size; }
    int getSize() { return size; }
}
public class Main {
    public static void main(String[] args) {
        System.out.println(new Box(5).getSize());
    }
}`,
    output: "0",
    explanation: "`size = size;` assigns the parameter to itself. The field keeps its default 0. Fix: `this.size = size;`.",
    misconception: "Inside the constructor, the parameter name shadows the field; `this.` is required to reach the field." },
  { id: "qs-reference-1", type: "predict", lessonId: "classes-objects", concept: "references", difficulty: "medium", runnable: true,
    prompt: "What is printed?",
    code: `class P { int v; }
public class Main {
    public static void main(String[] args) {
        P a = new P();
        P b = a;
        b.v = 7;
        P c = new P();
        c.v = 7;
        System.out.println(a.v + " " + (a == b) + " " + (a == c));
    }
}`,
    output: "7 true false",
    explanation: "`b` refers to the same object as `a`, so `a.v` is 7 and `a == b`. `c` is a different object with equal data, so `a == c` is false." },
  { id: "qs-default-1", type: "mcq", lessonId: "classes-objects", concept: "default values", difficulty: "easy",
    prompt: "A field `private String name;` is never assigned. What is its value?", options: ['"" (empty string)', "null", "undefined", "It does not compile"], answer: 1,
    explanation: "Reference fields default to `null`; numeric fields to 0; booleans to false. (Local variables have no default and must be assigned.)" },
  { id: "qs-new-1", type: "order", lessonId: "classes-objects", concept: "object creation", difficulty: "medium",
    prompt: "Put the steps of `Circle c = new Circle(5);` in order.",
    items: ["Memory for a new Circle object is allocated on the heap", "Fields get default values (radius = 0.0)", "The constructor body runs (radius = 5)", "The reference is stored in variable c"],
    explanation: "Allocate → defaults → constructor → assign reference." },

  // ───────── Constructors & encapsulation ─────────
  { id: "qs-access-1", type: "mcq", lessonId: "constructors-encapsulation", concept: "access modifiers", difficulty: "easy",
    prompt: "Which modifier makes a field visible only inside its own class?", options: ["public", "protected", "private", "(no modifier)"], answer: 2,
    explanation: "`private` = same class only. No modifier = same package. `protected` = package + subclasses. `public` = everywhere." },
  { id: "qs-protected-1", type: "mcq", lessonId: "constructors-encapsulation", concept: "protected", difficulty: "medium",
    prompt: "`DispatchMission`'s constructor is `protected`. Who can call it?",
    options: ["Only DispatchMission itself", "Subclasses (via super) and classes in the same package", "Everyone", "No one — it is abstract"], answer: 1,
    explanation: "`protected` allows the same package and subclasses. Subclasses call it through `super(...)`." },
  { id: "qs-final-1", type: "find-error", lessonId: "constructors-encapsulation", concept: "final fields", difficulty: "medium",
    prompt: "Which line does not compile?",
    code: "public class Mission {\n    private final long id;\n    public Mission(long id) { this.id = id; }\n    public void setId(long id) { this.id = id; }\n}", line: 4,
    explanation: "A `final` field can only be assigned once, in the constructor. A setter cannot reassign it." },
  { id: "qs-noarg-1", type: "mcq", lessonId: "constructors-encapsulation", concept: "no-arg constructor", difficulty: "medium",
    prompt: "Why does the supplied `NewAirMission` have a public no-arg constructor and setters?",
    options: ["Java requires every class to have one", "Jackson creates the object with it, then fills fields from the JSON body using setters", "To make the class abstract", "It is unused legacy code"], answer: 1,
    explanation: "For `@RequestBody`, Jackson instantiates the class with the no-arg constructor and calls setters. Lecture 4 warns that removing it breaks `@RequestBody` at runtime.",
    misconception: "Java only adds a default constructor when you write no constructors at all." },
  { id: "qs-encap-1", type: "concept", lessonId: "constructors-encapsulation", concept: "encapsulation", difficulty: "easy",
    prompt: "`setRadius` rejects negative values before assigning. Which OOP principle is this?", options: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"], answer: 2,
    explanation: "The object controls changes to its own state through a method that validates — encapsulation." },

  // ───────── Inheritance ─────────
  { id: "qs-super-first-1", type: "find-error", lessonId: "inheritance-super", concept: "super()", difficulty: "medium",
    prompt: "Which line causes a compile error?",
    code: "public AirMission(long id, int d, int l, int w, boolean c) {\n    this.windPenalty = w;\n    super(id, d, l);\n    this.critical = c;\n}", line: 3,
    explanation: "`super(...)` must be the first statement in a constructor. (Lecture 4 rule; newer Java versions relax this only for code that does not touch `this`.)",
    misconception: "The parent part must exist before the child initialises its own fields." },
  { id: "qs-implicit-super-1", type: "mcq", lessonId: "inheritance-super", concept: "implicit super()", difficulty: "hard",
    prompt: "AirMission's constructor has no `super(...)` line. DispatchMission only has a 3-argument constructor. What happens?",
    options: ["It compiles; fields default to 0", "Compile error: Java inserts super() and no such constructor exists", "Runtime NullPointerException", "Java automatically passes the same arguments"], answer: 1,
    explanation: "Without an explicit call, Java inserts `super()`. DispatchMission has no no-arg constructor, so compilation fails." },
  { id: "qs-single-inh-1", type: "mcq", lessonId: "inheritance-super", concept: "single inheritance", difficulty: "easy",
    prompt: "Can a Java class extend two classes?", options: ["Yes, with commas", "No — one superclass only; it can implement many interfaces", "Only if both are abstract", "Only with @Override"], answer: 1,
    explanation: "Java has single inheritance of classes. Interfaces provide multiple contracts." },
  { id: "qs-isa-1", type: "concept", lessonId: "inheritance-super", concept: "IS-A vs HAS-A", difficulty: "medium",
    prompt: "`DispatchPlan` holds `List<PlanLine> selected`. Which relationship is this?", options: ["Inheritance (IS-A)", "Composition (HAS-A)", "Polymorphism", "Overloading"], answer: 1,
    explanation: "A plan has plan lines; it is not a plan line. That is composition, expressed as a field." },
  { id: "qs-super-complete-1", type: "completion", lessonId: "inheritance-super", concept: "super()", difficulty: "medium",
    prompt: "Complete the first line of the AirMission constructor.",
    code: "public AirMission(long id, int distanceKm, int loadKg, int windPenalty, boolean critical) {\n    ____;\n    this.windPenalty = windPenalty;\n    this.critical = critical;\n}",
    accept: ["super(id, distanceKm, loadKg)"],
    explanation: "Pass the three inherited values to the parent constructor, in the parent's parameter order." },
  { id: "qs-inherit-private-1", type: "mcq", lessonId: "inheritance-super", concept: "private + inheritance", difficulty: "medium",
    prompt: "Inside `AirMission.energyUnits()`, how do you read the distance?", options: ["this.distanceKm", "super.distanceKm", "getDistanceKm()", "DispatchMission.distanceKm"], answer: 2,
    explanation: "`distanceKm` is private in DispatchMission, so the subclass uses the public getter." },

  // ───────── Abstract & overriding ─────────
  { id: "qs-abstract-new-1", type: "mcq", lessonId: "abstract-overriding", concept: "abstract classes", difficulty: "easy",
    prompt: "What happens with `DispatchMission m = new DispatchMission(1, 2, 3);`?", options: ["Creates a mission with energy 0", "Compile error: cannot instantiate an abstract class", "Runtime exception", "Creates a GroundMission"], answer: 1,
    explanation: "Abstract classes cannot be instantiated. You may still declare variables of the abstract type." },
  { id: "qs-override-annot-1", type: "mcq", lessonId: "abstract-overriding", concept: "@Override", difficulty: "medium",
    prompt: "In a subclass you write `@Override public int energyunits() {...}` (lowercase u). What happens?",
    options: ["Compiles, and the method is called by the planner", "Compile error: method does not override a superclass method", "Runtime error", "Java corrects the name"], answer: 1,
    explanation: "With `@Override`, the compiler checks that a matching parent method exists. Without it, you would silently create a new method and the class would also fail for not implementing the abstract one." },
  { id: "qs-overload-vs-override-1", type: "concept", lessonId: "abstract-overriding", concept: "overloading", difficulty: "medium",
    prompt: "`rent(Vehicle v)` and `rent(Car c)` in the same class (Week 05 Test.java) are an example of…", options: ["Overriding", "Overloading", "Inheritance", "Encapsulation"], answer: 1,
    explanation: "Same name, different parameter types, same class → overloading, resolved at compile time." },
  { id: "qs-abstract-method-1", type: "find-error", lessonId: "abstract-overriding", concept: "abstract methods", difficulty: "medium",
    prompt: "Which line is invalid?",
    code: "public abstract class Shape {\n    private final String name;\n    protected Shape(String name) { this.name = name; }\n    public abstract double area() { return 0; }\n}", line: 4,
    explanation: "An abstract method has no body: `public abstract double area();`." },
  { id: "qs-override-visibility-1", type: "mcq", lessonId: "abstract-overriding", concept: "override rules", difficulty: "hard",
    prompt: "The parent declares `public abstract int priority();`. Which override compiles?",
    options: ["protected int priority() { return 1; }", "public long priority() { return 1; }", "public int priority() { return 1; }", "public int priority(boolean m) { return 1; }"], answer: 2,
    explanation: "Overrides keep the same parameters and return type and cannot reduce visibility. Option 4 is an overload and leaves the abstract method unimplemented." },
  { id: "qs-find-override-1", type: "predict", lessonId: "abstract-overriding", concept: "overriding", difficulty: "medium", runnable: true,
    prompt: "What is printed?",
    code: `class Base {
    int value() { return 1; }
    int twice() { return value() * 2; }
}
class Child extends Base {
    @Override int value() { return 10; }
}
public class Main {
    public static void main(String[] args) {
        Base b = new Child();
        System.out.println(b.twice());
    }
}`,
    output: "20",
    explanation: "`twice()` is inherited, but the `value()` call inside it is dispatched on the actual object — a Child — so it returns 10.",
    misconception: "A call from a parent method still uses the child's override." },

  // ───────── Polymorphism ─────────
  { id: "qs-poly-runtime-1", type: "mcq", lessonId: "polymorphism", concept: "dynamic dispatch", difficulty: "medium",
    prompt: "`DispatchMission m = new AirMission(103, 8, 1, 3, true); m.priority();` — which method runs and when is that decided?",
    options: ["DispatchMission.priority(), at compile time", "AirMission.priority(), at runtime", "Both run", "GroundMission.priority()"], answer: 1,
    explanation: "The object's actual class decides at runtime (dynamic binding)." },
  { id: "qs-poly-compile-1", type: "find-error", lessonId: "polymorphism", concept: "reference type", difficulty: "hard",
    prompt: "Which line does not compile?",
    code: "DispatchMission m = new AirMission(103, 8, 1, 3, true);\nint e = m.energyUnits();\nlong id = m.getId();\nboolean c = m.isCritical();", line: 4,
    explanation: "The reference type `DispatchMission` has no `isCritical()`. 'The reference type decides what you are allowed to call' (Lecture 5)." },
  { id: "qs-interface-1", type: "multi", lessonId: "polymorphism", concept: "interfaces", difficulty: "medium",
    prompt: "Which statements about Java interfaces are true?",
    options: ["A class can implement several interfaces", "An interface describes what a class can do", "A class can extend two classes if one is an interface", "`implements` is used for interfaces, `extends` for classes"], answers: [0, 1, 3],
    explanation: "Classes implement any number of interfaces (with `implements`) and extend at most one class." },
  { id: "qs-static-1", type: "predict", lessonId: "polymorphism", concept: "static", difficulty: "medium", runnable: true,
    prompt: "What is printed?",
    code: `class Mission {
    static int created = 0;
    final int id;
    Mission() { created++; id = created; }
}
public class Main {
    public static void main(String[] args) {
        Mission a = new Mission();
        Mission b = new Mission();
        System.out.println(a.id + " " + b.id + " " + Mission.created);
    }
}`,
    output: "1 2 2",
    explanation: "`created` is static: one shared counter for the class. Each object gets its own `id`." },
  { id: "qs-pillars-1", type: "concept", lessonId: "polymorphism", concept: "four pillars", difficulty: "medium",
    prompt: "The planner calls `m.energyUnits()` on every mission without knowing its concrete type. Which pillar is this?", options: ["Encapsulation", "Inheritance", "Polymorphism", "Composition"], answer: 2,
    explanation: "One call, many behaviours chosen by the object → polymorphism." },
  { id: "qs-instanceof-1", type: "mcq", lessonId: "polymorphism", concept: "avoid instanceof", difficulty: "medium",
    prompt: "Why does the paper forbid `instanceof GroundMission` checks in `plan()`?",
    options: ["instanceof is slow", "It breaks polymorphism: every new mission type would require editing the planner", "It does not compile in Java 25", "Spring disallows it"], answer: 1,
    explanation: "Type checks couple the planner to concrete classes. Overridden methods let each class answer for itself (Lecture 5)." },
  { id: "qs-poly-predict-1", type: "predict", lessonId: "polymorphism", concept: "polymorphism", difficulty: "medium", runnable: true,
    prompt: "What is printed?",
    code: `import java.util.*;
abstract class M { abstract int p(); }
class G extends M { int p() { return 1; } }
class A extends M { int p() { return 5; } }
public class Main {
    public static void main(String[] args) {
        List<M> ms = List.of(new G(), new A(), new G());
        int sum = 0;
        for (M m : ms) sum += m.p();
        System.out.println(sum);
    }
}`,
    output: "7",
    explanation: "1 + 5 + 1 = 7. Each element runs its own class's `p()`." },

  // ───────── Collections ─────────
  { id: "qs-map-get-1", type: "mcq", lessonId: "collections-generics", concept: "Map.get", difficulty: "easy",
    prompt: "What does `repo.find(999)` (backed by `map.get(999L)`) return when 999 is not stored?", options: ["Throws NoSuchElementException", "null", "An empty mission", "0"], answer: 1,
    explanation: "`Map.get` returns `null` for missing keys. Your service must check and throw `MissionNotFoundException`." },
  { id: "qs-list-interface-1", type: "mcq", lessonId: "collections-generics", concept: "programming to interface", difficulty: "easy",
    prompt: "Which declaration follows 'program to the interface' (Lecture 3)?", options: ["ArrayList<PlanLine> s = new ArrayList<>();", "List<PlanLine> s = new ArrayList<>();", "List<PlanLine> s = new List<>();", "Object s = new ArrayList<PlanLine>();"], answer: 1,
    explanation: "Declare the interface type (`List`), construct the implementation (`ArrayList`). `new List<>()` does not compile — interfaces cannot be instantiated." },
  { id: "qs-map-put-1", type: "predict", lessonId: "collections-generics", concept: "Map.put", difficulty: "medium", runnable: true,
    prompt: "What is printed?",
    code: main('Map<Long, String> m = new HashMap<>();\nm.put(101L, "A");\nm.put(101L, "B");\nSystem.out.println(m.size() + " " + m.get(101L) + " " + m.containsKey(102L));', "import java.util.*;\n"),
    output: "1 B false",
    explanation: "`put` with an existing key overwrites. That is why addAir must reject duplicate IDs before saving." },
  { id: "qs-generics-1", type: "find-error", lessonId: "collections-generics", concept: "generics", difficulty: "easy",
    prompt: "Which line does not compile?",
    code: "List<Long> skipped = new ArrayList<>();\nskipped.add(101L);\nList<long> ids = new ArrayList<>();\nskipped.add(102L);", line: 3,
    explanation: "Generic type arguments must be reference types: `List<Long>`, not `List<long>`." },
  { id: "qs-remove-1", type: "predict", lessonId: "collections-generics", concept: "List.remove", difficulty: "hard", runnable: true,
    prompt: "What is printed?",
    code: main("List<Integer> a = new ArrayList<>(List.of(10, 20, 30));\nList<Integer> b = new ArrayList<>(List.of(10, 20, 30));\na.remove(1);\nb.remove(Integer.valueOf(10));\nSystem.out.println(a + \" \" + b);", "import java.util.*;\n"),
    output: "[10, 30] [20, 30]",
    explanation: "`remove(int)` removes by index (index 1 = 20). `remove(Object)` removes the value 10." },

  // ───────── Comparator ─────────
  { id: "qs-cmp-sign-1", type: "mcq", lessonId: "comparator-sorting", concept: "compare contract", difficulty: "easy",
    prompt: "`compare(a, b)` returns a negative number. What does that mean?", options: ["b comes first", "a comes first", "a equals b", "the sort stops"], answer: 1,
    explanation: "Negative → a before b. Positive → b before a. Zero → tie." },
  { id: "qs-cmp-desc-1", type: "completion", lessonId: "comparator-sorting", concept: "descending", difficulty: "medium",
    prompt: "Complete the first key (priority DESCENDING).", code: "int r = ____;\nif (r != 0) return r;",
    accept: ["Integer.compare(b.priority(), a.priority())", "Integer.compare(second.priority(), first.priority())"],
    explanation: "Swapping the arguments reverses the order. (Use the parameter names `a, b` or `first, second`.)" },
  { id: "qs-cmp-reversed-1", type: "mcq", lessonId: "comparator-sorting", concept: "reversed()", difficulty: "hard",
    prompt: "What does `comparingInt(M::priority).thenComparingInt(M::energyUnits).reversed()` sort by?",
    options: ["priority DESC, energy ASC", "priority DESC, energy DESC", "priority ASC, energy DESC", "priority ASC, energy ASC"], answer: 1,
    explanation: "`reversed()` reverses the whole chain built so far, so energy becomes descending too. Put `.reversed()` right after the first key." },
  { id: "qs-cmp-order-1", type: "predict", lessonId: "comparator-sorting", concept: "multi-key sort", difficulty: "medium", runnable: true,
    prompt: "Each array is {id, priority, energy}. What is printed?",
    code: main("List<int[]> ms = new ArrayList<>(List.of(new int[]{7,2,30}, new int[]{3,2,30}, new int[]{5,5,40}, new int[]{9,2,10}));\nms.sort((a, b) -> {\n    int r = Integer.compare(b[1], a[1]);\n    if (r != 0) return r;\n    r = Integer.compare(a[2], b[2]);\n    return r != 0 ? r : Integer.compare(a[0], b[0]);\n});\nfor (int[] m : ms) System.out.print(m[0] + \" \");", "import java.util.*;\n"),
    output: "5 9 3 7",
    explanation: "Priority 5 first (5). Among priority 2: energy 10 (9), then the energy-30 tie broken by id: 3, 7." },
  { id: "qs-cmp-complete-1", type: "order", lessonId: "comparator-sorting", concept: "comparator keys", difficulty: "easy",
    prompt: "Order the comparator checks as the paper requires.",
    items: ["Compare priority (descending)", "If tied, compare energy (ascending)", "If still tied, compare id (ascending)"],
    explanation: "Each later key is only consulted when all earlier keys are equal." },

  // ───────── Exceptions ─────────
  { id: "qs-checked-1", type: "multi", lessonId: "exceptions-validation", concept: "checked vs unchecked", difficulty: "medium",
    prompt: "Which are unchecked (no `throws` declaration needed)?",
    options: ["IllegalArgumentException", "IOException", "MissionNotFoundException extends RuntimeException", "ArithmeticException"], answers: [0, 2, 3],
    explanation: "RuntimeException and its subclasses are unchecked. IOException is checked.",
    misconception: "All exceptions extend Exception, but only those outside the RuntimeException branch are checked." },
  { id: "qs-throw-throws-1", type: "mcq", lessonId: "exceptions-validation", concept: "throw vs throws", difficulty: "easy",
    prompt: "What is the difference between `throw` and `throws`?",
    options: ["They are synonyms", "`throw` raises an exception now; `throws` in a signature declares that a method may raise a (checked) exception", "`throws` raises; `throw` declares", "`throw` is for errors, `throws` for exceptions"], answer: 1,
    explanation: "`throw new X(...)` is a statement. `void m() throws IOException` is a declaration." },
  { id: "qs-finally-1", type: "predict", lessonId: "exceptions-validation", concept: "try/catch/finally", difficulty: "medium", runnable: true,
    prompt: "What is printed?",
    code: main('try {\n    System.out.println("a");\n    Integer.parseInt("x");\n    System.out.println("b");\n} catch (NumberFormatException e) {\n    System.out.println("c");\n} finally {\n    System.out.println("d");\n}\nSystem.out.println("e");'),
    output: "a\nc\nd\ne",
    explanation: "`parseInt(\"x\")` throws, so \"b\" is skipped. The catch runs, then finally, then execution continues." },
  { id: "qs-boundary-1", type: "multi", lessonId: "exceptions-validation", concept: "boundary testing", difficulty: "medium",
    prompt: "loadKg must be 0–10,000 inclusive. Which values must be REJECTED?", options: ["-1", "0", "10000", "10001"], answers: [0, 3],
    explanation: "Inclusive bounds: 0 and 10000 are valid; -1 and 10001 are not." },
  { id: "qs-custom-exc-1", type: "completion", lessonId: "exceptions-validation", concept: "custom exceptions", difficulty: "medium",
    prompt: "Complete the custom exception so no `throws` clause is needed anywhere.",
    code: "public class MissionNotFoundException extends ____ {\n    public MissionNotFoundException(long id) { super(\"Mission not found: \" + id); }\n}",
    accept: ["RuntimeException"],
    explanation: "Extending RuntimeException makes it unchecked (Lecture 6: prefer unchecked in Spring)." },
  { id: "qs-validate-order-1", type: "order", lessonId: "exceptions-validation", concept: "validation order", difficulty: "medium",
    prompt: "Order the steps of a correct `addAir`.",
    items: ["Validate the numeric ranges", "Reject a duplicate id", "Create the AirMission", "Calculate its energy", "Save it in the repository", "Return the created mission"],
    explanation: "Nothing is saved until every check (including the energy calculation) has succeeded." },

  // ───────── Overflow ─────────
  { id: "qs-overflow-1", type: "predict", lessonId: "overflow-long", concept: "overflow", difficulty: "medium", runnable: true,
    prompt: "What is printed?", code: main("int a = 2_000_000_000;\nint b = a + a;\nlong c = a + a;\nlong d = (long) a + a;\nSystem.out.println(b + \" \" + c + \" \" + d);"),
    output: "-294967296 -294967296 4000000000",
    explanation: "`a + a` is int arithmetic and wraps, even when stored in a long (c). Casting first (d) makes it long arithmetic." },
  { id: "qs-overflow-2", type: "mcq", lessonId: "overflow-long", concept: "long arithmetic", difficulty: "medium",
    prompt: "Which expression computes 2 × distanceKm + 5 × loadKg without overflow for any int inputs?",
    options: ["(long)(2 * distanceKm + 5 * loadKg)", "2L * distanceKm + 5L * loadKg", "2 * distanceKm + 5 * loadKg", "(int) 2L * distanceKm + 5 * loadKg"], answer: 1,
    explanation: "Each multiplication must already be long. Casting after the int arithmetic is too late." },
  { id: "qs-toint-1", type: "mcq", lessonId: "overflow-long", concept: "Math.toIntExact", difficulty: "easy",
    prompt: "What does `Math.toIntExact(3_000_000_000L)` do?", options: ["Returns -1294967296", "Returns 2147483647", "Throws ArithmeticException", "Returns 3000000000"], answer: 2,
    explanation: "It refuses to silently narrow: values outside the int range throw `ArithmeticException: integer overflow`." },
  { id: "qs-overflow-complete-1", type: "completion", lessonId: "overflow-long", concept: "safe conversion", difficulty: "easy",
    prompt: "Complete the safe conversion.", code: "long energy = 3L * getDistanceKm() + 8L * getLoadKg() + 2L * windPenalty;\nreturn ____;",
    accept: ["Math.toIntExact(energy)"],
    explanation: "`Math.toIntExact` converts long → int and throws on overflow." },

  // ───────── Greedy ─────────
  { id: "qs-greedy-1", type: "mcq", lessonId: "greedy-dispatch", concept: "greedy skip", difficulty: "medium",
    prompt: "Sorted energies [38, 39, 18], capacity 60. After selecting 38, mission 39 does not fit. What next?",
    options: ["Stop: the plan is [38]", "Skip 39, then check 18 — it fits", "Replace 38 with 39", "Throw an exception"], answer: 1,
    explanation: "Traverse the complete list: skip and continue. Result selected [38, 18], skipped [39].",
    misconception: "A greedy pass does not stop at the first failure." },
  { id: "qs-greedy-2", type: "predict", lessonId: "greedy-dispatch", concept: "greedy trace", difficulty: "medium", runnable: true,
    prompt: "What is printed?",
    code: main('int[] e = {20, 25, 10, 6};\nint cap = 40, used = 0;\nString s = "";\nfor (int x : e) {\n    if (x <= cap - used) { used += x; s += "S"; }\n    else s += "K";\n}\nSystem.out.println(s + " " + used);'),
    output: "SKSS 36",
    explanation: "20 fits (20 left). 25 > 20 → skip. 10 fits (10 left). 6 ≤ 10 → fits (4 left). Used = 36.",
    misconception: "After a skip the pass continues — and smaller later items can still fit." },
  { id: "qs-greedy-3", type: "multi", lessonId: "greedy-dispatch", concept: "urgentOnly", difficulty: "medium",
    prompt: "urgentOnly=true. Missions: 101 (p3), 102 (p1), 103 (p5), 104 (p2). Which can appear in `skipped`?",
    options: ["101", "102", "103", "104"], answers: [0, 2],
    explanation: "Only eligible missions (priority ≥ 3) can be selected or skipped. 102 and 104 are filtered out and appear in neither list." },
  { id: "qs-greedy-order-1", type: "order", lessonId: "greedy-dispatch", concept: "planner steps", difficulty: "easy",
    prompt: "Order the steps of `plan(capacity, urgentOnly)`.",
    items: ["Reject capacity ≤ 0", "Filter by urgentOnly", "Sort: priority DESC, energy ASC, id ASC", "Traverse: select if it fits, otherwise skip and continue", "Build DispatchPlan with used and remaining"],
    explanation: "Validation → filter → sort → greedy pass → result." },
  { id: "qs-greedy-filter-1", type: "mcq", lessonId: "greedy-dispatch", concept: "fits condition", difficulty: "easy",
    prompt: "Remaining capacity is 30 and the next mission costs 30. What happens?", options: ["Skipped (must be strictly less)", "Selected (equal fits)", "Planner stops", "Exception"], answer: 1,
    explanation: "Fits means `energy <= remaining`. Check B6 ends with exactly 0 remaining." },

  // ───────── Spring basics ─────────
  { id: "qs-sb-annot-1", type: "concept", lessonId: "spring-boot-basics", concept: "annotations", difficulty: "easy",
    prompt: "Which annotation marks the class whose methods handle HTTP requests and return JSON?", options: ["@Service", "@Repository", "@RestController", "@SpringBootApplication"], answer: 2,
    explanation: "@RestController = @Controller + @ResponseBody: return values are written to the response body as JSON." },
  { id: "qs-sb-scan-1", type: "mcq", lessonId: "spring-boot-basics", concept: "component scan", difficulty: "medium",
    prompt: "You create `com.other.MyController` while the main class is `edu.practice.dispatch.DispatchApplication`. What happens?",
    options: ["It works", "It is never registered: component scanning only covers edu.practice.dispatch and below", "Compile error", "Spring moves it"], answer: 1,
    explanation: "Spring scans the main class's package and its sub-packages only." },
  { id: "qs-sb-json-1", type: "mcq", lessonId: "spring-boot-basics", concept: "JSON serialisation", difficulty: "medium",
    prompt: "Why does `GET /missions` show `id`, `distanceKm`, `loadKg` but not the energy?",
    options: ["Energy is private", "Jackson serialises getter methods (getX/isX); energyUnits() is not named like a getter", "Energy is computed lazily", "It is a bug"], answer: 1,
    explanation: "Jackson uses JavaBean getters. `energyUnits()` and `priority()` are ordinary methods." },
  { id: "qs-sb-port-1", type: "mcq", lessonId: "spring-boot-basics", concept: "configuration", difficulty: "easy",
    prompt: "The starter README says port 8082, application.properties says `server.port=8080`. Where does the app listen?", options: ["8082", "8080", "Both", "A random port"], answer: 1,
    explanation: "Configuration in application.properties is what Spring actually uses. The README is just documentation (and here it is inconsistent)." },
  { id: "qs-sb-layers-1", type: "order", lessonId: "spring-boot-basics", concept: "request flow", difficulty: "easy",
    prompt: "Order the path of `GET /missions/101/energy`.",
    items: ["DispatchController.energy(101)", "DispatchService.energy(101)", "MissionRepository.find(101)", "GroundMission.energyUnits()", "JSON {\"energyUnits\":39} returned"],
    explanation: "Controller → Service → Repository → Model → back out as JSON." },

  // ───────── REST ─────────
  { id: "qs-rest-path-1", type: "completion", lessonId: "spring-rest-params", concept: "@PathVariable", difficulty: "easy",
    prompt: "Complete the parameter annotation.", code: '@GetMapping("/{id}/energy")\npublic Map<String, Integer> energy(____("id") long id) {',
    accept: ["@PathVariable"],
    explanation: "`{id}` in the path is bound with @PathVariable." },
  { id: "qs-rest-param-1", type: "mcq", lessonId: "spring-rest-params", concept: "@RequestParam default", difficulty: "medium",
    prompt: "Which declaration makes `GET /missions/plan?capacity=60` work with urgentOnly = false?",
    options: ['@RequestParam boolean urgentOnly', '@RequestParam(name = "urgentOnly", defaultValue = "false") boolean urgentOnly', '@PathVariable boolean urgentOnly', '@RequestBody boolean urgentOnly'], answer: 1,
    explanation: "Without a default, a missing required parameter returns 400." },
  { id: "qs-rest-body-1", type: "mcq", lessonId: "spring-rest-params", concept: "@RequestBody", difficulty: "easy",
    prompt: "How does `POST /missions/air` receive the JSON `{\"id\":104,...}`?", options: ["@PathVariable NewAirMission r", "@RequestParam NewAirMission r", "@RequestBody NewAirMission r", "It reads System.in"], answer: 2,
    explanation: "@RequestBody tells Jackson to convert the request body into the parameter type." },
  { id: "qs-rest-201-1", type: "multi", lessonId: "spring-rest-params", concept: "201 Created", difficulty: "medium",
    prompt: "Which make a POST handler return HTTP 201?",
    options: ["@ResponseStatus(HttpStatus.CREATED) on the method", "return ResponseEntity.status(HttpStatus.CREATED).body(created);", "@PostMapping alone", "return ResponseEntity.ok(created);"], answers: [0, 1],
    explanation: "@PostMapping alone returns 200 by default. `ok()` is 200." },
  { id: "qs-rest-status-1", type: "mcq", lessonId: "spring-rest-params", concept: "status codes", difficulty: "easy",
    prompt: "A client requests mission 999, which does not exist. Correct status?", options: ["200", "400", "404", "500"], answer: 2,
    explanation: "404 Not Found. 500 would claim the server crashed (Lecture 6's '500 problem')." },
  { id: "qs-rest-complete-1", type: "completion", lessonId: "spring-rest-params", concept: "energy JSON", difficulty: "medium",
    prompt: "Return `{\"energyUnits\": <value>}` without creating a new class.", code: "return ____;",
    accept: ['Map.of("energyUnits", service.energy(id))'],
    explanation: "A Map serialises to a JSON object with the map's keys." },

  // ───────── DI ─────────
  { id: "qs-di-1", type: "mcq", lessonId: "spring-layers-di", concept: "constructor injection", difficulty: "easy",
    prompt: "In `public DispatchService(MissionRepository repo)`, who supplies `repo`?", options: ["The controller with new", "Spring's IoC container", "The JVM", "Maven"], answer: 1,
    explanation: "Spring creates the repository bean and passes it to the constructor." },
  { id: "qs-di-2", type: "mcq", lessonId: "spring-layers-di", concept: "@Autowired", difficulty: "medium",
    prompt: "Is `@Autowired` required on a class's only constructor?", options: ["Yes, always", "No — Spring uses a single constructor automatically", "Only for controllers", "Only for final fields"], answer: 1,
    explanation: "Lecture 7: one constructor, final fields, no @Autowired." },
  { id: "qs-layers-order-1", type: "concept", lessonId: "spring-layers-di", concept: "layer responsibilities", difficulty: "medium",
    prompt: "Where should the duplicate-ID check for POST /missions/air live?", options: ["Controller", "Service", "Repository", "ErrorResponse"], answer: 1,
    explanation: "Business rules and validation belong in the service; the controller only delegates." },
  { id: "qs-di-new-1", type: "mcq", lessonId: "spring-layers-di", concept: "beans", difficulty: "hard",
    prompt: "The controller does `new DispatchService(new MissionRepository())` in a method. Mission 104 POSTed earlier via the injected service is missing. Why?",
    options: ["HashMap bug", "The new repository is a different object with its own data", "Spring deleted it", "IDs reset on each request"], answer: 1,
    explanation: "Each `new MissionRepository()` has a separate map. Always use the injected bean." },

  // ───────── Exception handler ─────────
  { id: "qs-handler-1", type: "mcq", lessonId: "spring-exception-handling", concept: "@ExceptionHandler", difficulty: "easy",
    prompt: "Which annotation goes on the handler METHOD for MissionNotFoundException?", options: ["@RestControllerAdvice", "@ExceptionHandler(MissionNotFoundException.class)", "@ResponseBody", "@Service"], answer: 1,
    explanation: "@RestControllerAdvice is on the class; @ExceptionHandler selects which exception a method handles." },
  { id: "qs-handler-2", type: "mcq", lessonId: "spring-exception-handling", concept: "advice registration", difficulty: "medium",
    prompt: "GlobalExceptionHandler has correct methods but no class-level annotation. Result?", options: ["Works anyway", "Never registered: errors still come back as 500", "Compile error", "Returns 404 for everything"], answer: 1,
    explanation: "Without @RestControllerAdvice/@ControllerAdvice Spring does not know the class exists (Lecture 6)." },
  { id: "qs-handler-status-1", type: "mcq", lessonId: "spring-exception-handling", concept: "status", difficulty: "medium",
    prompt: "A handler returns `new ErrorResponse(\"BAD_REQUEST\", msg)` with no status annotation or ResponseEntity. What status does the client get?",
    options: ["400", "200", "500", "201"], answer: 1,
    explanation: "Default is 200 — the paper says never return 200 for an error. Use @ResponseStatus or ResponseEntity.status(...)." },
  { id: "qs-handler-500-1", type: "multi", lessonId: "spring-exception-handling", concept: "debugging 500", difficulty: "hard",
    prompt: "GET /missions/999/energy returns 500. Which are plausible causes?",
    options: ["energy() calls repo.find(id).energyUnits() without a null check", "No @ExceptionHandler for MissionNotFoundException", "A try/catch in the controller rethrows RuntimeException", "The handler is in package edu.practice.dispatch.exception"], answers: [0, 1, 2],
    explanation: "A NullPointerException, a missing handler, or wrapping the exception all lead to 500. The exception package is the correct location." },
  { id: "qs-handler-complete-1", type: "completion", lessonId: "spring-exception-handling", concept: "ResponseEntity", difficulty: "medium",
    prompt: "Complete the 404 response.", code: 'return ResponseEntity.status(____).body(new ErrorResponse("NOT_FOUND", e.getMessage()));',
    accept: ["HttpStatus.NOT_FOUND", "404"],
    explanation: "`HttpStatus.NOT_FOUND` (or the int 404)." },

  // ───────── Starter tour ─────────
  { id: "qs-tour-1", type: "mcq", lessonId: "starter-project-tour", concept: "reading code", difficulty: "easy",
    prompt: "Which file tells you which methods your new subclass MUST implement?", options: ["pom.xml", "The abstract parent class", "application.properties", "The controller"], answer: 1,
    explanation: "Abstract methods in the parent are the contract." },
  { id: "qs-tour-2", type: "mcq", lessonId: "starter-project-tour", concept: "repository API", difficulty: "medium",
    prompt: "The starter's `all()` returns `List.copyOf(map.values())`. What must you do before sorting?", options: ["Nothing", "Copy into new ArrayList<>(repo.all())", "Change all() to return the map", "Use an array"], answer: 1,
    explanation: "`List.copyOf` returns an unmodifiable list; sorting it throws UnsupportedOperationException. Copy first — and do not change the supplied repository API." },
  { id: "qs-tour-3", type: "multi", lessonId: "starter-project-tour", concept: "TODO locations", difficulty: "medium",
    prompt: "Which starter files contain TODOs?", options: ["GroundMission", "MissionRepository", "DispatchMission", "GlobalExceptionHandler"], answers: [0, 1, 3],
    explanation: "DispatchMission is complete; the repository has the AirMission 103 seed TODO." },

  // ───────── Strategy ─────────
  { id: "qs-strategy-1", type: "mcq", lessonId: "exam-strategy", concept: "submission", difficulty: "easy",
    prompt: "What should the uploaded ZIP contain?", options: ["Only the edited .java files", "The src folder", "The whole project folder including pom.xml and src", "The target folder"], answer: 2,
    explanation: "Markers unzip and run it. Without pom.xml it cannot build (Lecture 6)." },
  { id: "qs-strategy-2", type: "mcq", lessonId: "exam-strategy", concept: "rules", difficulty: "easy",
    prompt: "Which resource is NOT allowed in the practical (per Lecture 6)?", options: ["Lecture slides", "Java documentation", "Spring documentation", "AI assistants"], answer: 3,
    explanation: "Open book, but no AI assistants and no Git." },
  { id: "qs-strategy-3", type: "mcq", lessonId: "exam-strategy", concept: "Section B", difficulty: "medium",
    prompt: "Your app does not start because of one compile error in an unfinished method. Effect on Section B?", options: ["Only that endpoint loses marks", "Section B cannot run at all", "Markers fix it", "No effect"], answer: 1,
    explanation: "Section B only runs if the ZIP starts. Keep the build green." },
  { id: "qs-strategy-order-1", type: "order", lessonId: "exam-strategy", concept: "timeline", difficulty: "easy",
    prompt: "Order the practical's final steps.",
    items: ["Stop coding at 1:30", "Run every functional check in Swagger", "Zip the folder containing pom.xml", "Open the zip to verify it", "Upload and submit before time ends"],
    explanation: "The last 10 minutes are for checking and submitting." },
];

QUESTIONS.push(
  // ───────── Interfaces & enums ─────────
  { id: "qs-iface-impl-1", type: "find-error", lessonId: "interfaces-enums", concept: "implementing interfaces", difficulty: "medium",
    prompt: "Which line does not compile?",
    code: "interface Discountable {\n    double applyDiscount(double rate);\n}\nclass Book implements Discountable {\n    double applyDiscount(double rate) { return 10 * (1 - rate); }\n}", line: 5,
    explanation: "Interface methods are public. Implementing it without `public` would weaken access, so javac rejects it.",
    misconception: "Leaving out the modifier does not mean public in a class — it means package-private." },
  { id: "qs-iface-vs-abstract-1", type: "multi", lessonId: "interfaces-enums", concept: "interface vs abstract class", difficulty: "medium",
    prompt: "Which statements are true?",
    options: ["A class can implement several interfaces", "An interface can hold per-object fields like `private double price`", "An abstract class can have constructors and fields", "A class can extend two abstract classes"], answers: [0, 2],
    explanation: "Interfaces carry no per-object state; abstract classes can. A class extends at most one class but implements many interfaces." },
  { id: "qs-enum-1", type: "mcq", lessonId: "interfaces-enums", concept: "enums", difficulty: "easy",
    prompt: "How do you compare `Transmission t` with the constant AUTO?", options: ['t.equals("AUTO")', "t == Transmission.AUTO", 't == "AUTO"', "t.name == AUTO"], answer: 1,
    explanation: "Each enum constant is a single object, so `==` is correct and null-safe." },
  { id: "qs-enum-predict-1", type: "predict", lessonId: "interfaces-enums", concept: "enums", difficulty: "medium", runnable: true,
    prompt: "What is printed?",
    code: "enum Level { LOW, MEDIUM, HIGH }\npublic class Main {\n    public static void main(String[] args) {\n        Level l = Level.valueOf(\"MEDIUM\");\n        System.out.println(l + \" \" + l.ordinal() + \" \" + Level.values().length);\n    }\n}",
    output: "MEDIUM 1 3",
    explanation: "`valueOf` converts text to the constant; `ordinal()` is its position from 0; `values()` returns all constants." },
  // ───────── UML ─────────
  { id: "qs-uml-1", type: "mcq", lessonId: "uml-class-diagrams", concept: "UML visibility", difficulty: "easy",
    prompt: "`- distanceKm : int` in a class box means…", options: ["public int distanceKm", "private int distanceKm", "a method returning int", "a static constant"], answer: 1,
    explanation: "`-` is private, `+` public, `#` protected; the type follows the colon." },
  { id: "qs-uml-2", type: "concept", lessonId: "uml-class-diagrams", concept: "UML arrows", difficulty: "medium",
    prompt: "A solid line with a hollow triangle pointing from AirMission to DispatchMission means…", options: ["AirMission has a DispatchMission field", "AirMission extends DispatchMission", "DispatchMission extends AirMission", "AirMission implements an interface"], answer: 1,
    explanation: "Generalisation: the triangle points at the parent (Lecture 4)." },
  { id: "qs-uml-3", type: "mcq", lessonId: "uml-class-diagrams", concept: "multiplicity", difficulty: "medium",
    prompt: "`Order ◆──── 1..* OrderLine` is best implemented as…", options: ["class OrderLine extends Order", "private List<OrderLine> lines in Order", "private OrderLine line in Order", "a static OrderLine[] in Main"], answer: 1,
    explanation: "Composition with many parts → a list field owned by the whole." },
  // ───────── REST extras ─────────
  { id: "qs-optional-1", type: "mcq", lessonId: "rest-crud-extras", concept: "Optional", difficulty: "medium",
    prompt: "A controller returns `service.findById(id).orElse(null)` for an unknown id. What does the client get?", options: ["404", "200 with an empty body", "400", "201"], answer: 1,
    explanation: "Lecture 6: `orElse(null)` → Spring returns 200 and no body — 'It worked!' when it did not." },
  { id: "qs-optional-2", type: "completion", lessonId: "rest-crud-extras", concept: "orElseThrow", difficulty: "medium",
    prompt: "Complete so an unknown id becomes your 404 exception.", code: "return repository.findById(id)\n        .orElseThrow(____);",
    accept: ["() -> new TicketNotFoundException(id)"],
    explanation: "`orElseThrow` takes a supplier (a lambda with no parameters) that creates the exception." },
  { id: "qs-delete-204-1", type: "mcq", lessonId: "rest-crud-extras", concept: "DELETE", difficulty: "easy",
    prompt: "What status should a successful DELETE /tickets/5 return?", options: ["200 with the deleted item", "201", "204 No Content", "404"], answer: 2,
    explanation: "Lecture 6 stretch task: 204 when it works, 404 through the handler when the id does not exist." },
  { id: "qs-stream-1", type: "predict", lessonId: "rest-crud-extras", concept: "streams", difficulty: "medium", runnable: true,
    prompt: "What is printed?",
    code: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        List<String> names = List.of(\"Jazz Night\", \"Rock Arena\", \"Jazz Brunch\");\n        System.out.println(names.stream().filter(n -> n.startsWith(\"Jazz\")).count());\n        System.out.println(names.stream().map(String::length).toList());\n    }\n}",
    output: "2\n[10, 10, 11]",
    explanation: "Two names start with \"Jazz\". `map(String::length)` turns each name into its length." },
  { id: "qs-long-eq-1", type: "predict", lessonId: "rest-crud-extras", concept: "Long equality", difficulty: "hard", runnable: true,
    prompt: "What is printed?",
    code: "public class Main {\n    public static void main(String[] args) {\n        Long a = 100L, b = 100L, c = 1000L, d = 1000L;\n        System.out.println((a == b) + \" \" + (c == d) + \" \" + c.equals(d));\n    }\n}",
    output: "true false true",
    explanation: "Java caches `Long` objects from -128 to 127, so `==` happens to work for 100 but compares different objects for 1000. Always use `.equals` for `Long` ids.",
    misconception: "`==` on wrapper objects compares identity, not value." },
);

export const QUESTION_MAP: Record<string, Question> = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
