import type { Lesson } from "@/lib/curriculum/types";

export const coreLessons: Lesson[] = [
  {
    id: "collections-generics",
    moduleId: "m03",
    title: "List, ArrayList, Map, HashMap and generics",
    minutes: 40,
    priority: "P0",
    skill: "collections",
    sources: [
      { kind: "university", label: "Lecture 3 — List<T>/ArrayList<T>, Map<K,V>/HashMap, programming to the interface" },
      { kind: "mock-paper", label: "MissionRepository — Map<Long, DispatchMission> with ConcurrentHashMap" },
    ],
    videos: [{ video: "java", chapter: 56 }, { video: "java", chapter: 67 }, { video: "java", chapter: 66 }],
    what: "The **Collections Framework** provides `List` (ordered, allows duplicates, index access) and `Map` (key → value lookup). **Generics** (`List<PlanLine>`) tell the compiler what type of element a collection holds.",
    why: "Lecture 3: 'An array is a fixed-length box. A collection is a box that resizes itself.' Maps give fast lookup by id — exactly what `MissionRepository` does with `Map<Long, DispatchMission>`.",
    when: "Reading the repository (`map.get(id)`, `map.containsKey(id)`, `map.values()`), building `selected`/`skipped` lists in the planner, and copying a collection into a list so it can be sorted.",
    analogy: "A `List` is a numbered queue of people. A `Map` is a cloakroom: hand in ticket 103, get back exactly that coat, without searching the whole room.",
    compare: {
      lang: "JavaScript",
      other: `const missions = new Map();
missions.set(101, m101);
missions.get(101);
missions.has(999);       // false
[...missions.values()];`,
      java: `Map<Long, DispatchMission> missions = new HashMap<>();
missions.put(101L, m101);
missions.get(101L);
missions.containsKey(999L);   // false
new ArrayList<>(missions.values());`,
      notes: [
        "`set` → `put`, `has` → `containsKey`. `get` returns `null` when the key is missing (no exception).",
        "Key type matters: the repository uses `Long` keys, so write `101L` or pass a `long` variable.",
        "Declare the **interface**, construct the **implementation**: `List<X> xs = new ArrayList<>();` (Lecture 3: programming to the interface).",
        "`map.values()` is a *view*, not a List. Copy it (`new ArrayList<>(...)`) before sorting.",
      ],
    },
    syntax: {
      code: `List<DispatchMission> eligible = new ArrayList<>();
for (DispatchMission m : repo.all()) {      // Collection<DispatchMission>
    eligible.add(m);
}

Map<Long, DispatchMission> map = new HashMap<>();
map.put(m.getId(), m);
DispatchMission found = map.get(104L);      // null if absent
if (found == null) { /* not found */ }`,
      parts: [
        { token: "List<DispatchMission>", meaning: "Generic type: only DispatchMission (or subclasses) may be added." },
        { token: "repo.all()", meaning: "Returns `Collection<DispatchMission>` — iterable with for-each, but not necessarily sortable." },
        { token: "map.get(104L)", meaning: "Lookup by key; returns `null` when missing → you decide what that means (e.g. throw MissionNotFoundException)." },
      ],
    },
    example: {
      title: "A tiny repository",
      files: [
        {
          name: "Main.java",
          content: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<Long, String> repo = new HashMap<>();
        repo.put(101L, "Ground medical");
        repo.put(102L, "Ground routine");
        repo.put(103L, "Air critical");

        System.out.println(repo.get(103L));
        System.out.println(repo.get(999L));
        System.out.println(repo.containsKey(101L) + " " + repo.size());

        List<Long> ids = new ArrayList<>(repo.keySet());
        Collections.sort(ids);
        System.out.println(ids);

        repo.put(101L, "replaced!");   // put overwrites an existing key
        System.out.println(repo.get(101L) + " " + repo.size());
    }
}`,
        },
      ],
      expectedOutput: "Air critical\nnull\ntrue 3\n[101, 102, 103]\nreplaced! 3",
      explain: "Notice the last two lines: `put` silently **overwrites**. That is why Task 3.2 must check `repo.exists(id)` before saving — otherwise a duplicate POST would replace mission 101.",
    },
    trace: {
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> energies = new ArrayList<>(List.of(38, 39, 18));
        energies.add(30);
        energies.remove(Integer.valueOf(39));
        int sum = 0;
        for (int e : energies) sum += e;
        System.out.println(energies + " " + sum + " " + energies.get(1));
    }
}`,
      output: "[38, 18, 30] 86 18",
      explanation: "Add 30 → [38, 39, 18, 30]. `remove(Integer.valueOf(39))` removes the **value** 39 (while `remove(1)` would remove the element at index 1). Sum = 38+18+30 = 86; index 1 is 18.",
    },
    challenge: { taskId: "ct-repository-lookup" },
    mistakes: [
      { mistake: "Sorting `repo.all()` directly.", fix: "Copy into `new ArrayList<>(repo.all())` first; the supplied `all()` may return an unmodifiable copy." },
      { mistake: "Assuming `map.get(id)` throws when missing.", fix: "It returns `null`. Check and throw your own exception." },
      { mistake: "`List<long>`.", fix: "Generics need `Long`." },
      { mistake: "Modifying a list while iterating it with for-each.", fix: "Build a new list (e.g. `eligible`) instead — otherwise `ConcurrentModificationException`." },
    ],
    quiz: ["qs-map-get-1", "qs-list-interface-1", "qs-map-put-1", "qs-generics-1", "qs-remove-1"],
    examQuestion: {
      prompt: "Using only the supplied repository API (`all()`, `find(id)`, `exists(id)`, `save(m)`), write `energy(long id)` for Task 3.1.",
      modelAnswer: "```java\npublic int energy(long id) {\n    DispatchMission mission = repo.find(id);\n    if (mission == null) {\n        throw new MissionNotFoundException(id);\n    }\n    return mission.energyUnits();\n}\n```",
    },
    summary: [
      "`List` = ordered; `Map` = key → value.",
      "Declare interfaces, construct implementations.",
      "`map.get` returns `null` when missing; `put` overwrites.",
      "Copy a Collection into an ArrayList before sorting.",
    ],
  },
  {
    id: "comparator-sorting",
    moduleId: "m03",
    title: "Sorting with Comparator: multiple keys, lambdas and anonymous classes",
    minutes: 45,
    priority: "P0",
    skill: "collections",
    sources: [
      { kind: "mock-paper", label: "Task 2.3 — priority DESC, energy ASC, ID ASC" },
      { kind: "university", label: "Worked solution — anonymous Comparator + Collections.sort (no streams)" },
      { kind: "supplemental", label: "Comparator.comparing chains and lambdas" },
    ],
    videos: [{ video: "java", chapter: 63, note: "anonymous classes — the style used by the official solution's Comparator" }],
    what: "A `Comparator<T>` defines an order: `compare(a, b)` returns **negative** if `a` comes first, **positive** if `b` comes first, **0** if tied. Multi-key sorting compares the first key, and only if tied moves to the next.",
    why: "The planner's result depends entirely on the order. A deterministic tie-break (ID ascending) guarantees the same input always gives the same plan.",
    when: "Task 2.3: `Collections.sort(eligible, comparator)` or `eligible.sort(comparator)`.",
    analogy: "Sorting exam scripts: first by grade (best first); for equal grades by surname; for equal surnames by student ID. You only look at the next rule when the previous one is a tie.",
    compare: {
      lang: "JavaScript",
      other: `missions.sort((a, b) =>
  b.priority - a.priority ||
  a.energy - b.energy ||
  a.id - b.id);`,
      java: `missions.sort((a, b) -> {
    int r = Integer.compare(b.priority(), a.priority());
    if (r != 0) return r;
    r = Integer.compare(a.energyUnits(), b.energyUnits());
    if (r != 0) return r;
    return Long.compare(a.getId(), b.getId());
});`,
      notes: [
        "Same negative/zero/positive contract as JS `sort`.",
        "Java has no `||` chaining on ints — use explicit `if (r != 0) return r;`.",
        "Prefer `Integer.compare(x, y)` over `x - y` (subtraction can overflow for large values).",
        "**Descending** = swap the arguments: `Integer.compare(b..., a...)`.",
        "Java's sort is **stable** and modifies the list in place.",
      ],
    },
    syntax: {
      code: `// 1) Anonymous class (the official solution's style, Lectures 1–7 only)
Collections.sort(eligible, new Comparator<DispatchMission>() {
    @Override
    public int compare(DispatchMission first, DispatchMission second) {
        int result = Integer.compare(second.priority(), first.priority()); // DESC
        if (result != 0) return result;
        result = Integer.compare(first.energyUnits(), second.energyUnits()); // ASC
        if (result != 0) return result;
        return Long.compare(first.getId(), second.getId());                  // ASC
    }
});

// 2) Comparator chain (equivalent, shorter)
eligible.sort(Comparator.comparingInt(DispatchMission::priority).reversed()
        .thenComparingInt(DispatchMission::energyUnits)
        .thenComparingLong(DispatchMission::getId));`,
      parts: [
        { token: "new Comparator<DispatchMission>() { ... }", meaning: "Anonymous class implementing the Comparator interface." },
        { token: "Integer.compare(second..., first...)", meaning: "Swapped arguments → descending." },
        { token: "DispatchMission::priority", meaning: "Method reference — shorthand for `m -> m.priority()`." },
        { token: ".reversed()", meaning: "Reverses **everything built so far** in the chain. Use it right after the first key only." },
      ],
    },
    example: {
      title: "Three-key sort",
      files: [
        {
          name: "Main.java",
          content: `import java.util.*;

public class Main {
    static class M {
        final long id; final int energy; final int priority;
        M(long id, int energy, int priority) { this.id = id; this.energy = energy; this.priority = priority; }
        public String toString() { return id + "(p" + priority + ",e" + energy + ")"; }
    }

    public static void main(String[] args) {
        List<M> list = new ArrayList<>(List.of(
            new M(102, 18, 1), new M(101, 39, 3), new M(103, 38, 5),
            new M(104, 30, 2), new M(99, 30, 2)));

        list.sort((a, b) -> {
            int r = Integer.compare(b.priority, a.priority);
            if (r != 0) return r;
            r = Integer.compare(a.energy, b.energy);
            if (r != 0) return r;
            return Long.compare(a.id, b.id);
        });
        System.out.println(list);
    }
}`,
        },
      ],
      expectedOutput: "[103(p5,e38), 101(p3,e39), 99(p2,e30), 104(p2,e30), 102(p1,e18)]",
      explain: "99 and 104 tie on priority and energy, so ID decides: 99 first.",
    },
    visual: { id: "sorting", caption: "Step through every comparison and see which key decided it." },
    trace: {
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> xs = new ArrayList<>(List.of(5, 3, 9, 1));
        xs.sort(Comparator.reverseOrder());
        System.out.println(xs);
        List<String> words = new ArrayList<>(List.of("air", "Ground", "sea"));
        words.sort(Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder()));
        System.out.println(words);
    }
}`,
      output: "[9, 5, 3, 1]\n[air, sea, Ground]",
      explanation: "`reverseOrder()` sorts descending. Words sort by length first: \"air\"(3) and \"sea\"(3) tie, so natural (alphabetical) order breaks the tie, then \"Ground\"(6).",
    },
    challenge: { taskId: "ct-sort-missions" },
    mistakes: [
      { mistake: "Sorting priority ascending by accident.", fix: "Descending means `Integer.compare(b.priority(), a.priority())`." },
      { mistake: "`Comparator.comparingInt(...).thenComparingInt(...).reversed()`.", fix: "`reversed()` at the end reverses **all** keys. Call it right after the first key." },
      { mistake: "Returning only the priority comparison (no tie-breaks).", fix: "The paper requires energy then ID; the grader tests ties." },
      { mistake: "Sorting with `a - b` on large numbers.", fix: "Use `Integer.compare` / `Long.compare`." },
    ],
    quiz: ["qs-cmp-sign-1", "qs-cmp-desc-1", "qs-cmp-reversed-1", "qs-cmp-order-1", "qs-cmp-complete-1"],
    examQuestion: {
      prompt: "Missions (id, priority, energy): (7,2,30), (3,2,30), (5,5,40), (9,2,10). Give the order after sorting by priority DESC, energy ASC, ID ASC.",
      modelAnswer: "5 (p5) → 9 (p2, e10) → 3 (p2, e30, id 3) → 7 (p2, e30, id 7). Order: **[5, 9, 3, 7]**.",
    },
    summary: [
      "`compare(a,b)`: negative → a first; positive → b first; 0 → tie.",
      "Descending: swap arguments.",
      "Multi-key: compare key 1; if 0, key 2; if 0, key 3.",
      "`Integer.compare`/`Long.compare`, not subtraction.",
      "`.reversed()` reverses the entire chain so far.",
    ],
  },
  {
    id: "exceptions-validation",
    moduleId: "m04",
    title: "Exceptions, custom exceptions and input validation",
    minutes: 45,
    priority: "P0",
    skill: "exceptions",
    sources: [
      { kind: "university", label: "Lecture 6 — Throwable hierarchy, checked vs unchecked, try/catch/finally, custom exceptions" },
      { kind: "mock-paper", label: "Task 3 — MissionNotFoundException, IllegalArgumentException validation" },
    ],
    videos: [{ video: "java", chapter: 57 }],
    what: "An **exception** is an object that signals something went wrong. `throw` raises one; `try/catch` handles one. **Checked** exceptions (e.g. `IOException`) must be declared or caught; **unchecked** ones (`RuntimeException` and subclasses such as `IllegalArgumentException`) need no declaration.",
    why: "Validation code should stop invalid data at the boundary and say exactly what was wrong. In Spring, an unchecked exception travels from the service up to one global handler that turns it into an HTTP status (Lecture 6: 'one place for every error in the app').",
    when: "Task 3: throw `MissionNotFoundException` for unknown IDs; throw `IllegalArgumentException` for out-of-range values, duplicate IDs and capacity ≤ 0 — **before** saving anything.",
    analogy: "A smoke alarm (throw) does not put out the fire itself. It alerts whoever is responsible (catch / the global handler), who decides what to do.",
    compare: {
      lang: "JavaScript",
      other: `class MissionNotFound extends Error {
  constructor(id) { super("Mission not found: " + id); }
}
if (!m) throw new MissionNotFound(id);`,
      java: `public class MissionNotFoundException extends RuntimeException {
    public MissionNotFoundException(long id) {
        super("Mission not found: " + id);
    }
}
if (m == null) throw new MissionNotFoundException(id);`,
      notes: [
        "Same `throw new ...` idea. Java exceptions are classes in a hierarchy (`Throwable` → `Exception` → `RuntimeException`).",
        "`throw` (statement, raises now) vs `throws` (in a method signature, declares 'this may raise a checked exception').",
        "Custom exceptions extend `RuntimeException` so you do not need `throws` on every layer (Lecture 6: prefer unchecked in Spring).",
        "`super(message)` passes the message to the parent, available later via `getMessage()`.",
      ],
    },
    syntax: {
      code: `private void validate(NewAirMission r) {
    if (r.getId() < 1 || r.getId() > 10000) {
        throw new IllegalArgumentException("ID must be between 1 and 10000.");
    }
    if (r.getDistanceKm() < 1 || r.getDistanceKm() > 10000) {
        throw new IllegalArgumentException("distanceKm must be between 1 and 10000.");
    }
    // loadKg and windPenalty: 0..10000
}

