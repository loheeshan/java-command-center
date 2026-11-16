import { main, type LectureGuide } from "./types";

const SRC = "SD2 Lec notes.zip";

export const sd2L5: LectureGuide = {
  id: "sd2-5",
  track: "sd2",
  week: "SD2 Lecture 5",
  lecture: "SD2 Lecture 5 — Methods & Recursion",
  title: "Methods, parameters, scope, overloading and recursion",
  sources: [`${SRC} / Lecture 5   Methods & Recursion_IIT2025.pdf`],
  goal: "Split a program into reusable methods, understand pass-by-value and scope, and read recursion.",
  minutes: 50,
  outcomes: [
    "Write the four kinds of method (with/without input, with/without output).",
    "Explain formal vs actual parameters and pass-by-value — and why arrays behave differently.",
    "Know where a variable is visible (scope).",
    "Predict which overload runs and trace a recursive call.",
  ],
  steps: [
    {
      title: "1. Why methods, and how to write one",
      explain: [
        "A method is a named group of statements that does one task — like a Python function. Writing the loop once in `printNum(start, end)` replaces three copies of it (the slide's first example).",
        "Header: `accessModifier static returnType name(parameters)`. `private` = only this class can call it; `public` = any class. `void` = returns nothing.",
        "**Formal parameters** are the names in the header (`int start, int end`). **Actual parameters** (arguments) are the values in the call (`printNum(0, 3)`). They must match in number and type.",
      ],
      run: {
        files: main(`public class Main {
    // no input, no output
    private static void printError() {
        System.out.println("Error. Try again");
    }
    // input and output
    private static int addNumbers(int x, int y) {
        return x + y;
    }
    // input, no output
    private static void checkLargerThan10(int number) {
        if (number > 10) System.out.println("Larger than 10.");
        else System.out.println("Not larger than 10.");
    }
    // the slide's repeated loop, written once
    public static void printNum(int start, int end) {
        for (int i = start; i < end; i++) System.out.print(i + " ");
        System.out.println();
    }
    private static void checkEmail(String email) {
        if (email.contains("@") && email.contains(".")) System.out.println(email + ": correct");
        else System.out.println(email + ": not correct");
    }

    public static void main(String[] args) {
        printError();
        System.out.println(addNumbers(2, 3));
        checkLargerThan10(12);
        printNum(0, 3);
        printNum(20, 23);
        checkEmail("bla@bla");
        checkEmail("bla@bla.com");
    }
}`),
        expectedOutput: "Error. Try again\n5\nLarger than 10.\n0 1 2 \n20 21 22 \nbla@bla: not correct\nbla@bla.com: correct",
      },
    },
    {
      title: "2. Pass-by-value — and the array surprise",
      explain: [
        "Java copies the **value** of each argument into the parameter. Changing an `int` parameter inside the method does not change the caller's variable.",
        "An array variable's value is a **reference**, so the method gets a copy of the *address* — and changes to the array's contents are visible to the caller (the slide's `add_1` example prints 3, 5, 7, 9).",
      ],
      run: {
        files: main(`import java.util.Arrays;

public class Main {
    static void addOneToInt(int n) { n++; }

    static void addOne(int[] array) {
        for (int i = 0; i < array.length; i++) array[i]++;
    }

    public static void main(String[] args) {
        int x = 5;
        addOneToInt(x);
        System.out.println(x);                    // unchanged

        int[] array = {2, 4, 6, 8};
        addOne(array);
        System.out.println(Arrays.toString(array)); // changed!
    }
}`),
        expectedOutput: "5\n[3, 5, 7, 9]",
      },
      exam: "Objects work like arrays here: pass a `Product` to a method, call a setter inside, and the caller sees the change.",
    },
    {
      title: "3. Scope: where a variable exists",
      explain: [
        "- A **local variable** (declared in a method, including parameters) exists only in that method.\n- A variable declared in a block `{ }` (like a for loop) exists only in that block.\n- Two methods can both have a variable called `result` — they are different variables.\n- A **field** (declared in the class, outside methods) is visible in all methods of the class. If a local variable has the same name, the local one wins inside its scope.",
        "The slide's two 'predict the output' exercises — note in the second one the parameters are named `(int b, int a)`, so the **order of the call** decides, not the names:",
      ],
      run: {
        files: main(`public class Main {
    static final float VAR_1 = 1;            // class constant: visible in every method

    private static int doubleIt(int num) {
        int result = num + num;              // local to doubleIt
        return result;
    }

    private static int mix(int b, int a) {   // parameter names swapped on purpose
        return (a * 2) + b;
    }

    public static void main(String[] args) {
        int num = 10;
        System.out.println(doubleIt(num));
        int a = 2, b = 10;
        System.out.println(mix(a, b));       // inside mix: b=2, a=10
        System.out.println(VAR_1);
    }
}`),
        expectedOutput: "20\n22\n1.0",
      },
    },
    {
      title: "4. Overloading: same name, different parameters",
      explain: [
        "Several methods in one class may share a name if their **parameter lists differ** (number or types). The **return type alone is not enough** — it is not part of the signature.",
        "Java picks the version at **compile time** from the argument types (the slide calls this *static polymorphism*). The slide's question: `multiply_numbers(2.5, 1.5)` with double arguments runs **Method 2**.",
      ],
      run: {
        files: main(`public class Main {
    private static int multiplyNumbers(int x, int y) {
        System.out.println("Method 1");
        return x * y;
    }
    private static double multiplyNumbers(double x, double y) {
        System.out.println("Method 2");
        return x * y;
    }

    public static void main(String[] args) {
        double a = 2.5, b = 1.5;
        System.out.println(multiplyNumbers(a, b));
        System.out.println(multiplyNumbers(3, 4));
    }
}`),
        expectedOutput: "Method 2\n3.75\nMethod 1\n12",
      },
      exam: "5COSC019W Lecture 5 contrasts this with **overriding** (same signature in a subclass, chosen at runtime). Overloading = compile time, overriding = runtime.",
    },
    {
      title: "5. Recursion: a method that calls itself",
      explain: [
        "A recursive method solves a problem using a smaller version of the same problem. It needs a **base case** (the simplest input, answered directly) or it never stops (StackOverflowError).",
        "The slide's `myPower(2, 3)`: `2 * myPower(2, 2)` → `2 * myPower(2, 1)` → `2 * myPower(2, 0)` → base case returns 1; then the answers multiply back up: 2, 4, 8.",
      ],
      run: {
        files: main(`public class Main {
    static double myPower(double number, int powerOf) {
        if (powerOf == 0) {                  // base case
            return 1;
        }
        return number * myPower(number, powerOf - 1);
    }

    static int sumUpTo(int n) {              // 10 + 9 + ... + 0
        if (n == 0) return 0;
        return n + sumUpTo(n - 1);
    }

    public static void main(String[] args) {
        System.out.println(myPower(2, 3));
        System.out.println(myPower(2, 4));
        System.out.println(sumUpTo(10));
    }
}`),
        expectedOutput: "8.0\n16.0\n55",
      },
    },
  ],
  viva: [
    { q: "What is the signature of a method?", a: "Its name plus the number, types and order of its parameters (not the return type)." },
    { q: "Is Java pass-by-value or pass-by-reference?", a: "Always pass-by-value. For arrays and objects the value copied is the reference, so the method can change the object's contents." },
    { q: "What is a local variable?", a: "A variable declared inside a method or block; it exists only there." },
    { q: "What does every recursive method need?", a: "A base case that returns without recursing, and each call must move closer to it." },
  ],
  next: [
    { href: "/learn/methods-arrays-lists", label: "Lesson: methods, arrays, ArrayList" },
    { href: "/playground", label: "Coding challenges with hidden tests" },
  ],
};

