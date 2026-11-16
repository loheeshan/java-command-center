import type { CodingTask } from "@/lib/curriculum/types";

const DISPATCH_MISSION = `public abstract class DispatchMission {
    private final long id;
    private final int distanceKm;
    private final int loadKg;

    protected DispatchMission(long id, int distanceKm, int loadKg) {
        this.id = id;
        this.distanceKm = distanceKm;
        this.loadKg = loadKg;
    }

    public long getId() { return id; }
    public int getDistanceKm() { return distanceKm; }
    public int getLoadKg() { return loadKg; }

    public abstract int energyUnits();
    public abstract int priority();
}
`;

const GROUND_SOLVED = `public class GroundMission extends DispatchMission {
    private final boolean medical;

    public GroundMission(long id, int distanceKm, int loadKg, boolean medical) {
        super(id, distanceKm, loadKg);
        this.medical = medical;
    }

    public boolean isMedical() { return medical; }

    @Override
    public int energyUnits() {
        return Math.toIntExact(2L * getDistanceKm() + 5L * getLoadKg());
    }

    @Override
    public int priority() { return medical ? 3 : 1; }
}
`;

const AIR_SOLVED = `public class AirMission extends DispatchMission {
    private final int windPenalty;
    private final boolean critical;

    public AirMission(long id, int distanceKm, int loadKg, int windPenalty, boolean critical) {
        super(id, distanceKm, loadKg);
        this.windPenalty = windPenalty;
        this.critical = critical;
    }

    public int getWindPenalty() { return windPenalty; }
    public boolean isCritical() { return critical; }

    @Override
    public int energyUnits() {
        return Math.toIntExact(3L * getDistanceKm() + 8L * getLoadKg() + 2L * windPenalty);
    }

    @Override
    public int priority() { return critical ? 5 : 2; }
}
`;

/** A mission type unknown to the learner — catches instanceof shortcuts. */
const FIXED_MISSION = `class FixedMission extends DispatchMission {
    private final int e, p;
    FixedMission(long id, int e, int p) { super(id, 1, 0); this.e = e; this.p = p; }
    @Override public int energyUnits() { return e; }
    @Override public int priority() { return p; }
}`;

