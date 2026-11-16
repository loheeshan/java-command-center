package edu.practice.dispatch.grader;

import edu.practice.dispatch.exception.MissionNotFoundException;
import edu.practice.dispatch.model.DispatchMission;
import edu.practice.dispatch.model.NewAirMission;
import edu.practice.dispatch.repository.MissionRepository;
import edu.practice.dispatch.service.DispatchService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/** Task 3 (service part) — energy lookup, addAir validation, capacity validation. */
class Task3ServiceValidationTest {

    private static NewAirMission req(long id, int d, int l, int w, boolean c) {
        return new NewAirMission(id, d, l, w, c);
    }

    @Test
    void t3_1_energy_lookup_existing() {
        DispatchService s = new DispatchService(new MissionRepository());
        assertEquals(39, s.energy(101));
        assertEquals(18, s.energy(102));
    }

    @Test
    void t3_1_energy_lookup_unknown_throws_not_found() {
        DispatchService s = new DispatchService(new MissionRepository());
        assertThrows(MissionNotFoundException.class, () -> s.energy(9999));
    }

    @Test
    void t3_2_add_valid_air_mission_is_saved() {
        MissionRepository repo = new MissionRepository();
        DispatchService s = new DispatchService(repo);
        DispatchMission created = s.addAir(req(104, 6, 1, 2, false));
        assertNotNull(created, "addAir should return the created mission");
        assertEquals(104L, created.getId());
        assertEquals(30, created.energyUnits());
        assertEquals(2, created.priority());
        assertTrue(repo.exists(104), "mission 104 must be saved in the repository");
    }

    @Test
    void t3_2_rejects_out_of_range_values_and_saves_nothing() {
        MissionRepository repo = new MissionRepository();
        DispatchService s = new DispatchService(repo);
        NewAirMission[] invalid = {
                req(0, 5, 1, 1, false), req(10001, 5, 1, 1, false),
                req(500, 0, 1, 1, false), req(501, 10001, 1, 1, false),
                req(502, 5, -1, 1, false), req(503, 5, 10001, 1, false),
                req(504, 5, 1, -1, false), req(505, 5, 1, 10001, false)
        };
        for (NewAirMission r : invalid) {
            assertThrows(IllegalArgumentException.class, () -> s.addAir(r),
                    "should reject id=" + r.getId() + " distanceKm=" + r.getDistanceKm()
                            + " loadKg=" + r.getLoadKg() + " windPenalty=" + r.getWindPenalty());
            assertFalse(repo.exists(r.getId()), "invalid mission " + r.getId() + " must not be saved");
        }
        // boundaries are inclusive
        assertDoesNotThrow(() -> s.addAir(req(1, 1, 0, 0, false)));
        assertDoesNotThrow(() -> s.addAir(req(10000, 10000, 10000, 10000, true)));
    }

    @Test
    void t3_2_rejects_duplicate_id_without_overwriting() {
        MissionRepository repo = new MissionRepository();
        DispatchService s = new DispatchService(repo);
        assertThrows(IllegalArgumentException.class, () -> s.addAir(req(101, 1, 1, 1, false)));
        assertEquals(39, repo.find(101).energyUnits(), "original mission 101 must be unchanged");
    }

    @Test
    void t3_3_rejects_non_positive_capacity() {
        DispatchService s = new DispatchService(new MissionRepository());
        assertThrows(IllegalArgumentException.class, () -> s.plan(0, false), "capacity 0");
        assertThrows(IllegalArgumentException.class, () -> s.plan(-5, false), "capacity -5");
    }
}
