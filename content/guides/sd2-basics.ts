import { main, type LectureGuide } from "./types";

const SRC = "SD2 Lec notes.zip";

export const sd2L1: LectureGuide = {
  id: "sd2-1",
  track: "sd2",
  week: "SD2 Lecture 1",
  lecture: "SD2 Lecture 1 — Introduction to Java",
  title: "How Java runs, your first program, output and keyboard input",
  sources: [`${SRC} / Lecture 1_ Introduction to Module and Java basics2025.pdf`],
  goal: "Understand JDK / JRE / JVM, write and run HelloWorld, print output and read input with `Scanner`.",
  minutes: 35,
  outcomes: [
    "Explain JDK, JRE, JVM and bytecode in one sentence each.",
    "Write a class with a `main` method and run it.",
    "Print text and numbers without falling into the `\"00\" + 3 + 4` trap.",
    "Read a number and a word from the keyboard with `Scanner`.",
  ],
  steps: [
    {
      title: "1. JDK, JRE, JVM: who does what",
      explain: [
        "Java is **compiled to bytecode**, not to machine code. Bytecode is the same on every computer; a **JVM** (Java Virtual Machine) for your operating system then runs it. That is the slogan **Write Once, Run Anywhere**.",
        "- **JDK** (Java Development Kit): the tools to *write* Java, including the compiler `javac`.\n- **JRE** (Java Runtime Environment): what you need to *run* Java — the JVM plus the class libraries (Math, util, ...).\n- **JVM**: the program that actually executes bytecode. There is a different JVM for Windows, Mac and Linux.",
        "The steps: you write `HelloWorld.java` → `javac HelloWorld.java` creates `HelloWorld.class` (bytecode) → `java HelloWorld` runs it (note: no `.class` at the end).",
      ],
      table: {
        head: ["Python (SD1)", "Java (SD2)"],
        rows: [
          ["Interpreted", "Compiled to bytecode, then run by the JVM"],
          ["Dynamic typing: types found at run time", "Static typing: every variable's type is known at compile time"],
          ["Indentation marks blocks", "Curly braces `{ }` mark blocks; statements end with `;`"],
        ],
      },
    },
    {
      title: "2. HelloWorld and the rules of a Java file",
      explain: [
        "Every Java program is made of **classes**. The file name must match the public class name (`HelloWorld` → `HelloWorld.java`; here the runner uses `Main`). Every application needs a `main` method — that is where running starts.",
        "Java is **case sensitive** (`Main` ≠ `main`), statements end with `;`, blocks use `{ }`. `//` starts a comment that the compiler ignores.",
      ],
      run: {
        files: main(`// Our first Java application
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World!");
        System.out.println(3 + 4);           // a number: 7
        System.out.println("00" + 3 + 4);    // text joined left to right: 0034
        System.out.print("no new line, ");
        System.out.println("then a new line");
    }
}`),
        expectedOutput: "Hello World!\n7\n0034\nno new line, then a new line",
      },
      exam: "`println` prints and moves to a new line; `print` stays on the same line. Once a String appears in `+`, everything after it is joined as text.",
    },
    {
      title: "3. Reading input with Scanner",
      explain: [
        "To read what the user types, use the `Scanner` class. Three things to remember:",
        "- `import java.util.Scanner;` at the top of the file.\n- Create it once: `Scanner input = new Scanner(System.in);`\n- Call the method for the type you want: `nextInt()`, `nextDouble()`, `next()` (one word), `nextLine()` (whole line).",
        "This example has **input already typed for you** in the Input box (`Alan` and `20`). Change the input and run again.",
      ],
      run: {
        files: main(`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.println("Enter your name:");
        String name = input.next();
        System.out.println("Enter your age:");
        int age = input.nextInt();
        System.out.println("Hi " + name + ", next year you will be " + (age + 1));
    }
}`),
        stdin: "Alan\n20\n",
        expectedOutput: "Enter your name:\nEnter your age:\nHi Alan, next year you will be 21",
      },
      tryIt: "Change the input `20` to `twenty` and run. You get `InputMismatchException` — SD2 Lecture 3 shows how to handle it.",
      exam: "The 5COSC019W practical is a Spring Boot API, so you will not use Scanner there — but it is the quickest way to practise Java logic.",
    },
  ],
  viva: [
    { q: "What is bytecode?", a: "The output of `javac`: platform-independent instructions in a .class file that the JVM runs." },
    { q: "Difference between JDK and JRE?", a: "The JDK has the development tools (like the compiler); the JRE only runs Java programs (JVM + libraries)." },
    { q: "Why is Java called 'write once, run anywhere'?", a: "The same bytecode runs on any operating system that has a JVM." },
    { q: "What does `import java.util.Scanner;` do?", a: "It lets the file use the Scanner class from the java.util package by its short name." },
  ],
  next: [
    { href: "/learn/java-quickstart", label: "Lesson: Java Quick Start" },
    { href: "/oop-lab#execution", label: "OOP Lab: watch javac → bytecode → JVM" },
    { href: "/playground", label: "Playground: write your own program" },
  ],
};