export const CODING_TASKS: CodingTask[] = [
  {
    id: "ct-energy-basics",
    lessonId: "java-quickstart",
    title: "Energy helpers",
    skill: "fundamentals",
    difficulty: "easy",
    prompt:
      "Complete the static methods in `Energy`:\n- `groundEnergy(distanceKm, loadKg)` returns `2 × distanceKm + 5 × loadKg`.\n- `fits(energy, remaining)` returns `true` when the energy fits in the remaining capacity (equal counts as fitting).\n- `countFitting(int[] energies, int capacity)` returns how many values are `<= capacity`.",
    files: [
      {
        name: "Energy.java",
        content: `public class Energy {
    public static int groundEnergy(int distanceKm, int loadKg) {
        // TODO
        return 0;
    }

    public static boolean fits(int energy, int remaining) {
        // TODO
        return false;
    }

    public static int countFitting(int[] energies, int capacity) {
        // TODO
        return 0;
    }
}
`,
      },
    ],
    tests: `
test("groundEnergy(12, 3) == 39", () -> eq(39, Energy.groundEnergy(12, 3)));
test("groundEnergy(4, 2) == 18", () -> eq(18, Energy.groundEnergy(4, 2)));
test("groundEnergy(1, 0) == 2", () -> eq(2, Energy.groundEnergy(1, 0)));
test("fits when smaller", () -> eq(true, Energy.fits(38, 60)));
test("fits when equal", () -> eq(true, Energy.fits(22, 22)));
test("does not fit when larger", () -> eq(false, Energy.fits(39, 22)));
test("countFitting", () -> eq(2, Energy.countFitting(new int[]{38, 39, 18}, 38)));
test("countFitting empty", () -> eq(0, Energy.countFitting(new int[]{}, 10)));`,
    hints: ["`return 2 * distanceKm + 5 * loadKg;`", "'Fits' means `energy <= remaining`.", "Loop with `for (int e : energies)` and increment a counter."],
    solution: [
      {
        name: "Energy.java",
        content: `public class Energy {
    public static int groundEnergy(int distanceKm, int loadKg) {
        return 2 * distanceKm + 5 * loadKg;
    }

    public static boolean fits(int energy, int remaining) {
        return energy <= remaining;
    }

    public static int countFitting(int[] energies, int capacity) {
        int count = 0;
        for (int e : energies) {
            if (e <= capacity) count++;
        }
        return count;
    }
}
`,
      },
    ],
  },
  {
    id: "ct-priority-switch",
    lessonId: "java-syntax-bridge",
    title: "Priority rules with switch",
    skill: "fundamentals",
    difficulty: "easy",
    prompt:
      "Implement `Priority.of(String type, boolean flag)`:\n- `\"ground\"`: flag means *medical* → 3, else 1.\n- `\"air\"`: flag means *critical* → 5, else 2.\n- any other type → throw `IllegalArgumentException`.\nCompare Strings correctly!",
    files: [
      {
        name: "Priority.java",
        content: `public class Priority {
    public static int of(String type, boolean flag) {
        // TODO
        return 0;
    }
}
`,
      },
    ],
    tests: `
test("ground medical -> 3", () -> eq(3, Priority.of("ground", true)));
test("ground routine -> 1", () -> eq(1, Priority.of("ground", false)));
test("air critical -> 5", () -> eq(5, Priority.of("air", true)));
test("air routine -> 2", () -> eq(2, Priority.of("air", false)));
test("works with a non-literal String", () -> eq(5, Priority.of(new String("air"), true)));
test("unknown type throws", () -> expectThrows(IllegalArgumentException.class, () -> Priority.of("sea", true)));`,
    hints: ["`switch (type) { case \"ground\" -> ...; case \"air\" -> ...; default -> throw new IllegalArgumentException(...); }`", "`==` on Strings compares references; `switch` and `.equals()` compare text."],
    solution: [
      {
        name: "Priority.java",
        content: `public class Priority {
    public static int of(String type, boolean flag) {
        switch (type) {
            case "ground": return flag ? 3 : 1;
            case "air": return flag ? 5 : 2;
            default: throw new IllegalArgumentException("Unknown type: " + type);
        }
    }
}
`,
      },
    ],
  },
  {
    id: "ct-circle",
    lessonId: "classes-objects",
    title: "The Week 01 Circle class",
    skill: "oop",
    difficulty: "easy",
    prompt:
      "Write the `Circle` class from the Week 01 learning guide:\n- private `double radius`\n- constructor `Circle(double radius)` that uses `setRadius`\n- `getRadius()`, `getArea()` (π r²), `getCircumference()` (2 π r)\n- `setRadius(double)` throws `IllegalArgumentException(\"Invalid Radius!\")` when radius ≤ 0 and leaves the old value unchanged.",
    files: [
      {
        name: "Circle.java",
        content: `public class Circle {
    // TODO: field, constructor, getters, setter with validation
}
`,
      },
    ],
    tests: `
test("constructor stores radius", () -> eq(5.0, new Circle(5).getRadius()));
test("area", () -> eq(true, Math.abs(new Circle(2).getArea() - Math.PI * 4) < 1e-9));
test("circumference", () -> eq(true, Math.abs(new Circle(2).getCircumference() - Math.PI * 4) < 1e-9));
test("objects are independent", () -> { Circle a = new Circle(1); Circle b = new Circle(3); eq(1.0, a.getRadius()); eq(3.0, b.getRadius()); });
test("setRadius rejects 0", () -> expectThrows(IllegalArgumentException.class, () -> new Circle(1).setRadius(0)));
test("setRadius rejects negative and keeps old value", () -> { Circle c = new Circle(4); try { c.setRadius(-1); } catch (IllegalArgumentException e) { } eq(4.0, c.getRadius()); });
test("constructor rejects invalid radius", () -> expectThrows(IllegalArgumentException.class, () -> new Circle(-2)));
test("radius field is private", () -> eq(true, java.lang.reflect.Modifier.isPrivate(Circle.class.getDeclaredField("radius").getModifiers())));`,
    hints: ["Field: `private double radius;`", "Constructor body: `setRadius(radius);`", "Validate first: `if (radius <= 0) throw new IllegalArgumentException(\"Invalid Radius!\");` then `this.radius = radius;`"],
    solution: [
      {
        name: "Circle.java",
        content: `public class Circle {
    private double radius;

    public Circle(double radius) {
        setRadius(radius);
    }

    public double getRadius() { return radius; }

    public void setRadius(double radius) {
        if (radius <= 0) {
            throw new IllegalArgumentException("Invalid Radius!");
        }
        this.radius = radius;
    }

    public double getArea() { return Math.PI * radius * radius; }

    public double getCircumference() { return 2 * Math.PI * radius; }
}
`,
      },
    ],
  },
  {
    id: "ct-product",
    lessonId: "constructors-encapsulation",
    title: "Encapsulated Product (Lecture 2 style)",
    skill: "oop",
    difficulty: "easy",
    prompt:
      "Create `Product` with private fields `Long id`, `String name`, `double price`:\n- a **no-arg** constructor (needed by JSON) and a full constructor `(Long id, String name, double price)`\n- getters and setters for all three\n- `setPrice` throws `IllegalArgumentException` for a negative price (0 is allowed); the full constructor must also reject a negative price.",
    files: [
      {
        name: "Product.java",
        content: `public class Product {
    // TODO
}
`,
      },
    ],
    tests: `
test("no-arg constructor exists", () -> eq(true, Product.class.getConstructor() != null));
test("full constructor + getters", () -> { Product p = new Product(1L, "Pen", 2.5); eq(1L, p.getId()); eq("Pen", p.getName()); eq(2.5, p.getPrice()); });
test("setters", () -> { Product p = new Product(); p.setId(7L); p.setName("Ink"); p.setPrice(0); eq(7L, p.getId()); eq("Ink", p.getName()); eq(0.0, p.getPrice()); });
test("negative price rejected by setter", () -> expectThrows(IllegalArgumentException.class, () -> new Product().setPrice(-1)));
test("negative price rejected by constructor", () -> expectThrows(IllegalArgumentException.class, () -> new Product(2L, "X", -0.01)));
test("fields are private", () -> { for (java.lang.reflect.Field f : Product.class.getDeclaredFields()) eq(true, java.lang.reflect.Modifier.isPrivate(f.getModifiers())); });`,
    hints: ["Writing the full constructor removes the implicit no-arg one — add `public Product() {}` yourself.", "Call `setPrice(price)` from the constructor to reuse validation."],
    solution: [
      {
        name: "Product.java",
        content: `public class Product {
    private Long id;
    private String name;
    private double price;

    public Product() {}

    public Product(Long id, String name, double price) {
        this.id = id;
        this.name = name;
        setPrice(price);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public double getPrice() { return price; }

    public void setPrice(double price) {
        if (price < 0) throw new IllegalArgumentException("Price cannot be negative");
        this.price = price;
    }
}
`,
      },
    ],
  },
  {
    id: "ct-digital-product",
    lessonId: "inheritance-super",
    title: "DigitalProduct extends Product (real-paper shape)",
    skill: "oop",
    difficulty: "medium",
    prompt:
      "This mirrors Tutorials 4–5 and the 'complete a subclass' task shape from the Lecture 6 briefing.\n\n`Product` is supplied (read-only, abstract, with `getSummary()`). Create `DigitalProduct extends Product` with:\n- fields `String downloadUrl` and `double fileSizeMB`\n- a no-arg constructor and a full constructor `(Long id, String name, double price, String downloadUrl, double fileSizeMB)` that calls `super(id, name, price)`\n- getters for the two new fields\n- `getSummary()` override returning exactly `\"Digital: <name> (<fileSizeMB> MB)\"`, e.g. `Digital: Java eBook (12.5 MB)`.",
    files: [
      {
        name: "Product.java",
        readOnly: true,
        content: `public abstract class Product {
    private Long id;
    private String name;
    private double price;

    public Product() {}

    public Product(Long id, String name, double price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public double getPrice() { return price; }

    public abstract String getSummary();
}
`,
      },
      {
        name: "DigitalProduct.java",
        content: `public class DigitalProduct extends Product {
    // TODO
}
`,
      },
    ],
    tests: `
test("extends Product", () -> eq(Product.class, DigitalProduct.class.getSuperclass()));
test("full constructor passes id/name/price to super", () -> { DigitalProduct d = new DigitalProduct(3L, "Java eBook", 9.99, "http://x/y.pdf", 12.5); eq(3L, d.getId()); eq("Java eBook", d.getName()); eq(9.99, d.getPrice()); });
test("own fields + getters", () -> { DigitalProduct d = new DigitalProduct(3L, "A", 1, "url", 2.0); eq("url", d.getDownloadUrl()); eq(2.0, d.getFileSizeMB()); });
test("no-arg constructor", () -> eq(true, DigitalProduct.class.getConstructor() != null));
test("getSummary override", () -> eq("Digital: Java eBook (12.5 MB)", new DigitalProduct(3L, "Java eBook", 9.99, "u", 12.5).getSummary()));
test("polymorphic call through Product", () -> { Product p = new DigitalProduct(1L, "Course", 5, "u", 300.0); eq("Digital: Course (300.0 MB)", p.getSummary()); });
test("does not duplicate parent fields", () -> { for (java.lang.reflect.Field f : DigitalProduct.class.getDeclaredFields()) eq(false, java.util.List.of("id", "name", "price").contains(f.getName())); });`,
    hints: ["`super(id, name, price);` must be the first line of the full constructor.", "Use `getName()` in `getSummary()` — `name` is private in Product.", "`return \"Digital: \" + getName() + \" (\" + fileSizeMB + \" MB)\";`"],
    solution: [
      {
        name: "DigitalProduct.java",
        content: `public class DigitalProduct extends Product {
    private String downloadUrl;
    private double fileSizeMB;

    public DigitalProduct() {}

    public DigitalProduct(Long id, String name, double price, String downloadUrl, double fileSizeMB) {
        super(id, name, price);
        this.downloadUrl = downloadUrl;
        this.fileSizeMB = fileSizeMB;
    }

    public String getDownloadUrl() { return downloadUrl; }
    public double getFileSizeMB() { return fileSizeMB; }

    @Override
    public String getSummary() {
        return "Digital: " + getName() + " (" + fileSizeMB + " MB)";
    }
}
`,
      },
    ],
  },
  {
    id: "ct-ground-mission",
    lessonId: "abstract-overriding",
    title: "Task 1 drill: GroundMission",
    skill: "oop",
    difficulty: "medium",
    prompt:
      "Exactly the practice paper's Task 1. Complete `energyUnits()` (2 × distanceKm + 5 × loadKg using `long` and safe `int` conversion — overflow must throw `ArithmeticException`) and `priority()` (medical 3, otherwise 1).",
    files: [
      { name: "DispatchMission.java", readOnly: true, content: DISPATCH_MISSION },
      {
        name: "GroundMission.java",
        content: `public class GroundMission extends DispatchMission {
    private final boolean medical;

    public GroundMission(long id, int distanceKm, int loadKg, boolean medical) {
        super(id, distanceKm, loadKg);
        this.medical = medical;
    }

    public boolean isMedical() { return medical; }

    @Override
    public int energyUnits() {
        // TODO Task 1: energy = 2*distanceKm + 5*loadKg; avoid integer overflow.
        throw new UnsupportedOperationException("Task 1");
    }

    @Override
    public int priority() {
        // TODO Task 1: medical=3, otherwise=1.
        throw new UnsupportedOperationException("Task 1");
    }
}
`,
      },
    ],
    tests: `
test("101 energy = 39", () -> eq(39, new GroundMission(101, 12, 3, true).energyUnits()));
test("102 energy = 18", () -> eq(18, new GroundMission(102, 4, 2, false).energyUnits()));
test("large but valid", () -> eq(2_000_000_000, new GroundMission(9, 1_000_000_000, 0, false).energyUnits()));
test("overflow throws ArithmeticException", () -> expectThrows(ArithmeticException.class, () -> new GroundMission(1, Integer.MAX_VALUE, 0, false).energyUnits()));
test("medical -> 3", () -> eq(3, new GroundMission(1, 1, 1, true).priority()));
test("routine -> 1", () -> eq(1, new GroundMission(1, 1, 1, false).priority()));`,
    hints: ["Delete the `throw new UnsupportedOperationException` lines.", "`long energy = 2L * getDistanceKm() + 5L * getLoadKg();`", "`return Math.toIntExact(energy);`"],
    solution: [{ name: "GroundMission.java", content: GROUND_SOLVED }],
  },
  {
    id: "ct-air-mission",
    lessonId: "polymorphism",
    title: "Task 2.1–2.2 drill: create AirMission + polymorphic total",
    skill: "oop",
    difficulty: "medium",
    prompt:
      "Create `AirMission extends DispatchMission` (fields `windPenalty`, `critical`; constructor `(long id, int distanceKm, int loadKg, int windPenalty, boolean critical)` using `super(...)`; getters `getWindPenalty()` and `isCritical()`). Energy = 3 × distance + 8 × load + 2 × wind (long + `Math.toIntExact`). Priority = 5 if critical else 2.\n\nThen complete `Fleet.totalEnergy(List<DispatchMission>)` **without any instanceof**.",
    files: [
      { name: "DispatchMission.java", readOnly: true, content: DISPATCH_MISSION },
      { name: "GroundMission.java", readOnly: true, content: GROUND_SOLVED },
      {
        name: "AirMission.java",
        content: `public class AirMission extends DispatchMission {
    // TODO
}
`,
      },
      {
        name: "Fleet.java",
        content: `import java.util.List;

public class Fleet {
    public static int totalEnergy(List<DispatchMission> missions) {
        // TODO: sum energyUnits() of every mission (no instanceof!)
        return 0;
    }
}
`,
      },
    ],
    tests: `
${"/*FIXED*/"}
test("103 energy = 38", () -> eq(38, new AirMission(103, 8, 1, 3, true).energyUnits()));
test("104 energy = 30", () -> eq(30, new AirMission(104, 6, 1, 2, false).energyUnits()));
test("priority critical 5 / else 2", () -> { eq(5, new AirMission(1, 1, 1, 1, true).priority()); eq(2, new AirMission(1, 1, 1, 1, false).priority()); });
test("super(...) sets inherited fields", () -> { AirMission a = new AirMission(103, 8, 1, 3, true); eq(103L, a.getId()); eq(8, a.getDistanceKm()); eq(1, a.getLoadKg()); });
test("getters", () -> { AirMission a = new AirMission(103, 8, 1, 3, true); eq(3, a.getWindPenalty()); eq(true, a.isCritical()); });
test("overflow throws", () -> expectThrows(ArithmeticException.class, () -> new AirMission(1, Integer.MAX_VALUE, 1, 1, false).energyUnits()));
test("totalEnergy of seed = 95", () -> eq(95, Fleet.totalEnergy(java.util.List.of(new GroundMission(101, 12, 3, true), new GroundMission(102, 4, 2, false), new AirMission(103, 8, 1, 3, true)))));
test("totalEnergy works for an unseen subclass", () -> eq(12, Fleet.totalEnergy(java.util.List.of(new FixedMission(1, 5, 1), new FixedMission(2, 7, 4)))));`,
    hints: ["Copy the GroundMission structure: fields, constructor with `super(id, distanceKm, loadKg)`, then two `@Override` methods.", "`long e = 3L * getDistanceKm() + 8L * getLoadKg() + 2L * windPenalty;`", "In Fleet: `for (DispatchMission m : missions) total += m.energyUnits();`"],
    solution: [
      { name: "AirMission.java", content: AIR_SOLVED },
      {
        name: "Fleet.java",
        content: `import java.util.List;

public class Fleet {
    public static int totalEnergy(List<DispatchMission> missions) {
        int total = 0;
        for (DispatchMission m : missions) {
            total += m.energyUnits();
        }
        return total;
    }
}
`,
      },
    ],
  },
  {
    id: "ct-repository-lookup",
    lessonId: "collections-generics",
    title: "Map-backed lookup with not-found exception",
    skill: "collections",
    difficulty: "easy",
    prompt:
      "Complete `MissionStore`:\n- `save(long id, String name)` stores the name; it must throw `IllegalArgumentException` if the id already exists (no overwrite).\n- `find(long id)` returns the name or throws `MissionNotFoundException` (supplied) when missing.\n- `ids()` returns all ids **sorted ascending** as a new `List<Long>`.",
    files: [
      {
        name: "MissionNotFoundException.java",
        readOnly: true,
        content: `public class MissionNotFoundException extends RuntimeException {
    public MissionNotFoundException(long id) { super("Mission not found: " + id); }
}
`,
      },
      {
        name: "MissionStore.java",
        content: `import java.util.*;

public class MissionStore {
    private final Map<Long, String> map = new HashMap<>();

    public void save(long id, String name) {
        // TODO
    }

    public String find(long id) {
        // TODO
        return null;
    }

    public List<Long> ids() {
        // TODO
        return null;
    }
}
`,
      },
    ],
    tests: `
test("save + find", () -> { MissionStore s = new MissionStore(); s.save(101, "Ground"); eq("Ground", s.find(101)); });
test("unknown id throws MissionNotFoundException", () -> expectThrows(MissionNotFoundException.class, () -> new MissionStore().find(999)));
test("duplicate rejected, original kept", () -> { MissionStore s = new MissionStore(); s.save(1, "A"); expectThrows(IllegalArgumentException.class, () -> s.save(1, "B")); eq("A", s.find(1)); });
test("ids sorted", () -> { MissionStore s = new MissionStore(); s.save(103, "a"); s.save(101, "b"); s.save(102, "c"); eq(java.util.List.of(101L, 102L, 103L), s.ids()); });
test("ids is a modifiable copy", () -> { MissionStore s = new MissionStore(); s.save(5, "x"); List<Long> l = s.ids(); l.add(6L); eq(java.util.List.of(5L), s.ids()); });`,
    hints: ["`if (map.containsKey(id)) throw new IllegalArgumentException(...)`", "`String n = map.get(id); if (n == null) throw new MissionNotFoundException(id);`", "`List<Long> out = new ArrayList<>(map.keySet()); Collections.sort(out); return out;`"],
    solution: [
      {
        name: "MissionStore.java",
        content: `import java.util.*;

public class MissionStore {
    private final Map<Long, String> map = new HashMap<>();

    public void save(long id, String name) {
        if (map.containsKey(id)) throw new IllegalArgumentException("Duplicate id " + id);
        map.put(id, name);
    }

    public String find(long id) {
        String name = map.get(id);
        if (name == null) throw new MissionNotFoundException(id);
        return name;
    }

    public List<Long> ids() {
        List<Long> out = new ArrayList<>(map.keySet());
        Collections.sort(out);
        return out;
    }
}
`,
      },
    ],
  },
  {
    id: "ct-sort-missions",
    lessonId: "comparator-sorting",
    title: "Sort missions for dispatch",
    skill: "collections",
    difficulty: "medium",
    prompt: "Implement `Sorter.sortForDispatch(List<DispatchMission>)` to sort **in place** by priority DESC, then energy ASC, then id ASC. Use only `priority()`, `energyUnits()` and `getId()`.",
    files: [
      { name: "DispatchMission.java", readOnly: true, content: DISPATCH_MISSION },
      {
        name: "Sorter.java",
        content: `import java.util.*;

public class Sorter {
    public static void sortForDispatch(List<DispatchMission> missions) {
        // TODO
    }
}
`,
      },
    ],
    tests: `
${"/*FIXED*/"}
test("priority descending", () -> { List<DispatchMission> l = new ArrayList<>(List.of(new FixedMission(1, 10, 1), new FixedMission(2, 10, 5), new FixedMission(3, 10, 3))); Sorter.sortForDispatch(l); eq(List.of(2L, 3L, 1L), ids(l)); });
test("energy ascending on equal priority", () -> { List<DispatchMission> l = new ArrayList<>(List.of(new FixedMission(1, 30, 2), new FixedMission(2, 10, 2), new FixedMission(3, 20, 2))); Sorter.sortForDispatch(l); eq(List.of(2L, 3L, 1L), ids(l)); });
test("id ascending on full tie", () -> { List<DispatchMission> l = new ArrayList<>(List.of(new FixedMission(9, 30, 2), new FixedMission(4, 30, 2), new FixedMission(7, 30, 2))); Sorter.sortForDispatch(l); eq(List.of(4L, 7L, 9L), ids(l)); });
test("paper seed order [103, 101, 102]", () -> { List<DispatchMission> l = new ArrayList<>(List.of(new FixedMission(101, 39, 3), new FixedMission(102, 18, 1), new FixedMission(103, 38, 5))); Sorter.sortForDispatch(l); eq(List.of(103L, 101L, 102L), ids(l)); });
test("mixed keys", () -> { List<DispatchMission> l = new ArrayList<>(List.of(new FixedMission(7, 30, 2), new FixedMission(3, 30, 2), new FixedMission(5, 40, 5), new FixedMission(9, 10, 2))); Sorter.sortForDispatch(l); eq(List.of(5L, 9L, 3L, 7L), ids(l)); });`,
    hints: ["`missions.sort((a, b) -> { ... })` or `Collections.sort(missions, new Comparator<DispatchMission>() { ... })`.", "Descending priority: `Integer.compare(b.priority(), a.priority())`.", "If the result is 0, compare energy, then `Long.compare(a.getId(), b.getId())`."],
    solution: [
      {
        name: "Sorter.java",
        content: `import java.util.*;

public class Sorter {
    public static void sortForDispatch(List<DispatchMission> missions) {
        missions.sort((a, b) -> {
            int r = Integer.compare(b.priority(), a.priority());
            if (r != 0) return r;
            r = Integer.compare(a.energyUnits(), b.energyUnits());
            if (r != 0) return r;
            return Long.compare(a.getId(), b.getId());
        });
    }
}
`,
      },
    ],
  },
  {
    id: "ct-greedy-plan",
    lessonId: "greedy-dispatch",
    title: "Task 2.3 drill: the greedy planner",
    skill: "algorithms",
    difficulty: "hard",
    prompt:
      "Implement `Planner.plan(List<DispatchMission> all, int capacity, boolean urgentOnly)` returning a `Plan` (supplied):\n1. capacity ≤ 0 → `IllegalArgumentException`\n2. when `urgentOnly`, keep only priority ≥ 3 (filtered missions appear in neither list)\n3. sort priority DESC, energy ASC, id ASC\n4. traverse **all**: select if `energy <= remaining`, else add the id to skipped and continue\n5. fill `selectedIds`, `skippedIds`, `energyUsed`, `energyRemaining`.\nDo not modify the input list. No instanceof.",
    files: [
      { name: "DispatchMission.java", readOnly: true, content: DISPATCH_MISSION },
      {
        name: "Plan.java",
        readOnly: true,
        content: `import java.util.*;

public class Plan {
    public final List<Long> selectedIds = new ArrayList<>();
    public final List<Long> skippedIds = new ArrayList<>();
    public int energyUsed;
    public int energyRemaining;
}
`,
      },
      {
        name: "Planner.java",
        content: `import java.util.*;

public class Planner {
    public static Plan plan(List<DispatchMission> all, int capacity, boolean urgentOnly) {
        Plan plan = new Plan();
        // TODO
        return plan;
    }
}
`,
      },
    ],
    tests: `
${"/*FIXED*/"}
List<DispatchMission> seed = List.of(new FixedMission(101, 39, 3), new FixedMission(102, 18, 1), new FixedMission(103, 38, 5));
test("capacity 60 -> [103, 102] skip [101]", () -> { Plan p = Planner.plan(seed, 60, false); eq(List.of(103L, 102L), p.selectedIds); eq(List.of(101L), p.skippedIds); eq(56, p.energyUsed); eq(4, p.energyRemaining); });
test("urgentOnly -> [103] skip [101]", () -> { Plan p = Planner.plan(seed, 60, true); eq(List.of(103L), p.selectedIds); eq(List.of(101L), p.skippedIds); });
test("capacity 125 with 104 -> exact fit", () -> { List<DispatchMission> l = new ArrayList<>(seed); l.add(new FixedMission(104, 30, 2)); Plan p = Planner.plan(l, 125, false); eq(List.of(103L, 101L, 104L, 102L), p.selectedIds); eq(125, p.energyUsed); eq(0, p.energyRemaining); });
test("continues after a skip", () -> { Plan p = Planner.plan(List.of(new FixedMission(1, 50, 5), new FixedMission(2, 60, 4), new FixedMission(3, 5, 1)), 56, false); eq(List.of(1L, 3L), p.selectedIds); eq(List.of(2L), p.skippedIds); });
test("capacity 0 rejected", () -> expectThrows(IllegalArgumentException.class, () -> Planner.plan(seed, 0, false)));
test("input list not modified", () -> { List<DispatchMission> l = new ArrayList<>(seed); Planner.plan(l, 60, false); eq(List.of(101L, 102L, 103L), ids(l)); });
test("random scenarios match the rules", () -> {
    java.util.Random r = new java.util.Random(7);
    for (int round = 0; round < 40; round++) {
        List<DispatchMission> l = new ArrayList<>();
        int n = 1 + r.nextInt(7);
        for (int i = 0; i < n; i++) l.add(new FixedMission(i * 3 + r.nextInt(3), 1 + r.nextInt(30), 1 + r.nextInt(5)));
        int cap = 1 + r.nextInt(80); boolean urgent = r.nextBoolean();
        List<DispatchMission> el = new ArrayList<>();
        for (DispatchMission m : l) if (!urgent || m.priority() >= 3) el.add(m);
        el.sort(Comparator.comparingInt(DispatchMission::priority).reversed().thenComparingInt(DispatchMission::energyUnits).thenComparingLong(DispatchMission::getId));
        List<Long> sel = new ArrayList<>(), sk = new ArrayList<>(); int used = 0;
        for (DispatchMission m : el) { if (m.energyUnits() <= cap - used) { sel.add(m.getId()); used += m.energyUnits(); } else sk.add(m.getId()); }
        Plan p = Planner.plan(l, cap, urgent);
        eq(sel, p.selectedIds); eq(sk, p.skippedIds); eq(used, p.energyUsed); eq(cap - used, p.energyRemaining);
    }
});`,
    hints: ["Copy first: `List<DispatchMission> eligible = new ArrayList<>();` and add only missions that pass the filter.", "Sort `eligible` with a three-key comparator.", "Keep `int used = 0;` and test `m.energyUnits() <= capacity - used`. In the else branch add to skipped — no break."],
    solution: [
      {
        name: "Planner.java",
        content: `import java.util.*;

public class Planner {
    public static Plan plan(List<DispatchMission> all, int capacity, boolean urgentOnly) {
        if (capacity <= 0) throw new IllegalArgumentException("Capacity must be greater than zero.");
        Plan plan = new Plan();
        List<DispatchMission> eligible = new ArrayList<>();
        for (DispatchMission m : all) {
            if (!urgentOnly || m.priority() >= 3) eligible.add(m);
        }
        eligible.sort((a, b) -> {
            int r = Integer.compare(b.priority(), a.priority());
            if (r != 0) return r;
            r = Integer.compare(a.energyUnits(), b.energyUnits());
            if (r != 0) return r;
            return Long.compare(a.getId(), b.getId());
        });
        int used = 0;
        for (DispatchMission m : eligible) {
            int e = m.energyUnits();
            if (e <= capacity - used) {
                plan.selectedIds.add(m.getId());
                used += e;
            } else {
                plan.skippedIds.add(m.getId());
            }
        }
        plan.energyUsed = used;
        plan.energyRemaining = capacity - used;
        return plan;
    }
}
`,
      },
    ],
  },
  {
    id: "ct-validation",
    lessonId: "exceptions-validation",
    title: "Task 3.2 drill: validate a new air mission",
    skill: "exceptions",
    difficulty: "medium",
    prompt:
      "Implement `Validator.validate(long id, int distanceKm, int loadKg, int windPenalty, Set<Long> existingIds)`:\n- id 1–10000, distanceKm 1–10000, loadKg 0–10000, windPenalty 0–10000 (all inclusive)\n- reject ids already in `existingIds`\n- throw `IllegalArgumentException` with a descriptive message; return normally when valid.",
    files: [
      {
        name: "Validator.java",
        content: `import java.util.Set;

public class Validator {
    public static void validate(long id, int distanceKm, int loadKg, int windPenalty, Set<Long> existingIds) {
        // TODO
    }
}
`,
      },
    ],
    tests: `
Set<Long> ex = Set.of(101L, 102L, 103L);
test("valid mission 104", () -> Validator.validate(104, 6, 1, 2, ex));
test("lower bounds are valid", () -> Validator.validate(1, 1, 0, 0, ex));
test("upper bounds are valid", () -> Validator.validate(10000, 10000, 10000, 10000, ex));
test("id 0 rejected", () -> expectThrows(IllegalArgumentException.class, () -> Validator.validate(0, 5, 1, 1, ex)));
test("id 10001 rejected", () -> expectThrows(IllegalArgumentException.class, () -> Validator.validate(10001, 5, 1, 1, ex)));
test("distance 0 rejected", () -> expectThrows(IllegalArgumentException.class, () -> Validator.validate(500, 0, 1, 1, ex)));
test("distance 10001 rejected", () -> expectThrows(IllegalArgumentException.class, () -> Validator.validate(500, 10001, 1, 1, ex)));
test("load -1 rejected", () -> expectThrows(IllegalArgumentException.class, () -> Validator.validate(500, 5, -1, 1, ex)));
test("load 10001 rejected", () -> expectThrows(IllegalArgumentException.class, () -> Validator.validate(500, 5, 10001, 1, ex)));
test("wind -1 rejected", () -> expectThrows(IllegalArgumentException.class, () -> Validator.validate(500, 5, 1, -1, ex)));
test("wind 10001 rejected", () -> expectThrows(IllegalArgumentException.class, () -> Validator.validate(500, 5, 1, 10001, ex)));
test("duplicate rejected", () -> expectThrows(IllegalArgumentException.class, () -> Validator.validate(101, 5, 1, 1, ex)));
test("message is descriptive", () -> { try { Validator.validate(0, 5, 1, 1, ex); } catch (IllegalArgumentException e) { eq(true, e.getMessage() != null && e.getMessage().length() > 5); return; } throw new AssertionError("no exception"); });`,
    hints: ["Pattern: `if (x < MIN || x > MAX) throw new IllegalArgumentException(\"x must be between MIN and MAX.\");`", "Load and wind allow 0; distance and id start at 1.", "`if (existingIds.contains(id)) throw ...`"],
    solution: [
      {
        name: "Validator.java",
        content: `import java.util.Set;

public class Validator {
    public static void validate(long id, int distanceKm, int loadKg, int windPenalty, Set<Long> existingIds) {
        if (id < 1 || id > 10000) throw new IllegalArgumentException("ID must be between 1 and 10000.");
        if (distanceKm < 1 || distanceKm > 10000) throw new IllegalArgumentException("distanceKm must be between 1 and 10000.");
        if (loadKg < 0 || loadKg > 10000) throw new IllegalArgumentException("loadKg must be between 0 and 10000.");
        if (windPenalty < 0 || windPenalty > 10000) throw new IllegalArgumentException("windPenalty must be between 0 and 10000.");
        if (existingIds.contains(id)) throw new IllegalArgumentException("A mission with ID " + id + " already exists.");
    }
}
`,
      },
    ],
  },
  {
    id: "ct-safe-energy",
    lessonId: "overflow-long",
    title: "Overflow-safe arithmetic",
    skill: "exceptions",
    difficulty: "easy",
    prompt: "Implement `SafeMath.airEnergy(int distanceKm, int loadKg, int windPenalty)` = 3d + 8l + 2w. It must return the exact value whenever it fits in `int`, and throw `ArithmeticException` when it does not — never a wrapped negative number.",
    files: [
      {
        name: "SafeMath.java",
        content: `public class SafeMath {
    public static int airEnergy(int distanceKm, int loadKg, int windPenalty) {
        // TODO
        return 3 * distanceKm + 8 * loadKg + 2 * windPenalty;
    }
}
`,
      },
    ],
    tests: `
test("mission 103 -> 38", () -> eq(38, SafeMath.airEnergy(8, 1, 3)));
test("mission 104 -> 30", () -> eq(30, SafeMath.airEnergy(6, 1, 2)));
test("near the limit but fits", () -> eq(2_100_000_000, SafeMath.airEnergy(700_000_000, 0, 0)));
test("overflow in multiplication throws", () -> expectThrows(ArithmeticException.class, () -> SafeMath.airEnergy(800_000_000, 0, 0)));
test("overflow in the sum throws", () -> expectThrows(ArithmeticException.class, () -> SafeMath.airEnergy(700_000_000, 10_000_000, 0)));`,
    hints: ["Make each multiplication `long`: `3L * distanceKm`.", "`return Math.toIntExact(total);`"],
    solution: [
      {
        name: "SafeMath.java",
        content: `public class SafeMath {
    public static int airEnergy(int distanceKm, int loadKg, int windPenalty) {
        long total = 3L * distanceKm + 8L * loadKg + 2L * windPenalty;
        return Math.toIntExact(total);
    }
}
`,
      },
    ],
  },
];