try {
    service.plan(0, false);
} catch (IllegalArgumentException e) {
    System.out.println(e.getMessage());
} finally {
    System.out.println("always runs");
}`,
      parts: [
        { token: "x < 1 || x > 10000", meaning: "Outside an **inclusive** range 1..10000. Boundaries 1 and 10000 are valid." },
        { token: "throw new IllegalArgumentException(msg)", meaning: "Unchecked; Spring's handler maps it to 400." },
        { token: "catch (IllegalArgumentException e)", meaning: "Handles only that type (and its subclasses)." },
        { token: "finally", meaning: "Runs whether or not an exception occurred." },
      ],
    },
    example: {
      title: "Validation with boundaries",
      files: [
        {
          name: "Main.java",
          content: `import java.util.*;

public class Main {
    static Set<Long> existing = new HashSet<>(List.of(101L, 102L, 103L));

    static void validate(long id, int distanceKm, int loadKg, int windPenalty) {
        if (id < 1 || id > 10000) throw new IllegalArgumentException("ID must be between 1 and 10000.");
        if (distanceKm < 1 || distanceKm > 10000) throw new IllegalArgumentException("distanceKm must be between 1 and 10000.");
        if (loadKg < 0 || loadKg > 10000) throw new IllegalArgumentException("loadKg must be between 0 and 10000.");
        if (windPenalty < 0 || windPenalty > 10000) throw new IllegalArgumentException("windPenalty must be between 0 and 10000.");
        if (existing.contains(id)) throw new IllegalArgumentException("A mission with ID " + id + " already exists.");
    }