export const sd2L8: LectureGuide = {
  id: "sd2-8",
  track: "sd2",
  week: "SD2 Lecture 8–9",
  lecture: "SD2 Lecture 8 — Classes & Objects (+ Week 09 OOP activity)",
  title: "First classes: Rectangle, Student, constructors, access modifiers, objects in arrays",
  sources: [`${SRC} / Lecture8_Objects & ClassesFinal_IIT2025.pdf`, `${SRC} / Lecture09Activities.pdf`],
  goal: "Replace parallel arrays with a class, create objects with constructors, and store objects in arrays and lists.",
  minutes: 50,
  outcomes: [
    "Explain why one `Student` class beats four parallel arrays.",
    "Write a class with private fields, a constructor using `this`, getters and setters.",
    "Use a class inside another class (Person has an Address / Vehicles).",
    "Use a static counter and put objects in an array and an ArrayList.",
  ],
  notes: [
    "The 'Static vs non-static' slide calls `new Student()` while the Student class only has a `Student(String name)` constructor. That does not compile: once you write a constructor, Java no longer provides the empty default one.",
  ],
  steps: [
    {
      title: "1. From parallel arrays to a class",
      explain: [
        "Storing 550 students as `String[] ID`, `String[] name`, `int[] marksICT`, `int[] marksCW` means four arrays that must stay in the same order — fragile. A **class** `Student` groups one student's data together; each student is one **object**.",
        "An object has **identity** (who am I?), **state/attributes** (what do I know?) and **behaviour/methods** (what can I do?). You already used objects: `new Scanner(System.in)`, `new File(\"example.txt\")`.",
      ],
    },
    {
      title: "2. Rectangle: fields, a method, a constructor, `this`",
      explain: [
        "The lecture's `Rectangle` has three fields, a constructor and a method `calcArea()`. A **constructor** has the class's name, **no return type**, and runs with `new`. If you write none, Java gives a default no-argument one that leaves fields at default values (0, null).",
        "When the parameter has the same name as the field, `this.length = length;` means *this object's field = the parameter*.",
      ],
      run: {
        files: main(`class Rectangle {
    int length;
    int width;
    String color;

    public Rectangle(int length, int width, String color) {
        this.length = length;
        this.width = width;
        this.color = color;
    }

    void setData(int l, int w, String c) {
        length = l;
        width = w;
        color = c;
    }

    int calcArea() {
        return length * width;
    }
}

public class Main {
    public static void main(String[] args) {
        Rectangle rect1 = new Rectangle(20, 10, "blue");
        Rectangle rect2 = new Rectangle(10, 7, "green");
        System.out.println(rect1.color + " " + rect1.calcArea());
        rect1.setData(25, 3, "red");
        System.out.println(rect1.color + " " + rect1.calcArea());
        System.out.println(rect2.color + " " + rect2.calcArea());

        Rectangle r3 = rect2;              // same object, two names
        r3.width = 1;
        System.out.println(rect2.calcArea());
    }
}`),
        expectedOutput: "blue 200\nred 75\ngreen 70\n10",
      },
    },
    {
      title: "3. private fields, getters, setters with validation",
      explain: [
        "With `public` fields anyone can write `s1.markICT = 205;` or `-12` — a meaningless object. Make fields **private** and offer **getters** (read) and **setters** (change, with checks).",
        "Access levels: `public` everywhere; `protected` package + subclasses; *(no modifier)* package only; `private` this class only. (5COSC019W Lecture 2 covers the same table with UML symbols.)",
      ],
      run: {
        files: main(`class Student {
    private String name;
    private String id;
    private int markIct;

    public Student(String name, String id, int markIct) {
        this.name = name;
        this.id = id;
        setMarkIct(markIct);
    }

    public String getName() { return name; }
    public int getMarkIct() { return markIct; }

    public void setMarkIct(int markIct) {
        if (markIct < 0 || markIct > 100) {
            System.out.println("Invalid mark " + markIct + " ignored");
            return;
        }
        this.markIct = markIct;
    }
}

public class Main {
    public static void main(String[] args) {
        Student s1 = new Student("Alex", "w12345", 90);
        s1.setMarkIct(205);                 // rejected
        System.out.println(s1.getName() + " " + s1.getMarkIct());
        // s1.markIct = 205;                // compile error: markIct has private access
    }
}`),
        expectedOutput: "Invalid mark 205 ignored\nAlex 90",
      },
    },
    {
      title: "4. Week 09 activity: Person, Vehicle, a static counter",
      explain: [
        "This solves the Week 09 OOP activity: a `Person` with getters/setters and **two constructors** (the default one represents 'Doe, 20, 5.5'), a **static** counter of how many persons were created, and a `Vehicle` class. A person can own up to two vehicles — a class that **has** objects of another class.",
      ],
      run: {
        files: main(`class Vehicle {
    private String vehicleModel;
    private int vehicleNo;
    public Vehicle(String vehicleModel, int vehicleNo) {
        this.vehicleModel = vehicleModel;
        this.vehicleNo = vehicleNo;
    }
    public String getVehicleModel() { return vehicleModel; }
    public int getVehicleNo() { return vehicleNo; }
}

class Person {
    private static int count = 0;          // one shared counter
    private String name;
    private int age;
    private double height;
    private Vehicle[] vehicles = new Vehicle[2];
    private int vehicleCount = 0;

    public Person(String name, int age, double height) {
        this.name = name;
        this.age = age;
        this.height = height;
        count++;
    }
    public Person() {
        this("Doe", 20, 5.5);               // reuse the other constructor
    }

    public static int getCount() { return count; }
    public String getName() { return name; }

    public void addVehicle(Vehicle vehicle) {
        if (vehicleCount == vehicles.length) {
            System.out.println(name + " already owns two vehicles");
            return;
        }
        vehicles[vehicleCount++] = vehicle;
    }

    public String getVehicleData() {
        String data = "";
        for (int i = 0; i < vehicleCount; i++) {
            data += vehicles[i].getVehicleModel() + "(" + vehicles[i].getVehicleNo() + ") ";
        }
        return data.trim();
    }
}

public class Main {
    public static void main(String[] args) {
        Person anne = new Person("Anne", 24, 5.3);
        Person john = new Person("John", 21, 5.8);
        Person doe = new Person();
        Vehicle benz = new Vehicle("Benz", 1234);
        Vehicle toyota = new Vehicle("Toyota", 5647);
        Vehicle nissan = new Vehicle("Nissan", 1456);
        anne.addVehicle(benz);
        john.addVehicle(nissan);
        john.addVehicle(toyota);
        john.addVehicle(benz);
        System.out.println("Persons created: " + Person.getCount());
        System.out.println(doe.getName());
        System.out.println("Anne: " + anne.getVehicleData());
        System.out.println("John: " + john.getVehicleData());
    }
}`),
        expectedOutput: "John already owns two vehicles\nPersons created: 3\nDoe\nAnne: Benz(1234)\nJohn: Nissan(1456) Toyota(5647)",
      },
      exam: "`this(...)` calls another constructor of the **same** class; `super(...)` (5COSC019W Lecture 4) calls the **parent** class's constructor. Both must be the first line.",
    },
    {
      title: "5. Objects in arrays and ArrayLists",
      explain: [
        "You can make an array of objects (`Student[] list = new Student[4];` — every slot starts as `null`) or, better, an `ArrayList<Student>` that grows as you add.",
      ],
      run: {
        files: main(`import java.util.ArrayList;

class Student {
    private String name;
    private int mark;
    public Student(String name, int mark) { this.name = name; this.mark = mark; }
    public String getName() { return name; }
    public int getMark() { return mark; }
}

public class Main {
    public static void main(String[] args) {
        Student[] listStudents = new Student[4];
        listStudents[0] = new Student("Alex", 90);
        listStudents[1] = new Student("Billy", 75);
        System.out.println(listStudents[0].getName() + " " + listStudents[2]);

        ArrayList<Student> students = new ArrayList<>();
        students.add(new Student("Alex", 90));
        students.add(new Student("Billy", 75));
        int total = 0;
        for (Student s : students) total += s.getMark();
        System.out.println(students.size() + " students, average " + (total / (double) students.size()));
    }
}`),
        expectedOutput: "Alex null\n2 students, average 82.5",
      },
    },
  ],
  viva: [
    { q: "What is the difference between a class and an object?", a: "A class is the template (fields + methods); an object is one instance created from it with `new`." },
    { q: "When does Java provide a default constructor?", a: "Only when the class declares no constructor at all." },
    { q: "Why make fields private?", a: "So other classes cannot put the object into an invalid state; changes go through methods that can validate." },
    { q: "What does a static field mean?", a: "One copy shared by all objects of the class, e.g. a counter of objects created." },
  ],
  next: [
    { href: "/lectures/week-1", label: "Next: 5COSC019W Week 1 guide (the same ideas, deeper)" },
    { href: "/learn/classes-objects", label: "Lesson: classes and objects" },
    { href: "/oop-lab#memory", label: "OOP Lab: objects and references in memory" },
  ],
};