CODING_TASKS.push(
  {
    id: "ct-discountable",
    lessonId: "interfaces-enums",
    title: "Tutorial 5: the Discountable contract",
    skill: "oop",
    difficulty: "medium",
    prompt:
      "`Product`, `DigitalProduct` and `PhysicalProduct` are supplied (read-only). Then:\n- declare interface `Discountable` with `double applyDiscount(double rate)`\n- make `DiscountedDigital` implement it with the full discount: `price × (1 − rate)`\n- make `DiscountedPhysical` implement it with the rate **capped at 0.20** (shipping is never discounted — Tutorial 5)\n- a rate outside 0–1 throws `IllegalArgumentException`.",
    files: [
      {
        name: "Product.java",
        readOnly: true,
        content: `public abstract class Product {
    private final String name;
    private final double price;
    protected Product(String name, double price) { this.name = name; this.price = price; }
    public String getName() { return name; }
    public double getPrice() { return price; }
}

class DigitalProduct extends Product {
    public DigitalProduct(String name, double price) { super(name, price); }
}

class PhysicalProduct extends Product {
    public PhysicalProduct(String name, double price) { super(name, price); }
}
`,
      },
      { name: "Discountable.java", content: "public interface Discountable {\n    // TODO: declare applyDiscount\n}\n" },
      {
        name: "DiscountedDigital.java",
        content: `public class DiscountedDigital extends DigitalProduct {
    public DiscountedDigital(String name, double price) { super(name, price); }
    // TODO: implement Discountable — full discount
}
`,
      },
      {
        name: "DiscountedPhysical.java",
        content: `public class DiscountedPhysical extends PhysicalProduct {
    public DiscountedPhysical(String name, double price) { super(name, price); }
    // TODO: implement Discountable — discount capped at 20%
}
`,
      },
    ],
    tests: `
test("Discountable is an interface with applyDiscount(double)", () -> { eq(true, Discountable.class.isInterface()); eq(double.class, Discountable.class.getMethod("applyDiscount", double.class).getReturnType()); });
test("DiscountedDigital implements Discountable", () -> eq(true, Discountable.class.isAssignableFrom(DiscountedDigital.class)));
test("DiscountedPhysical implements Discountable", () -> eq(true, Discountable.class.isAssignableFrom(DiscountedPhysical.class)));
test("digital: full discount", () -> eq(true, Math.abs(((Discountable) (Object) new DiscountedDigital("Course", 100)).applyDiscount(0.5) - 50.0) < 1e-9));
test("physical: capped at 20%", () -> eq(true, Math.abs(((Discountable) (Object) new DiscountedPhysical("Keyboard", 100)).applyDiscount(0.5) - 80.0) < 1e-9));
test("physical: small discount not capped", () -> eq(true, Math.abs(((Discountable) (Object) new DiscountedPhysical("Mouse", 50)).applyDiscount(0.1) - 45.0) < 1e-9));
test("polymorphic list", () -> { java.util.List<Discountable> l = java.util.List.of((Discountable) (Object) new DiscountedDigital("a", 10), (Discountable) (Object) new DiscountedPhysical("b", 10)); double t = 0; for (Discountable d : l) t += d.applyDiscount(1.0); eq(true, Math.abs(t - 8.0) < 1e-9); });
test("invalid rate rejected", () -> { expectThrows(IllegalArgumentException.class, () -> ((Discountable) (Object) new DiscountedDigital("a", 10)).applyDiscount(-0.1)); expectThrows(IllegalArgumentException.class, () -> ((Discountable) (Object) new DiscountedPhysical("a", 10)).applyDiscount(1.5)); });`,
    hints: ["`public interface Discountable { double applyDiscount(double rate); }`", "`public class DiscountedDigital extends DigitalProduct implements Discountable`", "Physical: `double capped = Math.min(rate, 0.20); return getPrice() * (1 - capped);` — validate the rate first."],
    solution: [
      { name: "Discountable.java", content: "public interface Discountable {\n    double applyDiscount(double rate);\n}\n" },
      {
        name: "DiscountedDigital.java",
        content: `public class DiscountedDigital extends DigitalProduct implements Discountable {
    public DiscountedDigital(String name, double price) { super(name, price); }

    @Override
    public double applyDiscount(double rate) {
        if (rate < 0 || rate > 1) throw new IllegalArgumentException("rate must be between 0 and 1");
        return getPrice() * (1 - rate);
    }
}
`,
      },
      {
        name: "DiscountedPhysical.java",
        content: `public class DiscountedPhysical extends PhysicalProduct implements Discountable {
    public DiscountedPhysical(String name, double price) { super(name, price); }

    @Override
    public double applyDiscount(double rate) {
        if (rate < 0 || rate > 1) throw new IllegalArgumentException("rate must be between 0 and 1");
        double capped = Math.min(rate, 0.20);
        return getPrice() * (1 - capped);
    }
}
`,
      },
    ],
  },
  {
    id: "ct-uml-to-code",
    lessonId: "uml-class-diagrams",
    title: "UML → code: Customer HAS-A Address",
    skill: "oop",
    difficulty: "easy",
    prompt:
      "Implement this diagram exactly:\n```text\nAddress                         Customer ◆──── 1 Address\n- street : String               - name : String\n- city : String                 - address : Address\n+ Address(street, city)         + Customer(name, address)\n+ getStreet() : String          + getName() : String\n+ getCity() : String            + getAddress() : Address\n                                + describe() : String   → \"<name>, <street>, <city>\"\n```",
    files: [
      { name: "Address.java", content: "public class Address {\n    // TODO\n}\n" },
      { name: "Customer.java", content: "public class Customer {\n    // TODO\n}\n" },
    ],
    tests: `
test("Address fields are private Strings", () -> { for (String f : new String[]{"street", "city"}) { java.lang.reflect.Field x = Address.class.getDeclaredField(f); eq(String.class, x.getType()); eq(true, java.lang.reflect.Modifier.isPrivate(x.getModifiers())); } });
test("Customer has a private Address field (composition, not inheritance)", () -> { java.lang.reflect.Field x = Customer.class.getDeclaredField("address"); eq(Address.class, x.getType()); eq(true, java.lang.reflect.Modifier.isPrivate(x.getModifiers())); eq(Object.class, Customer.class.getSuperclass()); });
test("constructors + getters", () -> { Address a = new Address("1 Galle Rd", "Colombo"); Customer c = new Customer("Nimal", a); eq("1 Galle Rd", a.getStreet()); eq("Colombo", a.getCity()); eq("Nimal", c.getName()); eq(a, c.getAddress()); });
test("describe()", () -> eq("Nimal, 1 Galle Rd, Colombo", new Customer("Nimal", new Address("1 Galle Rd", "Colombo")).describe()));`,
    hints: ["Each `- x : Type` line is a `private Type x;` field.", "`describe()` uses `address.getStreet()` and `address.getCity()`."],
    solution: [
      {
        name: "Address.java",
        content: `public class Address {
    private String street;
    private String city;

    public Address(String street, String city) {
        this.street = street;
        this.city = city;
    }

    public String getStreet() { return street; }
    public String getCity() { return city; }
}
`,
      },
      {
        name: "Customer.java",
        content: `public class Customer {
    private String name;
    private Address address;

    public Customer(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    public String getName() { return name; }
    public Address getAddress() { return address; }

    public String describe() {
        return name + ", " + address.getStreet() + ", " + address.getCity();
    }
}
`,
      },
    ],
  },
);

