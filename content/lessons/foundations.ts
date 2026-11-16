import type { Lesson } from "@/lib/curriculum/types";

export const foundationLessons: Lesson[] = [
  {
    id: "java-quickstart",
    moduleId: "m00",
    title: "Java Quick Start: from source file to running program",
    minutes: 35,
    priority: "P0",
    skill: "fundamentals",
    sources: [
      { kind: "university", label: "Lecture 1 — Java recap & first Spring Boot app" },
      { kind: "university", label: "Week 01 Tutorial — Java Refresher, Exercise 1" },
      { kind: "supplemental", label: "JDK/JRE/JVM pipeline and JS comparison" },
    ],
    videos: [{ video: "java", chapter: 1 }],
    what: "Java is a **compiled, statically typed, class-based** language. You write `.java` source files, the compiler `javac` turns them into `.class` files containing **bytecode**, and the **JVM** (Java Virtual Machine) runs that bytecode.",
    why: "Compiling first means many mistakes (wrong types, missing semicolons, calling a method that does not exist) are caught **before** the program runs. In JavaScript you find those at runtime; in Java the compiler refuses to build.",
    when: "Every Java program, including every Spring Boot app. In the practical you will press Run in IntelliJ or type `mvn spring-boot:run` — both compile first, then start the JVM.",
    analogy: "Think of `javac` as a strict translator who checks your grammar before translating a book into a universal language (bytecode). The JVM is a reader who can read that universal language on any computer — Windows, Mac or Linux.",
    compare: {
      lang: "JavaScript",
      other: `// app.js — run directly with: node app.js
let age = 21;
console.log("Age: " + age);`,
      java: `// Main.java — compile, then run
public class Main {
    public static void main(String[] args) {
        int age = 21;
        System.out.println("Age: " + age);
    }
}`,
      notes: [
        "Java code must live inside a **class**. There are no top-level statements in the version used by the module.",
        "Execution starts at `public static void main(String[] args)` — the JVM looks for exactly this signature.",
        "`let` becomes a **type**: `int age`. The type never changes after declaration.",
        "`console.log` becomes `System.out.println`. Every statement ends with `;`.",
        "The file name must match the public class: `public class Main` lives in `Main.java`.",
      ],
    },
    syntax: {
      code: `package edu.practice.demo;          // folder this class belongs to
import java.util.List;              // use a class from another package

public class Main {                 // class name == file name
    public static void main(String[] args) {
        System.out.println("Hi");   // print + newline
    }
}`,
      parts: [
        { token: "package", meaning: "Namespace that mirrors the folder path (`edu/practice/demo`). Spring scans packages below the main class." },
        { token: "import", meaning: "Lets you write `List` instead of `java.util.List`. Like `import` in JS/TS, but for classes." },
        { token: "public class Main", meaning: "Declares a class visible everywhere. One public class per file." },
        { token: "public static void main(String[] args)", meaning: "Entry point. `static` = no object needed; `void` = returns nothing; `args` = command-line arguments." },
        { token: "System.out.println", meaning: "`System` class → `out` stream → `println` method. `print` does not add a newline." },
      ],
    },
    example: {
      title: "Hello, Java",
      files: [
        {
          name: "Main.java",
          content: `public class Main {
    public static void main(String[] args) {
        String module = "5COSC019W";
        int marks = 100;
        System.out.println("Hello from " + module);
        System.out.println("Practical marks: " + marks);
        System.out.print("No newline... ");
        System.out.println("now a newline.");
    }
}`,
        },
      ],
      expectedOutput: "Hello from 5COSC019W\nPractical marks: 100\nNo newline... now a newline.",
      explain: "Press **Run on JDK**. The runner compiles with `javac`, then starts `java Main`. Then break it on purpose: delete a `;` and run again to see a real compile error with its line number.",
    },
    visual: { id: "execution", caption: "Step through what happens between pressing Run and seeing output." },
    body: [
      {
        heading: "JDK vs JRE vs JVM",
        text: "- **JVM** — the virtual machine that executes bytecode.\n- **JRE** — JVM + the standard library (enough to *run* Java).\n- **JDK** — JRE + developer tools such as `javac` (needed to *write* Java). You install the JDK. The practice paper requires **Java 25**.",
      },
      {
        heading: "Compile errors vs runtime errors",
        text: "A **compile error** means `javac` refused to build: nothing runs. IntelliJ underlines it in red. A **runtime error** (an exception) happens while the program runs, e.g. dividing by zero. Read compile errors from the **first** one — later errors are often caused by the first.",
      },
      {
        heading: "Maven in one paragraph",
        text: "Maven builds Java projects. `pom.xml` lists dependencies (e.g. Spring Boot) and the Java version. `src/main/java` holds your code, `src/test/java` holds tests, `target/` holds compiled output. In the practical: open the folder that contains `pom.xml` in IntelliJ as a Maven project, wait for dependencies, then run the main class.",
      },
    ],
    trace: {
      code: `public class Main {
    public static void main(String[] args) {
        System.out.print("A");
        System.out.println("B");
        System.out.println("C" + 1 + 2);
        System.out.println(1 + 2 + "C");
    }
}`,
      output: "AB\nC12\n3C",
      explanation: "`print` keeps the cursor on the same line, so A and B join. `+` works left to right: `\"C\" + 1` is the String `\"C1\"`, then `+ 2` gives `\"C12\"`. In the last line `1 + 2` is integer addition (3) before the String appears.",
    },
    challenge: { taskId: "ct-energy-basics" },
    mistakes: [
      { mistake: "Class name differs from the file name (`public class main` in `Main.java`).", fix: "Match exactly, including capital letters: `Main.java` ↔ `public class Main`." },
      { mistake: "Missing semicolon → `';' expected`.", fix: "Every statement ends with `;`. Blocks `{ }` do not." },
      { mistake: "Writing `string` instead of `String`.", fix: "`String` is a class, so it starts with a capital letter. Primitives (`int`, `boolean`) are lowercase." },
      { mistake: "Opening the parent folder in IntelliJ instead of the folder containing `pom.xml`.", fix: "Open the folder that directly contains `pom.xml`, otherwise Maven is not detected." },
    ],
    quiz: ["qs-jvm-1", "qs-main-1", "qs-compile-1", "qs-println-1", "qs-file-name-1"],
    examQuestion: {
      prompt: "You unzip the starter project and IntelliJ shows every Java file with red underlines on `import org.springframework...`. What are two likely causes and what do you do?",
      modelAnswer: "1) The project was opened from the wrong folder, so Maven was not detected — reopen the folder that contains `pom.xml`. 2) Maven has not finished downloading dependencies or the JDK is not set — set the project SDK to Java 25 and reload the Maven project. Do not edit code to 'fix' import errors.",
    },
    summary: [
      "`.java` → `javac` → `.class` (bytecode) → JVM → output.",
      "Code lives in classes; execution starts in `public static void main(String[] args)`.",
      "Types are declared and fixed: `int age = 21;`.",
      "Fix the first compile error first; nothing runs until compilation succeeds.",
      "In IntelliJ open the folder containing `pom.xml`; the paper uses Java 25 + Maven.",
    ],
  },
  {
    id: "java-syntax-bridge",
    moduleId: "m01",
    title: "Variables, types, operators and control flow (JS → Java)",
    minutes: 45,
    priority: "P0",
    skill: "fundamentals",
    sources: [
      { kind: "university", label: "Week 01 Tutorial — Exercises 2, 4, 6–9" },
      { kind: "supplemental", label: "Primitive vs reference types, integer division, casting" },
    ],
    videos: [
      { video: "java", chapter: 2 },
      { video: "java", chapter: 7 },
      { video: "java", chapter: 23 },
    ],
    what: "Java has **8 primitive types** that hold raw values (`int`, `long`, `double`, `boolean`, `char`, `byte`, `short`, `float`) and **reference types** that point to objects (`String`, `ArrayList`, your own classes). Control flow (`if`, `switch`, `for`, `while`) looks almost identical to JavaScript.",
    why: "A declared type tells the compiler what values and operations are allowed. `int` arithmetic is fast and exact, but it has limits — which matters in the practice paper's energy calculation.",
    when: "In every method you write: calculations (`2 * distanceKm + 5 * loadKg`), checks (`if (energy <= remaining)`), and loops over missions.",
    analogy: "A primitive variable is a labelled box holding the value itself. A reference variable is a labelled box holding a **house address** — the object (the house) lives elsewhere, in the heap.",
    compare: {
      lang: "JavaScript / TypeScript",
      other: `let distance = 12;          // number
const medical = true;       // boolean
let half = 5 / 2;           // 2.5
if (medical === true) { }
for (let i = 0; i < 3; i++) { }`,
      java: `int distance = 12;          // whole numbers
final boolean medical = true;
int half = 5 / 2;           // 2  (integer division!)
if (medical) { }
for (int i = 0; i < 3; i++) { }`,
      notes: [
        "JS has one `number` type; Java separates `int` (whole, 32-bit), `long` (whole, 64-bit) and `double` (decimal).",
        "`5 / 2` is **2** in Java when both sides are `int`. Use `5 / 2.0` or `(double) 5 / 2` for 2.5.",
        "`const` → `final`. There is no `===`; use `==` for primitives and `.equals()` for Strings/objects.",
        "Conditions must be real `boolean`s: `if (count)` does not compile in Java.",
        "TypeScript `number | null` has no direct primitive equivalent: `int` can never be `null` (but `Integer` can).",
      ],
    },
    syntax: {
      code: `int distanceKm = 12;
long big = 2L * distanceKm;          // L suffix = long literal
double avg = 7 / 2.0;                // 3.5
String type = "ground";
boolean urgent = priority >= 3 && !skipped;

switch (type) {
    case "ground" -> System.out.println("road");
    case "air"    -> System.out.println("sky");
    default       -> System.out.println("unknown");
}`,
      parts: [
        { token: "int / long", meaning: "`int` max ≈ 2.1 billion (2,147,483,647). `long` max ≈ 9.2 quintillion." },
        { token: "2L", meaning: "A `long` literal. `2L * x` makes the whole multiplication happen in `long`." },
        { token: "&& || !", meaning: "Logical AND, OR, NOT — same as JS." },
        { token: "switch ... ->", meaning: "Modern arrow switch: no fall-through, no `break` needed." },
        { token: "(int) 3.9", meaning: "Cast: converts to `int` by **truncating** → 3." },
      ],
    },
    example: {
      title: "Types and integer division",
      files: [
        {
          name: "Main.java",
          content: `public class Main {
    public static void main(String[] args) {
        int distanceKm = 12;
        int loadKg = 3;
        int energy = 2 * distanceKm + 5 * loadKg;
        System.out.println("energy = " + energy);

        System.out.println(7 / 2);        // int division
        System.out.println(7 / 2.0);      // double division
        System.out.println(7 % 2);        // remainder
        System.out.println((int) 3.99);   // cast truncates

        String a = "air";
        String b = new String("air");
        System.out.println(a.equals(b));  // compare text

        for (int i = 1; i <= 3; i++) {
            System.out.print(i + " ");
        }
        System.out.println();
    }
}`,
        },
      ],
      expectedOutput: "energy = 39\n3\n3.5\n1\n3\ntrue\n1 2 3 ",
    },
    body: [
      {
        heading: "Strings: always use .equals()",
        text: "`==` on objects compares **addresses** (are these the same object?), not text. Two different `String` objects with the same letters can make `==` false. Use `a.equals(b)` — or `\"ground\".equals(type)` which is also null-safe.",
      },
      {
        heading: "while loops and break/continue",
        text: "`while (condition) { ... }` repeats while true. `break` exits the loop; `continue` jumps to the next iteration. The greedy planner **must not** `break` when a mission does not fit — it must keep checking later missions.",
        code: `int remaining = 60;
int[] energies = {38, 39, 18};
for (int e : energies) {
    if (e > remaining) {
        continue;        // skip this one, keep looking
    }
    remaining -= e;
}`,
      },
    ],
    trace: {
      code: `public class Main {
    public static void main(String[] args) {
        int total = 0;
        for (int i = 0; i < 5; i++) {
            if (i == 3) continue;
            total += i;
        }
        System.out.println(total);
        System.out.println(10 / 4 * 4);
        System.out.println(10 / 4.0 * 4);
    }
}`,
      output: "7\n8\n10.0",
      explanation: "The loop adds 0+1+2+4 (3 is skipped by `continue`) = 7. `10 / 4` is integer division = 2, then `* 4` = 8. `10 / 4.0` = 2.5, `* 4` = 10.0 — a `double` prints with `.0`.",
    },
    challenge: { taskId: "ct-priority-switch" },
    mistakes: [
      { mistake: "Comparing Strings with `==`.", fix: "Use `.equals()`." },
      { mistake: "Expecting `5 / 2` to be 2.5.", fix: "Make one side a `double`: `5 / 2.0`." },
      { mistake: "Putting a `long` result into an `int` variable: `int x = someLong;`.", fix: "It does not compile on purpose. Convert explicitly with `Math.toIntExact(someLong)` (throws on overflow) — never a blind `(int)` cast in the practical." },
      { mistake: "`if (x = 5)` instead of `if (x == 5)`.", fix: "In Java this is a compile error for `int`, which helps you. Use `==`." },
    ],
    quiz: ["qs-intdiv-1", "qs-string-eq-1", "qs-cast-1", "qs-switch-1", "qs-continue-1", "qs-types-1"],
    examQuestion: {
      prompt: "Write one line that stores `2 × distanceKm + 5 × loadKg` (both `int`) into a variable without any risk of `int` overflow during the arithmetic.",
      modelAnswer: "`long energy = 2L * distanceKm + 5L * loadKg;` — the `L` makes each multiplication happen in `long`. (Then convert with `Math.toIntExact(energy)` if an `int` must be returned.)",
    },
    summary: [
      "Primitive types hold values; reference types hold addresses of objects.",
      "`int / int` truncates. `%` is the remainder.",
      "Compare Strings with `.equals()`, never `==`.",
      "Use `2L * x` to do arithmetic in `long`.",
      "`continue` skips one iteration; `break` leaves the loop.",
    ],
  },
  {
    id: "methods-arrays-lists",
    moduleId: "m01",
    title: "Methods, parameters, arrays and your first ArrayList",
    minutes: 40,
    priority: "P0",
    skill: "fundamentals",
    sources: [
      { kind: "university", label: "Week 01 Tutorial — Exercises 10–11 (methods, arrays)" },
      { kind: "university", label: "Lecture 3 — arrays vs collections" },
    ],
    videos: [
      { video: "java", chapter: 26 },
      { video: "java", chapter: 31 },
      { video: "java", chapter: 56 },
    ],
    what: "A **method** is a named block of code with typed parameters and a declared **return type**. An **array** is a fixed-length sequence (`int[]`). An **ArrayList** is a resizable list (`ArrayList<Integer>`).",
    why: "Methods break a problem into testable pieces (the Week 01 'structured programming' step). Lists hold a changing number of objects — like the missions in the repository.",
    when: "Every TODO in the practical is a method with a fixed signature. You will build `List<PlanLine> selected = new ArrayList<>();` in the planner.",
    analogy: "A method signature is a vending machine label: what you put in (parameters), what comes out (return type). An array is an egg carton with a fixed number of slots; an ArrayList is a shopping bag that grows.",
    compare: {
      lang: "TypeScript",
      other: `function energy(d: number, l: number): number {
  return 2 * d + 5 * l;
}
const ids: number[] = [];
ids.push(101);
console.log(ids.length, ids[0]);`,
      java: `static int energy(int d, int l) {
    return 2 * d + 5 * l;
}
List<Long> ids = new ArrayList<>();
ids.add(101L);
System.out.println(ids.size() + " " + ids.get(0));`,
      notes: [
        "Return type comes **before** the name: `int energy(...)`. `void` means 'returns nothing'.",
        "`push` → `add`, `length` → `size()`, `[0]` → `get(0)` for lists. Arrays use `.length` (no brackets) and `[i]`.",
        "Generics need **wrapper** types: `List<Long>`, not `List<long>`. Java auto-boxes `101L` into a `Long`.",
        "`static` methods belong to the class (called without an object). Instance methods need an object.",
      ],
    },
    syntax: {
      code: `public static int sum(int[] values) {
    int total = 0;
    for (int v : values) {     // enhanced for
        total += v;
    }
    return total;
}

List<String> names = new ArrayList<>();
names.add("Ground");
names.add("Air");
for (String n : names) System.out.println(n);`,
      parts: [
        { token: "public static int", meaning: "visibility, belongs-to-class, return type" },
        { token: "int[] values", meaning: "a parameter of type 'array of int'" },
        { token: "for (int v : values)", meaning: "enhanced for — like JS `for (const v of values)`" },
        { token: "new ArrayList<>()", meaning: "the diamond `<>` lets Java infer the element type from the left side" },
      ],
    },
    example: {
      title: "Methods + list",
      files: [
        {
          name: "Main.java",
          content: `import java.util.ArrayList;
import java.util.List;

public class Main {
    static int groundEnergy(int distanceKm, int loadKg) {
        return 2 * distanceKm + 5 * loadKg;
    }

    static boolean fits(int energy, int remaining) {
        return energy <= remaining;
    }

    public static void main(String[] args) {
        int[] distances = {12, 4};
        int[] loads = {3, 2};
        List<Integer> energies = new ArrayList<>();
        for (int i = 0; i < distances.length; i++) {
            energies.add(groundEnergy(distances[i], loads[i]));
        }
        System.out.println(energies);
        System.out.println("size=" + energies.size() + " first=" + energies.get(0));
        System.out.println(fits(39, 60) + " " + fits(39, 22));
    }
}`,
        },
      ],
      expectedOutput: "[39, 18]\nsize=2 first=39\ntrue false",
    },
    trace: {
      code: `import java.util.ArrayList;
import java.util.List;

public class Main {
    static int twice(int x) { x = x * 2; return x; }

    public static void main(String[] args) {
        int a = 5;
        int b = twice(a);
        System.out.println(a + " " + b);
        List<Long> skipped = new ArrayList<>();
        skipped.add(101L);
        skipped.add(0, 7L);
        System.out.println(skipped + " " + skipped.size());
    }
}`,
      output: "5 10\n[7, 101] 2",
      explanation: "Java passes a **copy** of a primitive, so changing `x` inside `twice` does not change `a`. `add(0, 7L)` inserts at index 0, shifting 101 to index 1. Printing a list shows `[7, 101]`.",
    },
    challenge: { taskId: "ct-energy-basics" },
    mistakes: [
      { mistake: "Forgetting the return statement in a non-void method.", fix: "Every path must `return` a value of the declared type — the compiler says `missing return statement`." },
      { mistake: "`List<int>`.", fix: "Use wrapper types in generics: `List<Integer>`, `List<Long>`." },
      { mistake: "Using `list.length` or `array.size()`.", fix: "Arrays: `.length`. Lists: `.size()`." },
      { mistake: "Calling an instance method from `static main` without an object.", fix: "Make the helper `static`, or create an object first." },
    ],
    quiz: ["qs-method-1", "qs-list-1", "qs-passbyvalue-1", "qs-array-1"],
    examQuestion: {
      prompt: "Write a static method `countFitting(int[] energies, int capacity)` that returns how many values are `<= capacity`.",
      modelAnswer: "```java\nstatic int countFitting(int[] energies, int capacity) {\n    int count = 0;\n    for (int e : energies) {\n        if (e <= capacity) count++;\n    }\n    return count;\n}\n```",
    },
    summary: [
      "Method = return type + name + typed parameters.",
      "Primitives are passed by value (copied).",
      "Arrays are fixed size (`.length`); `ArrayList` grows (`.size()`, `.add`, `.get`).",
      "Generics use wrapper classes: `List<Long>`.",
    ],
  },
];