export const sd2L2: LectureGuide = {
  id: "sd2-2",
  track: "sd2",
  week: "SD2 Lecture 2",
  lecture: "SD2 Lecture 2 — Data Types and Control Structures",
  title: "Data types, casting, operators, constants, if / else and switch",
  sources: [`${SRC} / Lecture 2 _ Operators & Control Flow _Final2025.pdf`],
  goal: "Choose the right type, predict operator results, and make decisions with if / else if / switch.",
  minutes: 55,
  outcomes: [
    "Name the 8 primitive types and know `String` is not one of them.",
    "Predict casting and integer-division results.",
    "Use `++x` vs `x++`, `&&`, `||`, `!` correctly.",
    "Write an if-else ladder and a switch with `break`.",
  ],
  notes: [
    "The slide's type table gives `char` the range 'ASCII 0 to 255'. A Java `char` is 16 bits: 0 to 65,535 (Unicode).",
    "The switch rules slide says the variable can only be byte, short, int or char — but the next slide switches on a String. Since Java 7, `String` (and enums) are allowed too; the example below proves it.",
  ],
  steps: [
    {
      title: "1. Primitive and non-primitive types",
      explain: [
        "Java has **8 primitive types** (simple values) and **non-primitive** types (objects like `String` and arrays). You must declare the type before using a variable: `<type> <name> = <value>;`",
      ],
      table: {
        head: ["Type", "Holds", "Example"],
        rows: [
          ["`boolean`", "true / false", "`boolean ready = true;`"],
          ["`byte` / `short`", "small whole numbers (8 / 16 bits)", "`byte b = 10;`"],
          ["`int`", "whole numbers (32 bits, about ±2.1 billion)", "`int mark = 75;`"],
          ["`long`", "very big whole numbers (64 bits), add `L`", "`long big = 9800L;`"],
          ["`float`", "decimal, ~7 digits, add `f`", "`float f = 1.23f;`"],
          ["`double`", "decimal, ~16 digits (the default)", "`double d = 1.23;`"],
          ["`char`", "one character in single quotes", "`char letter = 'a';`"],
          ["`String` (object)", "text in double quotes", "`String name = \"Alan\";`"],
        ],
      },
    },
    {
      title: "2. Strings, casting and the integer-division trap",
      explain: [
        "Useful String methods from the slide: `length()`, `toUpperCase()`, `toLowerCase()`, `concat()`. Use `\\\"` to print a quote and `\\\\` for a backslash.",
        "**Casting** converts one type to another. Small → big happens automatically (`int` → `double`). Big → small must be written with the new type in brackets: `(int) 2.5` gives `2` (it cuts off the decimals, it does not round).",
        "The slide's three lines are the classic trap: `10/3` is **int** division (3) *before* the result is stored, so even `double value = 10/3` gives `3.0`.",
      ],
      run: {
        files: main(`public class Main {
    public static void main(String[] args) {
        String name = "Alan";
        System.out.println(name.length() + " " + name.toUpperCase() + " " + name.concat(name));
        System.out.println("Special: \\" \\\\");

        int intNumber = 10;
        double doubleNumber = intNumber;     // automatic: int -> double
        double num1 = 2.5;
        int num2 = (int) num1;               // manual cast: cuts to 2
        System.out.println(doubleNumber + " " + num2);

        int a = 10 / 3;
        double b = 10 / 3;                   // int division happens first!
        double c = 10 / 3.0;
        System.out.println(a);
        System.out.println(b);
        System.out.println(c);
    }
}`),
        expectedOutput: "4 ALAN AlanAlan\nSpecial: \" \\\n10.0 2\n3\n3.0\n3.3333333333333335",
      },
    },
    {
      title: "3. Operators: precedence, ++ and --",
      explain: [
        "`*`, `/`, `%` are done before `+`, `-`; brackets first; otherwise left to right.",
        "**Prefix** `++m`: add 1 first, then use the new value. **Postfix** `m++`: use the old value, then add 1. Compound assignment: `x += 3` means `x = x + 3`.",
        "This is the slide's exercise — run it and compare with your own predictions.",
      ],
      run: {
        files: main(`public class Main {
    public static void main(String[] args) {
        System.out.println(74 / 10 % 2 * 5 - 10 % (5 - 1));

        int i = 3, j = 4, k = 5, l = 0, m = 0;
        m = ++i;          // i becomes 4, m = 4
        System.out.println("m=" + m + " i=" + i);
        l = j--;          // l = 4 (old j), then j becomes 3
        System.out.println("l=" + l + " j=" + j);
        m = ++k % --j;    // k=6, j=2 -> 6 % 2 = 0
        System.out.println("m=" + m);

        int x = 5;
        x += 3;
        x *= 2;
        System.out.println(x);

        int num = 5;
        System.out.println(num = 6);     // assignment: prints 6
        System.out.println(num == 5);    // comparison: false
    }
}`),
        expectedOutput: "3\nm=4 i=4\nl=4 j=3\nm=0\n16\n6\nfalse",
      },
      lines: [
        { code: "74 / 10 % 2 * 5 - 10 % (5 - 1)", meaning: "Brackets first: (5 - 1) = 4. Then `/ % *` left to right: 74/10 = 7 (int division), 7 % 2 = 1, 1 * 5 = 5, and 10 % 4 = 2. Last the subtraction: 5 - 2 = 3." },
      ],
    },
    {
      title: "4. Comparison, logical operators and constants",
      explain: [
        "Comparison operators give a `boolean`: `==`, `!=`, `>`, `<`, `>=`, `<=`. Do not confuse `=` (assign) with `==` (compare).",
        "Logical: `&&` (AND — both true), `||` (OR — at least one true), `!` (NOT).",
        "A **constant** cannot change after it is set: `final`. Inside a class (outside main) write `static final`, and name it in CAPITALS: `static final double PI = 3.14;`",
      ],
      run: {
        files: main(`public class Main {
    static final int CAPACITY = 100;          // constant

    public static void main(String[] args) {
        int num = 8;
        System.out.println(num > 0 && num < 5);   // true && false
        int num1 = 5, num2 = 20;
        boolean bol1 = num1 > 10;
        boolean bol2 = num2 > 10;
        System.out.println(bol1 || bol2);
        System.out.println(!(num > 0));

        String input = "y";
        System.out.println(input.equals("Y") + " " + input.equalsIgnoreCase("Y"));

        int seatsOccupied = 100;
        if (seatsOccupied >= CAPACITY) {
            System.out.println("Full.");
        } else {
            seatsOccupied++;
        }
        // CAPACITY = 200;   // compile error: cannot assign a value to final variable
    }
}`),
        expectedOutput: "false\ntrue\nfalse\nfalse true\nFull.",
      },
      exam: "Never compare Strings with `==` — use `.equals()` (or `.equalsIgnoreCase()`). This also applies to `Long` ids in Spring code.",
    },
    {
      title: "5. if, else if, else — the grade exercise",
      explain: [
        "An **if-else ladder** checks conditions from top to bottom and runs only the **first** one that is true. With separate `if`s, every condition is checked.",
        "This solves the slide's Exercise 01: A if mark > 74, B for 60–74, C for 40–59, F below 40.",
      ],
      run: {
        files: main(`public class Main {
    static String grade(int mark) {
        if (mark > 74) {
            return "A";
        } else if (mark >= 60) {
            return "B";
        } else if (mark >= 40) {
            return "C";
        } else {
            return "F";
        }
    }

    public static void main(String[] args) {
        int[] marks = {80, 74, 60, 59, 40, 39};
        for (int mark : marks) {
            System.out.println(mark + " -> " + grade(mark));
        }
        int x = -3;
        int y = (x > 0) ? 1 : (x == 0 ? 0 : -1);   // ternary operator ?:
        System.out.println(y);
    }
}`),
        expectedOutput: "80 -> A\n74 -> B\n60 -> B\n59 -> C\n40 -> C\n39 -> F\n-1",
      },
      check: { q: "Why is `else if (mark >= 60)` enough for grade B, without also writing `mark <= 74`?", a: "Because the ladder only reaches that line when the first condition (mark > 74) was false." },
    },
    {
      title: "6. switch, and the missing-break trap",
      explain: [
        "`switch` compares one value against several `case`s. Each case normally ends with `break`. **Without `break`, execution falls through into the next case** — the slide's 'Buckle your shoe' question.",
        "`default` runs when no case matches. A switch works with `int`, `char`, `String` and enums.",
      ],
      run: {
        files: main(`public class Main {
    public static void main(String[] args) {
        String weather = "cloudy";
        switch (weather) {
            case "rain":
                System.out.println("Take umbrella.");
                break;
            case "cloudy":
                System.out.println("Take train.");
                break;
            default:
                System.out.println("Take bike.");
        }

        int num = 1;
        switch (num) {
            case 1:                                   // no break: falls through
            case 2:
                System.out.println("Buckle your shoe");
                break;
            case 3:
                System.out.println("Shut the door");
                break;
        }
    }
}`),
        expectedOutput: "Take train.\nBuckle your shoe",
      },
    },
  ],
  viva: [
    { q: "Is String a primitive type?", a: "No. It is a class (non-primitive / reference type); the 8 primitives are boolean, byte, char, short, int, long, float, double." },
    { q: "What does `(int) 2.9` give?", a: "2 — casting to int cuts off the decimal part; it does not round." },
    { q: "Difference between `m++` and `++m`?", a: "`++m` increments first and uses the new value; `m++` uses the old value and then increments." },
    { q: "What happens if a case has no break?", a: "Execution falls through into the following case(s) until a break or the end of the switch." },
    { q: "How do you make a constant?", a: "With `final` (and `static final` at class level), e.g. `static final int CAPACITY = 100;`" },
  ],
  next: [
    { href: "/learn/java-syntax-bridge", label: "Lesson: variables, types, control flow" },
    { href: "/quizzes", label: "Quiz Arena: predict-the-output questions" },
  ],
};