/** Builds the hidden test harness (JccTests.java) for a task. */
export function buildHarness(task: CodingTask): string {
  const usesFixed = task.tests.includes("/*FIXED*/");
  return `import java.util.*;

${usesFixed ? FIXED_MISSION : ""}

public class JccTests {
    interface Body { void run() throws Exception; }

    static void test(String name, Body body) {
        try {
            body.run();
            System.out.println("@@PASS " + name);
        } catch (Throwable t) {
            String msg = String.valueOf(t.getMessage() == null ? t.getClass().getSimpleName() : t.getClass().getSimpleName() + ": " + t.getMessage());
            System.out.println("@@FAIL " + name + " :: " + msg.replace('\\n', ' '));
        }
    }

    static void eq(Object expected, Object actual) {
        if (expected instanceof Number && actual instanceof Number && !(expected instanceof Double) && !(actual instanceof Double)) {
            if (((Number) expected).longValue() == ((Number) actual).longValue()) return;
        } else if (Objects.equals(expected, actual)) return;
        throw new AssertionError("expected <" + expected + "> but was <" + actual + ">");
    }

    static void expectThrows(Class<? extends Throwable> type, Body body) {
        try {
            body.run();
        } catch (Throwable t) {
            if (type.isInstance(t)) return;
            throw new AssertionError("expected " + type.getSimpleName() + " but got " + t);
        }
        throw new AssertionError("expected " + type.getSimpleName() + " to be thrown");
    }

    ${usesFixed ? "static List<Long> ids(List<DispatchMission> l) { List<Long> o = new ArrayList<>(); for (DispatchMission m : l) o.add(m.getId()); return o; }" : ""}

    public static void main(String[] args) {
${task.tests.replace("/*FIXED*/", "")}
    }
}
`;
}

export interface HarnessResult {
  name: string;
  passed: boolean;
  message?: string;
}

export function parseHarnessOutput(stdout: string): HarnessResult[] {
  const out: HarnessResult[] = [];
  for (const line of stdout.split(/\r?\n/)) {
    if (line.startsWith("@@PASS ")) out.push({ name: line.slice(7), passed: true });
    else if (line.startsWith("@@FAIL ")) {
      const [name, ...rest] = line.slice(7).split(" :: ");
      out.push({ name, passed: false, message: rest.join(" :: ") });
    }
  }
  return out;
}

export function testCount(task: CodingTask): number {
  return (task.tests.match(/\btest\(/g) ?? []).length;
}