export const sd2Files: LectureGuide = {
  id: "sd2-files",
  track: "sd2",
  week: "SD2 File handling",
  lecture: "SD2 File Handling — Self-Guided Tutorial",
  title: "Files: create, write, read, rename, delete",
  sources: [`${SRC} / FileHandlingSelfGuidedTutorial.pdf`],
  goal: "Save data to a text file so it survives after the program ends, and read it back.",
  minutes: 25,
  outcomes: [
    "Create a file with `File.createNewFile()`.",
    "Write with `FileWriter` and read with `Scanner(File)`.",
    "Handle `IOException` with try / catch.",
  ],
  steps: [
    {
      title: "1. Why files, and the classes involved",
      explain: [
        "Variables disappear when the program ends. A **file** keeps data permanently.",
        "- `java.io.File` — represents a file or folder path: `exists()`, `createNewFile()`, `getName()`, `renameTo()`, `delete()`, `mkdirs()`, `list()`.\n- `java.io.FileWriter` — writes text: `write(...)`, then `close()`.\n- `java.util.Scanner` with a `File` — reads it line by line: `hasNextLine()`, `nextLine()`.",
        "File operations can fail (no permission, file missing), so they throw the **checked** exception `IOException` — the compiler forces you to catch it (5COSC019W Lecture 6 explains checked vs unchecked).",
      ],
    },
    {
      title: "2. Create, write, read, rename, delete — one program",
      explain: [
        "This runs in a private temporary folder for each run, so it is safe to try. Read it top to bottom: each block is one slide of the tutorial.",
      ],
      run: {
        files: main(`import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        try {
            File file = new File("text.txt");
            boolean created = file.createNewFile();
            System.out.println(created ? "File created: " + file.getName() : "File already exists.");

            FileWriter writer = new FileWriter(file);
            writer.write("Alan Turing\\n");
            writer.write("Ada Lovelace\\n");
            writer.close();
            System.out.println("Successfully wrote to the file.");

            Scanner reader = new Scanner(file);
            int lineCount = 1;
            while (reader.hasNextLine()) {
                System.out.println(lineCount + " " + reader.nextLine());
                lineCount++;
            }
            reader.close();

            File renamed = new File("people.txt");
            System.out.println("Renamed: " + file.renameTo(renamed));
            System.out.println("Old exists: " + file.exists() + ", new exists: " + renamed.exists());

            if (renamed.exists()) {
                renamed.delete();
                System.out.println("File deleted.");
            }
        } catch (IOException e) {
            System.out.println("An error occurred: " + e.getMessage());
        }
    }
}`),
        expectedOutput: "File created: text.txt\nSuccessfully wrote to the file.\n1 Alan Turing\n2 Ada Lovelace\nRenamed: true\nOld exists: false, new exists: true\nFile deleted.",
      },
      tryIt: "Remove the `try` / `catch` and run: compile error 'unreported exception IOException; must be caught or declared to be thrown'. That is a checked exception.",
      exam: "Not in the 5COSC019W practical (data lives in a repository in memory), but `IOException` is the standard example of a checked exception for the viva.",
    },
  ],
  viva: [
    { q: "Why must file code be inside try/catch?", a: "Because FileWriter and Scanner(File) throw IOException / FileNotFoundException, which are checked exceptions." },
    { q: "Why call close()?", a: "To flush the written data to disk and release the file." },
  ],
  next: [{ href: "/lectures/lecture-6", label: "5COSC019W Lecture 6 guide: checked vs unchecked exceptions" }],
};