export const sd2L3: LectureGuide = {
  id: "sd2-3",
  track: "sd2",
  week: "SD2 Lecture 3",
  lecture: "SD2 Lecture 3 — Loops and Input Validation",
  title: "Loops, break / continue, input validation and debugging",
  sources: [`${SRC} / Lecture3_LoopsAndDebugging_2025.pdf`],
  goal: "Repeat code with for / while / do-while, stop or skip with break / continue, and validate user input.",
  minutes: 50,
  outcomes: [
    "Pick for (known count) vs while / do-while (unknown count).",
    "Trace a for loop and a nested loop step by step.",
    "Avoid infinite loops and off-by-one errors.",
    "Validate input with `hasNextInt()` and try / catch.",
  ],
  steps: [
    {
      title: "1. Three loops",
      explain: [
        "- **for**: when you know how many times (print 0 to 10). `for (start; condition; change)`.\n- **while**: when you do not know how many times (ask until the password is right). Checks the condition **before** each pass — the body may run zero times (*entry-controlled*).\n- **do-while**: checks **after** the body, so the body always runs at least once (*exit-controlled*).",
        "The slide's 'Try this' exercises, solved:",
      ],
      run: {
        files: main(`public class Main {
    public static void main(String[] args) {
        // while: sum of 1..10
        int n = 1, sum = 0;
        while (n <= 10) {
            sum += n;
            n++;
        }
        System.out.println("sum 1..10 = " + sum);

        // do-while: sum of squares 1..10
        int k = 1, squares = 0;
        do {
            squares += k * k;
            k++;
        } while (k <= 10);
        System.out.println("sum of squares = " + squares);

        // for: even numbers below 10
        for (int i = 0; i < 10; i += 2) {
            System.out.print(i + " ");
        }
        System.out.println();
    }
}`),
        expectedOutput: "sum 1..10 = 55\nsum of squares = 385\n0 2 4 6 8",
      },
    },
    {
      title: "2. Nested loops and variable scope",
      explain: [
        "A loop inside a loop: for **each** pass of the outer loop, the inner loop runs **completely**. The slide traces `i*j` for i and j from 0 to 1.",
        "A variable declared inside a loop's `{ }` exists only there. In the second loop below, `num` is reset to 0 on every outer pass.",
      ],
      run: {
        files: main(`public class Main {
    public static void main(String[] args) {
        for (int i = 0; i < 2; i++) {
            for (int j = 0; j < 2; j++) {
                System.out.println(i * j);
            }
        }
        for (int i = 0; i < 2; i++) {
            int num = 0;                       // new on every outer pass
            for (int j = 0; j < 2; j++) {
                num++;
                System.out.println("Value of num: " + num);
            }
        }
        // multiplication table 1..3
        for (int r = 1; r <= 3; r++) {
            for (int c = 1; c <= 3; c++) {
                System.out.print(r * c + "\\t");
            }
            System.out.println();
        }
    }
}`),
        expectedOutput: "0\n0\n0\n1\nValue of num: 1\nValue of num: 2\nValue of num: 1\nValue of num: 2\n1\t2\t3\t\n2\t4\t6\t\n3\t6\t9\t",
      },
    },
    {
      title: "3. break and continue",
      explain: [
        "`break` exits the nearest loop (or switch) immediately. `continue` skips the rest of this pass and goes to the next one.",
        "The slides also show a **menu in a loop**: `while (!quit) { switch (option) { ... case 4: quit = true; } }` — the loop repeats until the user picks Quit. The example below feeds the menu choices from the Input box.",
      ],
      run: {
        files: main(`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 10; i++) {
            if (i == 3) continue;      // skip 3
            if (i == 6) break;         // stop at 6
            System.out.print(i + " ");
        }
        System.out.println();

        Scanner input = new Scanner(System.in);
        boolean quit = false;
        while (!quit) {
            int option = input.nextInt();
            switch (option) {
                case 1: System.out.println("Print user name"); break;
                case 2: System.out.println("Add user"); break;
                case 4: quit = true; System.out.println("Bye"); break;
                default: System.out.println("Incorrect option.");
            }
        }
    }
}`),
        stdin: "1\n9\n2\n4\n",
        expectedOutput: "1 2 4 5 \nPrint user name\nIncorrect option.\nAdd user\nBye",
      },
    },
    {
      title: "4. Common loop bugs: wrong condition, infinite loop, off-by-one",
      explain: [
        "- **Wrong condition**: the body runs only while the condition is *true*. To grow `bal` until it reaches TARGET, write `while (bal < TARGET)`.\n- **Infinite loop**: the condition never becomes false — e.g. you forgot `counter++`, or you add 2 to an odd counter and test `!= 100`.\n- **Off-by-one**: `< 10` vs `<= 10`, starting at 0 vs 1.",
        "The slide's four 'how many passes?' questions:",
      ],
      run: {
        files: main(`public class Main {
    static int passes(int start, int limit, boolean inclusive) {
        int counter = start, count = 0;
        while (inclusive ? counter <= limit : counter < limit) {
            counter++;
            count++;
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println("Q1 start 0, < 10:  " + passes(0, 10, false));
        System.out.println("Q2 start 1, < 10:  " + passes(1, 10, false));
        System.out.println("Q3 start 0, <= 10: " + passes(0, 10, true));
        System.out.println("Q4 start 1, <= 10: " + passes(1, 10, true));
    }
}`),
        expectedOutput: "Q1 start 0, < 10:  10\nQ2 start 1, < 10:  9\nQ3 start 0, <= 10: 11\nQ4 start 1, <= 10: 10",
      },
    },
    {
      title: "5. Input validation: range and type",
      explain: [
        "Never trust input. Check the **range** (age -10 is a valid int but a wrong age) and the **type** (typing `twenty` makes `nextInt()` throw `InputMismatchException`).",
        "Two tools from the lecture: `input.hasNextInt()` looks at the next token *before* reading it; and `try { ... } catch (InputMismatchException e) { ... }` inside a loop lets the user try again instead of crashing.",
      ],
      run: {
        files: main(`import java.util.InputMismatchException;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        boolean correct = false;
        int age = 0;
        while (!correct) {
            System.out.println("Enter your age:");
            try {
                age = input.nextInt();
                if (age < 0 || age > 150) {
                    System.out.println("Age must be between 0 and 150.");
                } else {
                    correct = true;
                }
            } catch (InputMismatchException e) {
                System.out.println("Age must be a number.");
                input.next();          // throw away the bad word, or it loops forever
            }
        }
        System.out.println("Age accepted: " + age);
    }
}`),
        stdin: "twenty\n-10\n20\n",
        expectedOutput: "Enter your age:\nAge must be a number.\nEnter your age:\nAge must be between 0 and 150.\nEnter your age:\nAge accepted: 20",
      },
      exam: "The same idea — validate, then report a clear message — is Task 5 in the 5COSC019W practical, where invalid input becomes a **400 Bad Request**.",
      tryIt: "Delete the line `input.next();` and run: the program loops forever (the runner stops it after the time limit), because the bad word is never removed from the input.",
    },
    {
      title: "6. Debugging: rubber duck and print statements",
      explain: [
        "Debugging = find the location, understand the error, fix it. Strategies from the slide: read the code line by line (tracing), add print statements, explain the code to someone (or a **rubber duck**), use the IntelliJ debugger to watch variable values.",
        "The slide's duck example: printing `students_ID[1]` gives the **second** ID, because arrays start at index **0**.",
      ],
    },
  ],
  viva: [
    { q: "for vs while?", a: "for when the number of passes is known; while when it depends on a condition such as user input." },
    { q: "while vs do-while?", a: "while checks before the body (may run 0 times); do-while checks after (always runs at least once)." },
    { q: "break vs continue?", a: "break leaves the loop; continue skips to the next pass." },
    { q: "How do you stop a non-number from crashing nextInt()?", a: "Check with hasNextInt() first, or catch InputMismatchException and discard the bad token with next()." },
  ],
  next: [
    { href: "/learn/methods-arrays-lists", label: "Lesson: methods, arrays, ArrayList" },
    { href: "/oop-lab#execution", label: "Execution visualizer: step through a loop" },
  ],
};

