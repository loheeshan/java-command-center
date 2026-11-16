package edu.practice.dispatch.grader;

import edu.practice.dispatch.model.GroundMission;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/** Task 1 — GroundMission.energyUnits() and priority(). */
class Task1GroundMissionTest {

    @Test
    void t1_1_energy_mission101_is_39() {
        assertEquals(39, new GroundMission(101, 12, 3, true).energyUnits(),
                "2 x 12 + 5 x 3 should be 39");
    }

    @Test
    void t1_1_energy_formula_other_values() {
        assertEquals(18, new GroundMission(102, 4, 2, false).energyUnits(), "2 x 4 + 5 x 2");
        assertEquals(2, new GroundMission(7, 1, 0, false).energyUnits(), "2 x 1 + 5 x 0");
        assertEquals(70000, new GroundMission(8, 10000, 10000, true).energyUnits(), "2 x 10000 + 5 x 10000");
        assertEquals(2_000_000_000, new GroundMission(9, 1_000_000_000, 0, false).energyUnits(),
                "large values that still fit in int must be computed exactly");
    }

    @Test
    void t1_1_overflow_is_not_silent() {
        GroundMission huge = new GroundMission(10, Integer.MAX_VALUE, Integer.MAX_VALUE, false);
        try {
            int result = huge.energyUnits();
            fail("energyUnits() returned " + result + " for a value larger than Integer.MAX_VALUE — silent overflow");
        } catch (UnsupportedOperationException e) {
            fail("energyUnits() is still the unimplemented TODO");
        } catch (ArithmeticException expected) {
            // Math.toIntExact (or equivalent) reported the overflow
        }
    }

    @Test
    void t1_2_priority_medical_is_3() {
        assertEquals(3, new GroundMission(101, 12, 3, true).priority());
    }

    @Test
    void t1_2_priority_non_medical_is_1() {
        assertEquals(1, new GroundMission(102, 4, 2, false).priority());
    }
}