export const sd2L10: LectureGuide = {
  id: "sd2-10",
  track: "sd2",
  week: "SD2 Lecture 10",
  lecture: "SD2 Lecture 10 — Queues and Stacks",
  title: "Queues (FIFO), circular queues, stacks (LIFO) and the Collections Framework",
  sources: [`${SRC} / SD2_Week10_Queues and StacksFinal_IIT2425 (1).pdf`],
  goal: "Build a queue and a stack on top of an array, and know which one fits a problem.",
  minutes: 40,
  outcomes: [
    "Explain FIFO vs LIFO with real examples.",
    "Implement enqueue / dequeue and push / pop with an array.",
    "Explain why a circular queue avoids shifting.",
    "Name Set, List, Queue and Map from the Collections Framework.",
  ],
  steps: [
    {
      title: "1. FIFO and LIFO",
      explain: [
        "- **Queue = FIFO** (first in, first out): add at the rear (*enqueue*), remove from the front (*dequeue*). Supermarket tills, ticket websites, food orders.\n- **Stack = LIFO** (last in, first out): add and remove at the top (*push* / *pop*). Undo, browser back button, checking balanced brackets.",
      ],
    },
    {
      title: "2. A linear queue on an array",
      explain: [
        "The lecture's `FIFO` class keeps a `String[]` and a counter `num_elements`. `dequeue` takes `queue[0]` and **shifts** every element left — simple but slow for big queues.",
      ],
      run: {
        files: main(`class Fifo {
    private String[] queue;
    private int numElements = 0;

    public Fifo(int capacity) { queue = new String[capacity]; }

    public void enqueue(String item) {
        if (numElements == queue.length) {
            System.out.println("Queue is full. Element not added.");
            return;
        }
        queue[numElements] = item;
        numElements++;
    }

    public String dequeue() {
        if (numElements == 0) {
            System.out.println("Queue is empty.");
            return "";
        }
        String item = queue[0];
        numElements--;
        for (int i = 0; i < numElements; i++) queue[i] = queue[i + 1];
        return item;
    }
}

public class Main {
    public static void main(String[] args) {
        Fifo queue = new Fifo(3);
        queue.enqueue("A");
        queue.enqueue("B");
        queue.enqueue("C");
        queue.enqueue("D");                 // full
        System.out.println(queue.dequeue());
        System.out.println(queue.dequeue());
        queue.enqueue("D");
        queue.enqueue("E");
        System.out.println(queue.dequeue());
        System.out.println(queue.dequeue());
        System.out.println(queue.dequeue());
        queue.dequeue();                    // empty
    }
}`),
        expectedOutput: "Queue is full. Element not added.\nA\nB\nC\nD\nE\nQueue is empty.",
      },
    },
    {
      title: "3. A circular queue: no shifting",
      explain: [
        "A circular queue keeps two positions, `front` and `rear`, and wraps around the end of the array with `% queue.length`. Dequeue just moves `front` forward — nothing is shifted.",
      ],
      run: {
        files: main(`class CircularQueue {
    private String[] queue;
    private int front = 0, rear = 0, numElements = 0;

    public CircularQueue(int capacity) { queue = new String[capacity]; }

    public void enqueue(String item) {
        if (numElements == queue.length) { System.out.println("Queue is full. Element not added."); return; }
        queue[rear] = item;
        rear = (rear + 1) % queue.length;      // wrap around
        numElements++;
    }

    public String dequeue() {
        if (numElements == 0) { System.out.println("Queue is empty."); return ""; }
        String item = queue[front];
        front = (front + 1) % queue.length;    // wrap around
        numElements--;
        return item;
    }

    public String positions() { return "front=" + front + " rear=" + rear; }
}

public class Main {
    public static void main(String[] args) {
        CircularQueue q = new CircularQueue(3);
        q.enqueue("A"); q.enqueue("B"); q.enqueue("C");
        System.out.println(q.dequeue() + " " + q.dequeue() + "  " + q.positions());
        q.enqueue("D"); q.enqueue("E");          // D goes into slot 0 again
        System.out.println(q.positions());
        System.out.println(q.dequeue() + " " + q.dequeue() + " " + q.dequeue());
    }
}`),
        expectedOutput: "A B  front=2 rear=0\nfront=2 rear=2\nC D E",
      },
    },
    {
      title: "4. A stack on an array",
      explain: [
        "The lecture's stack keeps an index `first` of the top element, starting at `-1` (empty). `push` increments it and stores; `pop` returns the top and decrements.",
      ],
      run: {
        files: main(`class StackExample {
    private String[] stack;
    private int first = -1;

    public StackExample(int capacity) { stack = new String[capacity]; }

    public void push(String item) {
        if (first == stack.length - 1) { System.out.println("Stack is full. Element not added."); return; }
        first++;
        stack[first] = item;
    }

    public String pop() {
        if (first == -1) { System.out.println("Stack is empty."); return ""; }
        String item = stack[first];
        first--;
        return item;
    }
}

public class Main {
    static boolean balanced(String code) {           // slide Exercise 4
        StackExample s = new StackExample(code.length());
        for (char ch : code.toCharArray()) {
            if (ch == '(' || ch == '[' || ch == '{') s.push(String.valueOf(ch));
            else if (ch == ')' || ch == ']' || ch == '}') {
                String open = s.pop();
                if (!(open + ch).equals("()") && !(open + ch).equals("[]") && !(open + ch).equals("{}")) return false;
            }
        }
        return true;
    }

    public static void main(String[] args) {
        StackExample stack = new StackExample(3);
        stack.push("A"); stack.push("B"); stack.push("C");
        stack.push("D");
        System.out.println(stack.pop() + " " + stack.pop());
        stack.push("D"); stack.push("E");
        System.out.println(stack.pop() + " " + stack.pop() + " " + stack.pop());
        System.out.println(balanced("{ a[i] = (x + y); }") + " " + balanced("( ]"));
    }
}`),
        expectedOutput: "Stack is full. Element not added.\nC B\nE D A\ntrue false",
      },
    },
    {
      title: "5. The Java Collections Framework",
      explain: [
        "You rarely write your own in real code — Java provides them:",
        "- **List** (`ArrayList`, `LinkedList`): ordered, duplicates allowed.\n- **Set** (`HashSet`): no duplicates.\n- **Queue** (`ArrayDeque`, `LinkedList`): `offer`, `poll`, `peek`.\n- **Map** (`HashMap`): key → value.\n- Stack behaviour: `ArrayDeque` with `push` / `pop`.",
        "An **iterator** walks through a collection: `hasNext()` and `next()`. The enhanced for loop uses one behind the scenes.",
      ],
      run: {
        files: main(`import java.util.*;

public class Main {
    public static void main(String[] args) {
        Queue<String> orders = new ArrayDeque<>();
        orders.offer("pizza"); orders.offer("tea");
        System.out.println(orders.poll() + " " + orders.peek());

        Deque<String> undo = new ArrayDeque<>();
        undo.push("type a"); undo.push("type b");
        System.out.println(undo.pop());

        Set<String> ids = new HashSet<>(List.of("w1", "w2"));
        System.out.println(ids.add("w1") + " " + ids.size());   // duplicate refused

        List<String> names = new ArrayList<>(List.of("Ann", "Bob"));
        Iterator<String> it = names.iterator();
        while (it.hasNext()) System.out.print(it.next() + " ");
        System.out.println();
    }
}`),
        expectedOutput: "pizza tea\ntype b\nfalse 2\nAnn Bob",
      },
      exam: "5COSC019W uses `List` and `Map` (Lecture 3). Queues and stacks are SD2 background — they are not tasks in the OOP practical.",
    },
  ],
  viva: [
    { q: "FIFO or LIFO for a restaurant's order system?", a: "FIFO — a queue: orders are served in the order they arrive." },
    { q: "Which structure checks balanced brackets?", a: "A stack: push opening brackets, pop and match on each closing bracket." },
    { q: "Why use a circular queue?", a: "Dequeue moves the front index instead of shifting all elements, so it is faster." },
  ],
  next: [{ href: "/lectures/lecture-3", label: "5COSC019W Lecture 3 guide: List, Map, generics" }],
};