export const sd2L4: LectureGuide = {
  id: "sd2-4",
  track: "sd2",
  week: "SD2 Lecture 4",
  lecture: "SD2 Lecture 4 — Arrays, Sort and Search",
  title: "Arrays, 2D arrays, linear and binary search, selection and bubble sort",
  sources: [`${SRC} / Lecture4ArraysSearchSort2025_IIT.pdf`],
  goal: "Store many values in an array, walk through it, and search and sort it yourself.",
  minutes: 55,
  outcomes: [
    "Create, read, update and loop over an array; use `.length`.",
    "Explain why copying an array variable copies only the reference.",
    "Delete from an array by shifting left with a counter.",
    "Write linear search, binary search, selection sort and bubble sort.",
  ],
  notes: [
    "The slide 'Get values from arrays' says `students_ID[3]` prints w1234569. With 3 elements the valid indexes are 0–2, so index 3 throws ArrayIndexOutOfBoundsException.",
    "The 'enhanced loop' slide writes `for (int element : students_ID)` over a String array. That does not compile — the loop variable must be `String`.",
  ],
  steps: [
    {
      title: "1. Create, read, update, length, loop",
      explain: [
        "An array stores many values of the **same type** under one name. Indexes go from `0` to `length - 1`. The length is fixed when the array is created.",
        "Three ways to make one: `int[] numbers;` (declare), `new int[5]` (5 slots filled with default values: 0, 0.0, false or null), `{1, 34, 26}` (with values).",
      ],
      run: {
        files: main(`public class Main {
    public static void main(String[] args) {
        String[] studentsId = {"w1234567", "w1234568", "w1234569"};
        System.out.println(studentsId[0]);
        studentsId[0] = "w9876543";                // update
        System.out.println(studentsId.length);

        for (int i = 0; i < studentsId.length; i++) {
            System.out.println(i + ": " + studentsId[i]);
        }
        for (String id : studentsId) {             // enhanced for: String, not int
            System.out.print(id + " ");
        }
        System.out.println();

        String[] empty = new String[3];
        int[] zeros = new int[2];
        System.out.println(empty[0] + " " + zeros[1]);

        int[] array = {1, 2, 3, 4, 5, 6, 7, 8, 9};
        System.out.println(array[4 + 2] + " " + array[3] / array[1] + " " + array[array[4]]);
    }
}`),
        expectedOutput: "w1234567\n3\n0: w9876543\n1: w1234568\n2: w1234569\nw9876543 w1234568 w1234569 \nnull 0\n7 2 6",
      },
      tryIt: "Print `studentsId[3]`. You get `ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3`.",
    },
    {
      title: "2. Copying an array copies the reference",
      explain: [
        "An array variable holds a **reference** (the address of the array in memory). `int[] values = numbers;` does **not** make a new array — both names point to the same one, so changing `values` changes `numbers`. (5COSC019W Week 1 calls this *aliasing*; it works the same for objects.)",
        "To get a real copy use `numbers.clone()` or `Arrays.copyOf(numbers, numbers.length)`.",
      ],
      run: {
        files: main(`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] numbers = {2, 4, 6};
        int[] values = numbers;          // same array
        values[0] = 3;
        values[1] = 5;
        values[2] = 7;
        System.out.println(Arrays.toString(numbers));

        int[] realCopy = numbers.clone();
        realCopy[0] = 100;
        System.out.println(Arrays.toString(numbers) + " " + Arrays.toString(realCopy));
    }
}`),
        expectedOutput: "[3, 5, 7]\n[3, 5, 7] [100, 5, 7]",
      },
    },
    {
      title: "3. Deleting: shift left and keep a counter",
      explain: [
        "An array cannot shrink. The lecture's preferred way to 'delete' index 3: shift every later element one place left, and keep a separate counter `numElements` of how many slots are really in use. (Putting `0` there would be ambiguous — 0 can be a real mark.)",
      ],
      run: {
        files: main(`public class Main {
    public static void main(String[] args) {
        int[] array = {56, 78, 0, 62, 45, 23, 85};
        int numElements = 7;
        int indexToDelete = 3;
        for (int i = indexToDelete; i < numElements - 1; i++) {
            array[i] = array[i + 1];
        }
        numElements--;
        for (int i = 0; i < numElements; i++) {
            System.out.print(array[i] + " ");
        }
        System.out.println();
    }
}`),
        expectedOutput: "56 78 0 45 23 85",
      },
      exam: "This is why 5COSC019W Lecture 3 moves to `ArrayList`: `remove(index)` does this shifting for you.",
    },
    {
      title: "4. Two-dimensional arrays",
      explain: [
        "A 2D array is an array of arrays: `int[][] numbers = new int[3][4];` is 3 rows × 4 columns. `numbers[1][2]` = row 1, column 2. `numbers.length` = rows, `numbers[r].length` = columns of row r. Rows may have different lengths ('ragged').",
      ],
      run: {
        files: main(`public class Main {
    public static void main(String[] args) {
        int[][] array = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
        System.out.println(array[1][2]);
        for (int r = 0; r < array.length; r++) {
            for (int c = 0; c < array[r].length; c++) {
                System.out.print(array[r][c] + " ");
            }
            System.out.println();
        }
        int[][] ragged = new int[3][];
        ragged[0] = new int[1];
        ragged[1] = new int[4];
        ragged[2] = new int[2];
        System.out.println(ragged[0].length + " " + ragged[1].length + " " + ragged[2].length);
    }
}`),
        expectedOutput: "6\n1 2 3 \n4 5 6 \n7 8 9 \n1 4 2",
      },
    },
    {
      title: "5. Linear search and binary search",
      explain: [
        "**Linear search** checks each element from the start until it finds the value (works on any array).",
        "**Binary search** works only on a **sorted** array: look at the middle; if the value is bigger, throw away the left half, otherwise the right half; repeat. Much faster on big arrays.",
      ],
      run: {
        files: main(`public class Main {
    static int linearSearch(int[] array, int value) {
        int index = 0;
        while (index < array.length && array[index] != value) {
            index++;
        }
        return index == array.length ? -1 : index;
    }

    static int binarySearch(int[] array, int value) {
        int low = 0, high = array.length - 1, mid = (low + high) / 2;
        while (low <= high && array[mid] != value) {
            if (array[mid] < value) low = mid + 1;
            else high = mid - 1;
            mid = (low + high) / 2;
        }
        return low > high ? -1 : mid;
    }

    public static void main(String[] args) {
        int[] unsorted = {1, 12, 7, 25, 67, 46, 57};
        System.out.println(linearSearch(unsorted, 25) + " " + linearSearch(unsorted, 99));
        int[] sorted = {1, 7, 12, 25, 46, 57, 67};
        System.out.println(binarySearch(sorted, 25) + " " + binarySearch(sorted, 99));
    }
}`),
        expectedOutput: "3 -1\n3 -1",
      },
    },
    {
      title: "6. Selection sort and bubble sort",
      explain: [
        "**Selection sort**: find the smallest element in the unsorted part and swap it to the front; repeat.",
        "**Bubble sort**: compare neighbours and swap if they are in the wrong order; keep making passes until a pass makes no swaps. Each pass 'bubbles' the largest remaining value to the end.",
        "Swapping always needs a temporary variable: `temp = a; a = b; b = temp;`",
      ],
      run: {
        files: main(`import java.util.Arrays;

public class Main {
    static void selectionSort(int[] array) {
        for (int start = 0; start < array.length - 1; start++) {
            int minIndex = start;
            for (int i = start + 1; i < array.length; i++) {
                if (array[i] < array[minIndex]) minIndex = i;
            }
            int temp = array[start];
            array[start] = array[minIndex];
            array[minIndex] = temp;
        }
    }

    static void bubbleSort(int[] array) {
        int bottom = array.length - 2;
        boolean exchanged = true;
        while (exchanged) {
            exchanged = false;
            for (int i = 0; i <= bottom; i++) {
                if (array[i] > array[i + 1]) {
                    int temp = array[i];
                    array[i] = array[i + 1];
                    array[i + 1] = temp;
                    exchanged = true;
                }
            }
            bottom--;
        }
    }

    public static void main(String[] args) {
        int[] a = {10, 23, 5, 35, 34, 12, 90, 65, 3};
        int[] b = a.clone();
        selectionSort(a);
        bubbleSort(b);
        System.out.println(Arrays.toString(a));
        System.out.println(Arrays.toString(b));
    }
}`),
        expectedOutput: "[3, 5, 10, 12, 23, 34, 35, 65, 90]\n[3, 5, 10, 12, 23, 34, 35, 65, 90]",
      },
      exam: "In 5COSC019W you sort objects with a `Comparator` instead of writing the swaps yourself (the Dispatch mock sorts missions by priority). The idea — compare two items, decide the order — is the same.",
    },
  ],
  viva: [
    { q: "What is the index of the last element of an array of length n?", a: "n - 1." },
    { q: "What does `int[] b = a;` do?", a: "Copies the reference only — a and b point to the same array." },
    { q: "When can you use binary search?", a: "Only when the array is sorted." },
    { q: "How does selection sort work?", a: "Repeatedly find the smallest element of the unsorted part and swap it into the next position at the front." },
  ],
  next: [
    { href: "/algorithms#sorting", label: "Algorithms lab: sorting visualizer" },
    { href: "/learn/comparator-sorting", label: "Lesson: sorting objects with Comparator" },
  ],
};