    static void tryIt(long id, int d, int l, int w) {
        try {
            validate(id, d, l, w);
            System.out.println(id + " OK");
        } catch (IllegalArgumentException e) {
            System.out.println(id + " rejected: " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        tryIt(104, 6, 1, 2);
        tryIt(1, 1, 0, 0);          // all lower bounds: valid
        tryIt(10000, 10000, 10000, 10000);
        tryIt(0, 5, 1, 1);
        tryIt(105, 5, -1, 1);
        tryIt(101, 5, 1, 1);
    }
}`,
        },
      ],
      expectedOutput: "104 OK\n1 OK\n10000 OK\n0 rejected: ID must be between 1 and 10000.\n105 rejected: loadKg must be between 0 and 10000.\n101 rejected: A mission with ID 101 already exists.",
    },
    body: [
      {
        heading: "The hierarchy (Lecture 6)",
        text: "`Throwable` → `Error` (JVM problems like `OutOfMemoryError` — never catch) and `Exception`. `Exception` subclasses are **checked**, except `RuntimeException` and its subclasses, which are **unchecked**. Your own exceptions extend `RuntimeException`.",
      },
      {
        heading: "Do not catch in the controller",
        text: "Lecture 6 lists 'try/catch in the controller' as a time-loser: catching there hides the exception from `GlobalExceptionHandler`, so your 400/404 mapping never runs. Throw in the service; let the handler translate.",
      },
      {
        heading: "Boundary testing",
        text: "For a range `a..b`, always test `a-1`, `a`, `b`, `b+1`. For loadKg 0..10000: -1 ✗, 0 ✓, 10000 ✓, 10001 ✗. Off-by-one (`<=` vs `<`) is the most common validation bug.",
      },
    ],
    trace: {
      code: `public class Main {
    static int check(int c) {
        if (c <= 0) throw new IllegalArgumentException("bad " + c);
        return c * 2;
    }
    public static void main(String[] args) {
        int[] inputs = {5, 0, -2};
        for (int c : inputs) {
            try {
                System.out.println(check(c));
            } catch (IllegalArgumentException e) {
                System.out.println("caught " + e.getMessage());
            } finally {
                System.out.println("done " + c);
            }
        }
    }
}`,
      output: "10\ndone 5\ncaught bad 0\ndone 0\ncaught bad -2\ndone -2",
      explanation: "5 is valid → prints 10. 0 and -2 throw; the catch prints the message. `finally` runs after every iteration either way.",
    },
    challenge: { taskId: "ct-validation" },
    mistakes: [
      { mistake: "Saving the mission, then validating.", fix: "Validate (and calculate energy) first; save last. 'Do not save an invalid mission.'" },
      { mistake: "Off-by-one: `if (loadKg <= 0)` rejects a valid 0.", fix: "Read each range carefully: distance 1..10000, load 0..10000." },
      { mistake: "Catching `Exception` and returning a default value.", fix: "Swallowing exceptions hides errors; let them propagate to the handler." },
      { mistake: "Making a custom exception extend `Exception`.", fix: "That is checked — every method must declare `throws`. Extend `RuntimeException`." },
    ],
    quiz: ["qs-checked-1", "qs-throw-throws-1", "qs-finally-1", "qs-boundary-1", "qs-custom-exc-1", "qs-validate-order-1"],
    examQuestion: {
      prompt: "Write `addAir(NewAirMission request)` for Task 3.2 using the repository API.",
      modelAnswer: "```java\npublic DispatchMission addAir(NewAirMission request) {\n    if (request == null) throw new IllegalArgumentException(\"Request body is required.\");\n    validateAirMission(request);              // the four range checks\n    if (repo.exists(request.getId())) {\n        throw new IllegalArgumentException(\"A mission with ID \" + request.getId() + \" already exists.\");\n    }\n    AirMission mission = new AirMission(request.getId(), request.getDistanceKm(),\n            request.getLoadKg(), request.getWindPenalty(), request.getCritical());\n    mission.energyUnits();                    // calculate before saving (throws on overflow)\n    repo.save(mission);\n    return mission;\n}\n```",
    },
    summary: [
      "`throw` raises now; `throws` declares (checked exceptions).",
      "Custom exceptions extend `RuntimeException`; pass the message to `super(...)`.",
      "Validate → calculate → save. Never save invalid data.",
      "Test boundaries: a-1, a, b, b+1.",
      "No try/catch in controllers; the global handler maps exceptions to HTTP.",
    ],
  },
  {
    id: "overflow-long",
    moduleId: "m04",
    title: "Integer overflow, `long` arithmetic and `Math.toIntExact`",
    minutes: 25,
    priority: "P0",
    skill: "exceptions",
    sources: [
      { kind: "mock-paper", label: "Tasks 1.1, 2.2, 3.2 — 'Use long for intermediate arithmetic and convert safely to int'" },
      { kind: "supplemental", label: "Two's-complement overflow explained" },
    ],
    what: "An `int` holds −2,147,483,648 to 2,147,483,647. If arithmetic goes beyond that, Java **silently wraps around** to a negative number — no error. `long` holds far larger values. `Math.toIntExact(long)` converts back to `int` and **throws `ArithmeticException`** if the value does not fit.",
    why: "A wrapped energy value (e.g. −2,147,483,646) would make a huge mission look tiny and get selected by the planner. The paper says: 'do not allow silent integer overflow'.",
    when: "Every `energyUnits()` implementation: compute in `long`, return `Math.toIntExact(...)`.",
    analogy: "A car odometer with 6 digits: after 999,999 km it rolls to 000,000. `int` is that odometer. `long` is a bigger odometer; `toIntExact` refuses to copy a reading that will not fit on the small one.",
    compare: {
      lang: "JavaScript",
      other: `const big = 2147483647 + 1;
console.log(big);   // 2147483648 (floating point, no wrap)`,
      java: `int big = 2147483647 + 1;
System.out.println(big);   // -2147483648  (wrapped!)`,
      notes: [
        "JS numbers are 64-bit floats, so you rarely see wrap-around. Java `int` is 32-bit two's complement.",
        "`2 * distanceKm` with both `int` is computed **in int** — even if you store the result in a `long`.",
        "Fix: make one operand `long` **before** multiplying: `2L * distanceKm`.",
      ],
    },
    syntax: {
      code: `// ✗ overflows before widening
long wrong = 2 * distanceKm + 5 * loadKg;

// ✓ each multiplication happens in long
long energy = 2L * distanceKm + 5L * loadKg;
return Math.toIntExact(energy);    // ArithmeticException if > int range`,
      parts: [
        { token: "2L", meaning: "`long` literal; `long * int` → `long`." },
        { token: "Math.toIntExact(energy)", meaning: "Safe narrowing; throws `ArithmeticException: integer overflow`." },
        { token: "(int) energy", meaning: "**Unsafe** narrowing — silently discards high bits. Avoid." },
      ],
    },
    example: {
      title: "See the wrap-around",
      files: [
        {
          name: "Main.java",
          content: `public class Main {
    public static void main(String[] args) {
        int distanceKm = 1_500_000_000;
        int loadKg = 0;

        int silent = 2 * distanceKm + 5 * loadKg;
        System.out.println("int arithmetic:  " + silent);

        long wrongLong = 2 * distanceKm + 5 * loadKg;
        System.out.println("still wrong:     " + wrongLong);

        long right = 2L * distanceKm + 5L * loadKg;
        System.out.println("long arithmetic: " + right);

        System.out.println("(int) cast:      " + (int) right);
        try {
            System.out.println(Math.toIntExact(right));
        } catch (ArithmeticException e) {
            System.out.println("toIntExact:      " + e.getMessage());
        }
        System.out.println("fits:            " + Math.toIntExact(2L * 12 + 5L * 3));
    }
}`,
        },
      ],
      expectedOutput: "int arithmetic:  -1294967296\nstill wrong:     -1294967296\nlong arithmetic: 3000000000\n(int) cast:      -1294967296\ntoIntExact:      integer overflow\nfits:            39",
      explain: "Line 2 is the classic trap: the arithmetic already overflowed in `int` before the result was widened into `long`.",
    },
    trace: {
      code: `public class Main {
    public static void main(String[] args) {
        int max = Integer.MAX_VALUE;
        System.out.println(max + 1);
        System.out.println(max + 1L);
        System.out.println((long) max * 2);
        System.out.println((long) (max * 2));
    }
}`,
      output: "-2147483648\n2147483648\n4294967294\n-2",
      explanation: "`max + 1` wraps. `max + 1L` is long arithmetic. `(long) max * 2` casts first, then multiplies in long. `(long)(max * 2)` multiplies in int first (wraps to -2), then casts.",
    },
    challenge: { taskId: "ct-safe-energy" },
    mistakes: [
      { mistake: "`long e = 2 * d + 5 * l;` and believing it is safe.", fix: "Write `2L * d + 5L * l`." },
      { mistake: "Returning `(int) energy`.", fix: "Use `Math.toIntExact(energy)` — required by the paper." },
      { mistake: "Catching the `ArithmeticException` and returning 0.", fix: "Let it propagate; returning 0 is exactly the silent failure the paper forbids." },
    ],
    quiz: ["qs-overflow-1", "qs-overflow-2", "qs-toint-1", "qs-overflow-complete-1"],
    examQuestion: {
      prompt: "Viva: 'With the input limits in Task 3.2, valid energy always fits in an int. Why does the paper still require long arithmetic?'",
      modelAnswer: "Because the model classes can be constructed directly (seed data, other code, future changes) without going through `addAir` validation. Computing in `long` and converting with `Math.toIntExact` guarantees overflow is reported as an exception instead of silently producing a wrong (possibly negative) energy that would corrupt dispatch planning.",
    },
    summary: [
      "`int` wraps silently past 2,147,483,647.",
      "`2L * x` makes the multiplication `long`.",
      "`Math.toIntExact` converts safely and throws on overflow.",
      "Never `(int)` cast an energy value.",
    ],
  },
  {
    id: "greedy-dispatch",
    moduleId: "m05",
    title: "Greedy dispatch: filter → sort → select-or-skip",
    minutes: 50,
    priority: "P0",
    skill: "algorithms",
    sources: [
      { kind: "mock-paper", label: "Task 2.3 + Section 5 illustrative calculations" },
      { kind: "university", label: "Worked solution — DispatchService.plan()" },
      { kind: "supplemental", label: "Algorithm tracing, edge cases, complexity" },
    ],
    what: "A **greedy algorithm** makes the locally best choice at each step and never revisits it. Here: take missions in ranked order and select each one that still fits the remaining capacity; skip those that do not, and **keep going**.",
    why: "It is simple, deterministic and fast (O(n log n) for the sort + O(n) for the pass). It does not guarantee the mathematically best packing — the paper does not ask for that; it asks for these exact rules.",
    when: "Task 2.3 and Section B checks B3, B4, B6.",
    analogy: "Loading an ambulance helicopter with a weight limit: take the most urgent parcels first; if a parcel is too heavy for the space left, set it aside and check the next one — a lighter one might still fit.",
    compare: {
      lang: "JavaScript",
      other: `const eligible = missions.filter(m => !urgentOnly || m.priority >= 3);
eligible.sort(cmp);
let used = 0; const selected = [], skipped = [];
for (const m of eligible) {
  if (m.energy <= capacity - used) { selected.push(m); used += m.energy; }
  else skipped.push(m.id);
}`,
      java: `List<DispatchMission> eligible = new ArrayList<>();
for (DispatchMission m : repo.all())
    if (!urgentOnly || m.priority() >= 3) eligible.add(m);
eligible.sort(cmp);
int used = 0;
for (DispatchMission m : eligible) {
    int e = m.energyUnits();
    if (e <= capacity - used) { selected.add(new PlanLine(...)); used += e; }
    else skipped.add(m.getId());
}`,
      notes: [
        "Identical algorithm; Java needs explicit types and `new ArrayList<>()`.",
        "Filter **before** sorting/selecting: filtered missions appear in neither list.",
        "No `break` — a later, smaller mission may still fit.",
      ],
    },
    syntax: {
      code: `public DispatchPlan plan(int capacity, boolean urgentOnly) {
    if (capacity <= 0) throw new IllegalArgumentException("Capacity must be greater than zero.");

    List<DispatchMission> eligible = new ArrayList<>();
    for (DispatchMission m : repo.all()) {
        if (!urgentOnly || m.priority() >= 3) eligible.add(m);     // 1. filter
    }
    eligible.sort(BY_DISPATCH_ORDER);                               // 2. sort

    List<PlanLine> selected = new ArrayList<>();
    List<Long> skipped = new ArrayList<>();
    int used = 0;
    for (DispatchMission m : eligible) {                            // 3. greedy pass
        int energy = m.energyUnits();
        if (energy <= capacity - used) {
            selected.add(new PlanLine(m.getId(), m.getClass().getSimpleName(), m.priority(), energy));
            used += energy;
        } else {
            skipped.add(m.getId());                                 // and continue
        }
    }
    return new DispatchPlan(capacity, used, capacity - used, selected, skipped);
}`,
      parts: [
        { token: "!urgentOnly || m.priority() >= 3", meaning: "Keep everything when not urgent-only; otherwise only priority ≥ 3." },
        { token: "energy <= capacity - used", meaning: "'Fits the remaining capacity' — equal counts as fitting (B6 ends at exactly 0)." },
        { token: "m.getClass().getSimpleName()", meaning: "Fills PlanLine.type without any instanceof check." },
      ],
    },
    example: {
      title: "The paper's examples, traced",
      files: [
        {
          name: "Main.java",
          content: `import java.util.*;

public class Main {
    record M(long id, int priority, int energy) {}   // records only for this demo; the paper forbids them in your project

    static void plan(List<M> all, int capacity, boolean urgentOnly) {
        List<M> eligible = new ArrayList<>();
        for (M m : all) if (!urgentOnly || m.priority() >= 3) eligible.add(m);
        eligible.sort((a, b) -> {
            int r = Integer.compare(b.priority(), a.priority());
            if (r != 0) return r;
            r = Integer.compare(a.energy(), b.energy());
            return r != 0 ? r : Long.compare(a.id(), b.id());
        });
        List<Long> selected = new ArrayList<>(), skipped = new ArrayList<>();
        int used = 0;
        for (M m : eligible) {
            if (m.energy() <= capacity - used) { selected.add(m.id()); used += m.energy(); }
            else skipped.add(m.id());
        }
        System.out.println("capacity=" + capacity + " urgentOnly=" + urgentOnly + " -> selected=" + selected
                + " skipped=" + skipped + " used=" + used + " remaining=" + (capacity - used));
    }

    public static void main(String[] args) {
        List<M> seed = new ArrayList<>(List.of(new M(101, 3, 39), new M(102, 1, 18), new M(103, 5, 38)));
        plan(seed, 60, false);
        plan(seed, 60, true);
        seed.add(new M(104, 2, 30));
        plan(seed, 125, false);
    }
}`,
        },
      ],
      expectedOutput: "capacity=60 urgentOnly=false -> selected=[103, 102] skipped=[101] used=56 remaining=4\ncapacity=60 urgentOnly=true -> selected=[103] skipped=[101] used=38 remaining=22\ncapacity=125 urgentOnly=false -> selected=[103, 101, 104, 102] skipped=[] used=125 remaining=0",
      explain: "These three lines are exactly Section B checks B3, B4 and B6. (A `record` keeps the demo short; the practice paper requires ordinary classes in your project.)",
    },
    visual: { id: "greedy", caption: "Change missions/capacity, toggle urgent-only, and predict each decision before it happens." },
    body: [
      {
        heading: "Reading a specification into steps",
        text: "Underline every verb and condition in the task: *filter* (urgentOnly → priority ≥ 3), *sort* (3 keys), *traverse the complete list*, *select if it fits*, *otherwise skip and continue*, *filtered missions appear in neither list*. Each phrase becomes one line of code — and one test.",
      },
      {
        heading: "Edge cases to check",
        text: "- Capacity ≤ 0 → `IllegalArgumentException` (Task 3.3).\n- Energy exactly equal to remaining → **fits**.\n- No eligible missions → empty lists, used 0, remaining = capacity.\n- All missions too big → everything in `skipped`.\n- Ties on priority and energy → ID ascending.",
      },
      {
        heading: "Complexity",
        text: "Filtering O(n), sorting O(n log n), one pass O(n). Overall **O(n log n)**. Fine for any realistic number of missions.",
      },
    ],
    trace: {
      code: `public class Main {
    public static void main(String[] args) {
        int[] ranked = {38, 39, 30, 18};   // already sorted energies
        int capacity = 70, used = 0;
        StringBuilder log = new StringBuilder();
        for (int e : ranked) {
            if (e <= capacity - used) { used += e; log.append("S").append(e).append(' '); }
            else log.append("K").append(e).append(' ');
        }
        System.out.println(log.toString().trim());
        System.out.println(used + " " + (capacity - used));
    }
}`,
      output: "S38 K39 S30 K18\n68 2",
      explanation: "70: take 38 (32 left). 39 > 32 → skip. 30 ≤ 32 → take (2 left). 18 > 2 → skip. Used 68, remaining 2.",
    },
    challenge: { taskId: "ct-greedy-plan" },
    mistakes: [
      { mistake: "`break` on the first mission that does not fit.", fix: "Use the `else` branch to record the skip and continue. (Grader test: break-after-skip fails B3.)" },
      { mistake: "Putting filtered (non-urgent) missions in `skipped`.", fix: "Filter first; skipped only contains eligible missions that did not fit." },
      { mistake: "Using `<` instead of `<=` for 'fits'.", fix: "B6 relies on 125 being used exactly: equality fits." },
      { mistake: "Recomputing `capacity - used` incorrectly or forgetting to update `used`.", fix: "Update `used += energy` immediately after selecting." },
    ],
    quiz: ["qs-greedy-1", "qs-greedy-2", "qs-greedy-3", "qs-greedy-order-1", "qs-greedy-filter-1"],
    examQuestion: {
      prompt: "With seed missions 101 (p3,e39), 102 (p1,e18), 103 (p5,e38) and capacity 40, urgentOnly=false: what are selected, skipped, used and remaining?",
      modelAnswer: "Order [103, 101, 102]. 103 (38) fits → remaining 2. 101 (39) does not fit → skipped. 102 (18) does not fit → skipped. **selected [103], skipped [101, 102], used 38, remaining 2.**",
    },
    summary: [
      "Filter → sort (priority DESC, energy ASC, id ASC) → one greedy pass.",
      "Fits means `energy <= capacity - used`.",
      "Skip and continue — never break.",
      "Filtered missions appear nowhere.",
      "Polymorphic calls only: `priority()`, `energyUnits()`.",
    ],
  },
];
