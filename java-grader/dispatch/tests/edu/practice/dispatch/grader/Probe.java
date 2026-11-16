package edu.practice.dispatch.grader;

import edu.practice.dispatch.model.DispatchMission;
import edu.practice.dispatch.repository.MissionRepository;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Map;

/**
 * Grader helpers. AirMission is created by the student, so the grader reaches it through
 * reflection: if the class is missing, only the tests that need it fail — the rest of the
 * suite still compiles and runs.
 */
final class Probe {
    static final String AIR = "edu.practice.dispatch.model.AirMission";

    private Probe() {}

    static Class<?> airClass() {
        try {
            return Class.forName(AIR);
        } catch (ClassNotFoundException e) {
            throw new AssertionError("AirMission class not found in package edu.practice.dispatch.model");
        }
    }

    static DispatchMission air(long id, int distanceKm, int loadKg, int windPenalty, boolean critical) {
        Class<?> c = airClass();
        try {
            Constructor<?> ctor = c.getConstructor(long.class, int.class, int.class, int.class, boolean.class);
            return (DispatchMission) ctor.newInstance(id, distanceKm, loadKg, windPenalty, critical);
        } catch (NoSuchMethodException e) {
            throw new AssertionError("AirMission needs a public constructor (long id, int distanceKm, int loadKg, int windPenalty, boolean critical)");
        } catch (InvocationTargetException e) {
            throw new AssertionError("AirMission constructor threw " + e.getCause());
        } catch (ReflectiveOperationException e) {
            throw new AssertionError("Could not create AirMission: " + e);
        } catch (ClassCastException e) {
            throw new AssertionError("AirMission must extend DispatchMission");
        }
    }

    /** Calls a no-arg method by trying each name in turn; unwraps exceptions thrown by student code. */
    static Object call(Object target, String... names) {
        for (String n : names) {
            try {
                Method m = target.getClass().getMethod(n);
                return m.invoke(target);
            } catch (NoSuchMethodException ignored) {
                // try next name
            } catch (InvocationTargetException e) {
                if (e.getCause() instanceof RuntimeException re) throw re;
                throw new AssertionError(e.getCause());
            } catch (IllegalAccessException e) {
                throw new AssertionError("Method " + n + " is not public");
            }
        }
        throw new AssertionError("Expected a public method named one of " + String.join(", ", names));
    }

    /** A repository with the seed data removed, so algorithm tests control every mission. */
    @SuppressWarnings("unchecked")
    static MissionRepository emptyRepository() {
        MissionRepository repo = new MissionRepository();
        for (Field f : MissionRepository.class.getDeclaredFields()) {
            if (Map.class.isAssignableFrom(f.getType())) {
                try {
                    f.setAccessible(true);
                    ((Map<Long, DispatchMission>) f.get(repo)).clear();
                    return repo;
                } catch (IllegalAccessException e) {
                    throw new AssertionError(e);
                }
            }
        }
        throw new AssertionError("MissionRepository storage map not found — do not replace the supplied repository API");
    }

    /**
     * A third mission type the student has never seen. If the planner relies on
     * instanceof GroundMission / AirMission checks instead of polymorphism, it breaks here.
     */
    static final class FixedMission extends DispatchMission {
        private final int energy;
        private final int prio;

        FixedMission(long id, int energy, int prio) {
            super(id, 1, 0);
            this.energy = energy;
            this.prio = prio;
        }

        @Override public int energyUnits() { return energy; }
        @Override public int priority() { return prio; }
    }
}
