import type { Lesson } from "@/lib/curriculum/types";

export const examLessons: Lesson[] = [
  {
    id: "starter-project-tour",
    moduleId: "m07",
    title: "Reading an unfamiliar starter project in 10 minutes",
    minutes: 30,
    priority: "P0",
    skill: "exam",
    sources: [
      { kind: "university", label: "LBP guidance §5 — 'you must develop the ability to read unfamiliar code'" },
      { kind: "university", label: "Lecture 6 briefing — 'Learn the shape of the project, not the domain'" },
      { kind: "mock-paper", label: "Mock starter project (Dispatch)" },
    ],
    what: "A repeatable routine for opening a project you have never seen: find the entry point, list the layers, read the model contracts, then locate every `TODO`.",
    why: "The real practical gives you new code on the day. The domain will change (products, missions, books…) but the **shape** — abstract parent, subclasses, repository, service, controller, exception handler — stays the same.",
    when: "Minutes 0–10 of the practical, before writing a line of code.",
    analogy: "Arriving in a new city: first find the map (package structure), the main station (main class), the main roads (controller → service → repository), and the construction sites (TODOs).",
    compare: {
      lang: "Laravel / Next.js",
      other: `routes/web.php      → Controller → Service → Model
app/api/route.ts    → handler → lib/ → db`,
      java: `controller/DispatchController → service/DispatchService
  → repository/MissionRepository → model/*
exception/GlobalExceptionHandler catches errors from all of them`,
      notes: [
        "You already know layered apps: the Spring version maps almost 1:1.",
        "Spring finds routes via annotations — search for `@GetMapping`/`@PostMapping` instead of a routes file.",
        "In IntelliJ: `Ctrl+Shift+F` search for `TODO`; `Ctrl+Click` to jump to a definition; `Alt+F7` to find usages.",
      ],
    },
    syntax: {
      code: `1. pom.xml              → Java version, Spring Boot version, dependencies (do not edit)
2. *Application.java    → the base package; everything else lives below it
3. model/<Parent>.java  → abstract methods = what every subclass must implement
4. model/<Child>.java   → which TODOs are inside? what is already supplied?
5. repository/          → the API you must use (all, find, exists, save)
6. service/             → method signatures you must complete
7. controller/          → existing endpoints + TODO comments listing new ones
8. exception/           → handler scaffold + custom exceptions
9. application.properties → port`,
      parts: [
        { token: "abstract methods", meaning: "These signatures are the contract your new subclass must override." },
        { token: "repository API", meaning: "Never replace it. `find` returns null for unknown ids." },
        { token: "TODO comments", meaning: "Often restate the paper's rules — read both." },
      ],
    },
    example: {
      title: "Practise the routine",
      files: [
        {
          name: "Main.java",
          content: `public class Main {
    public static void main(String[] args) {
        String[] checklist = {
            "Open the folder that contains pom.xml",
            "Run it once before changing anything",
            "Open Swagger UI and call the existing GET",
            "Read the abstract parent class",
            "Search for TODO and list them in task order",
            "Upload a safety ZIP after the first big task"
        };
        for (int i = 0; i < checklist.length; i++) {
            System.out.println((i + 1) + ". " + checklist[i]);
        }
    }
}`,
        },
      ],
      expectedOutput: "1. Open the folder that contains pom.xml\n2. Run it once before changing anything\n3. Open Swagger UI and call the existing GET\n4. Read the abstract parent class\n5. Search for TODO and list them in task order\n6. Upload a safety ZIP after the first big task",
      explain: "Use the **Starter Project Explorer** in the Spring Boot Lab to walk through the real starter files with annotations.",
    },
    visual: { id: "request-flow", caption: "Trace each starter endpoint through the layers." },
    trace: {
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<Long, String> map = new HashMap<>();
        map.put(101L, "G"); map.put(102L, "G");
        Collection<String> view = map.values();
        List<String> copy = List.copyOf(map.values());
        map.put(103L, "A");
        System.out.println(view.size() + " " + copy.size());
    }
}`,
      output: "3 2",
      explanation: "`map.values()` is a live **view** that sees later additions. `List.copyOf(...)` (used by the starter's `all()`) is an **unmodifiable snapshot** — so you must copy it into a new ArrayList before sorting.",
    },
    challenge: { examTask: "task1", text: "Open the Exam Lab, read every starter file, and complete Task 1." },
    mistakes: [
      { mistake: "Starting to code before running the starter once.", fix: "Run it first: if it does not start untouched, ask the invigilator about tools immediately." },
      { mistake: "Editing supplied classes 'to make it easier'.", fix: "Do not replace the parent class, model contracts or repository API." },
      { mistake: "Missing a TODO hidden in a supplied file (e.g. the repository seed line).", fix: "Search the whole project for `TODO`." },
    ],
    quiz: ["qs-tour-1", "qs-tour-2", "qs-tour-3"],
    examQuestion: {
      prompt: "In the Dispatch starter, list every place that contains a TODO and which task it belongs to.",
      modelAnswer: "GroundMission (Task 1: energyUnits, priority) · MissionRepository constructor (seed AirMission 103 after Task 2) · DispatchService.energy (3.1), addAir (3.2), plan (2.3 + 3.3 capacity) · DispatchController (Task 4: three endpoints) · GlobalExceptionHandler (3.3). Plus a **new file**: model/AirMission.java (2.1/2.2).",
    },
    summary: [
      "Shape over domain: parent → subclasses → repository → service → controller → handler.",
      "Run first, read contracts, search TODOs.",
      "Never edit supplied contracts.",
    ],
  },
  {
    id: "exam-strategy",
    moduleId: "m08",
    title: "Exam-day workflow: 100 minutes, one ZIP, a viva",
    minutes: 25,
    priority: "P0",
    skill: "exam",
    sources: [
      { kind: "university", label: "LBP guidance — 90 + 10 minutes, OOP 40 / Spring Boot 40 / validation 20, viva" },
      { kind: "university", label: "Lecture 6 slides 37–42 — rules, timeline, where people lose time" },
    ],
    what: "A concrete minute-by-minute plan and checklist for the practical, taken from the university's own briefing.",
    why: "Section B only runs if your ZIP starts. A single compile error anywhere, or a ZIP of the wrong folder, costs 20 marks regardless of how good your code is.",
    when: "Rehearse it in the Exam Simulator on Thursday afternoon.",
    analogy: "A pilot's checklist: experienced pilots still use it, because under time pressure memory fails and checklists do not.",
    compare: {
      lang: "Your usual workflow",
      other: `git commit often
npm run dev, hot reload
ask AI / Stack Overflow`,
      java: `no Git: upload a safety ZIP after Task 3
restart the Spring app after changes
open book: slides + Java/Spring docs, NO AI`,
      notes: [
        "Open book: lecture slides, Blackboard materials, Java and Spring docs. No AI assistants (Lecture 6).",
        "No Git. Your safety net is an early ZIP upload.",
        "The viva can change your mark: be able to explain every line you submit.",
      ],
    },
    syntax: {
      code: `0:00  open paper, download + unzip starter, open folder with pom.xml
0:05  run it untouched, open Swagger, read all files (10 min)
0:15  Task 1 (small, sure marks)            → run
0:30  Task 2: subclass + algorithm          → run
0:50  Task 3: exceptions + handler          → run → SAFETY ZIP + upload
1:10  Task 4: endpoints                     → run + Swagger checks
1:30  STOP coding. Run every Section B check in Swagger
1:33  zip the project folder (pom.xml + src inside), check the zip
1:35  upload, replace the safety copy, submit
1:40  time ends`,
      parts: [
        { token: "run after every task", meaning: "Find compile errors while they are small." },
        { token: "SAFETY ZIP", meaning: "Lecture 6: 'Uploading at the end — the one failure with no recovery.'" },
        { token: "1:30 STOP", meaning: "The last 10 minutes are for submission only." },
      ],
    },
    example: {
      title: "Comment out, don't break the build",
      files: [
        {
          name: "Main.java",
          content: `public class Main {
    // If a method will not compile and time is short, keep the build green:
    // return a safe placeholder and leave a comment explaining your intent.
    static int energyUnits(int distanceKm, int loadKg) {
        long energy = 2L * distanceKm + 5L * loadKg;
        return Math.toIntExact(energy);
    }

    static int unfinished() {
        // TODO: could not finish the planner in time; approach was filter -> sort -> greedy
        throw new UnsupportedOperationException("not finished");
    }

    public static void main(String[] args) {
        System.out.println("Builds and runs: " + energyUnits(12, 3));
    }
}`,
        },
      ],
      expectedOutput: "Builds and runs: 39",
      explain: "An unfinished method that **compiles** keeps Section B alive for every other endpoint. A half-written method with syntax errors breaks the whole application.",
    },
    trace: {
      code: `public class Main {
    public static void main(String[] args) {
        int total = 100, submitWindow = 10, reading = 10;
        int coding = total - submitWindow - reading;
        int[] taskMarks = {18, 22, 20, 20};
        int sum = 0;
        for (int m : taskMarks) sum += m;
        System.out.println(coding + " minutes for " + sum + " marks = " + (double) sum / coding + " marks/min");
    }
}`,
      output: "80 minutes for 80 marks = 1.0 marks/min",
      explanation: "A useful pacing rule from the mock paper: roughly one Section A mark per minute. If an 8-mark subtask has taken 20 minutes, move on and come back.",
    },
    challenge: { examTask: "simulator", text: "Run the full 100-minute Exam Simulator under exam conditions." },
    mistakes: [
      { mistake: "Zipping `src` only, or a single .java file.", fix: "Zip the folder that contains `pom.xml` and `src`. Open the ZIP to check." },
      { mistake: "Leaving the app un-runnable at the end.", fix: "Keep the build green; stub what you cannot finish." },
      { mistake: "Copying code you cannot explain.", fix: "The viva checks understanding; practise explaining each method aloud." },
      { mistake: "Forgetting the AirMission seed line in the repository.", fix: "B2, B3, B4, B6 all need mission 103." },
    ],
    quiz: ["qs-strategy-1", "qs-strategy-2", "qs-strategy-3", "qs-strategy-order-1"],
    examQuestion: {
      prompt: "It is 1:28 into the practical. Task 4.3 still has a compile error you cannot find. What do you do?",
      modelAnswer: "Make the build green immediately: comment out or stub the broken method (e.g. return `null` or throw `UnsupportedOperationException`), restart, confirm the other endpoints still work in Swagger, then zip the folder containing `pom.xml` and upload before 1:35. A running app scores Section B for everything else.",
    },
    summary: [
      "100 min = 90 solve + 10 upload. Stop coding at 1:30.",
      "Run after every task; safety ZIP after Task 3.",
      "Zip the folder with pom.xml + src.",
      "A green build beats an unfinished feature.",
      "Be ready to explain every line (viva).",
    ],
  },
];
