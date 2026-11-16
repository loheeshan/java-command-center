package edu.practice.dispatch.grader;

import edu.practice.dispatch.model.DispatchMission;
import edu.practice.dispatch.model.DispatchPlan;
import edu.practice.dispatch.model.GroundMission;
import edu.practice.dispatch.model.PlanLine;
import edu.practice.dispatch.repository.MissionRepository;
import edu.practice.dispatch.service.DispatchService;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Modifier;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/** Task 2 — AirMission class, its calculations, and DispatchService.plan(). */
class Task2AirAndPlanTest {

    private static List<Long> ids(List<PlanLine> lines) {
        List<Long> out = new ArrayList<>();
        for (PlanLine l : lines) out.add(l.getId());
        return out;
    }

    @Test
    void t2_1_air_mission_extends_dispatch_mission() {
        Class<?> c = Probe.airClass();
        assertEquals(DispatchMission.class, c.getSuperclass(), "AirMission must extend DispatchMission directly");
        assertFalse(Modifier.isAbstract(c.getModifiers()), "AirMission must be a concrete class");
    }

    @Test
    void t2_1_constructor_chains_to_super_and_getters_work() {
        DispatchMission m = Probe.air(103, 8, 1, 3, true);
        assertEquals(103L, m.getId(), "id must be passed to super(...)");
        assertEquals(8, m.getDistanceKm(), "distanceKm must be passed to super(...)");
        assertEquals(1, m.getLoadKg(), "loadKg must be passed to super(...)");
        assertEquals(3, ((Number) Probe.call(m, "getWindPenalty")).intValue(), "getWindPenalty()");
        assertEquals(Boolean.TRUE, Probe.call(m, "isCritical", "getCritical"), "isCritical()/getCritical()");
    }

    @Test
    void t2_1_repository_seeds_air_mission_103() {
        MissionRepository repo = new MissionRepository();
        DispatchMission m = repo.find(103);
        assertNotNull(m, "AirMission 103 must be seeded in MissionRepository");
        assertEquals(Probe.airClass(), m.getClass(), "mission 103 must be an AirMission");
        assertEquals(3, repo.all().size(), "repository should hold exactly 101, 102 and 103 (no duplicates)");
    }

    @Test
    void t2_2_air_energy_formula() {
        assertEquals(38, Probe.air(103, 8, 1, 3, true).energyUnits(), "3 x 8 + 8 x 1 + 2 x 3");
        assertEquals(30, Probe.air(104, 6, 1, 2, false).energyUnits(), "3 x 6 + 8 x 1 + 2 x 2");
        assertEquals(3, Probe.air(5, 1, 0, 0, false).energyUnits(), "3 x 1 + 0 + 0");
        assertEquals(130000, Probe.air(6, 10000, 10000, 10000, false).energyUnits());
    }

    @Test
    void t2_2_air_overflow_is_not_silent() {
        DispatchMission huge = Probe.air(7, Integer.MAX_VALUE, Integer.MAX_VALUE, Integer.MAX_VALUE, false);
        try {
            int r = huge.energyUnits();
            fail("energyUnits() returned " + r + " instead of reporting overflow");
        } catch (ArithmeticException expected) {
            // ok
        }
    }

    @Test
    void t2_2_air_priority() {
        assertEquals(5, Probe.air(1, 1, 1, 1, true).priority(), "critical -> 5");
        assertEquals(2, Probe.air(2, 1, 1, 1, false).priority(), "not critical -> 2");
    }

    @Test
    void t2_3_plan_capacity_60_matches_paper() {
        MissionRepository repo = Probe.emptyRepository();
        repo.save(new GroundMission(101, 12, 3, true));
        repo.save(new GroundMission(102, 4, 2, false));
        repo.save(Probe.air(103, 8, 1, 3, true));
        DispatchPlan p = new DispatchService(repo).plan(60, false);
        assertEquals(List.of(103L, 102L), ids(p.getSelected()), "selected order");
        assertEquals(List.of(101L), p.getSkipped(), "skipped");
        assertEquals(56, p.getEnergyUsed());
        assertEquals(4, p.getEnergyRemaining());
        assertEquals(60, p.getCapacity());
    }

    @Test
    void t2_3_urgent_only_filters_before_planning() {
        MissionRepository repo = Probe.emptyRepository();
        repo.save(new GroundMission(101, 12, 3, true));
        repo.save(new GroundMission(102, 4, 2, false));
        repo.save(Probe.air(103, 8, 1, 3, true));
        DispatchPlan p = new DispatchService(repo).plan(60, true);
        assertEquals(List.of(103L), ids(p.getSelected()));
        assertEquals(List.of(101L), p.getSkipped(), "102 is filtered out, so it must not be in skipped");
    }

    @Test
    void t2_3_tie_breaking_energy_then_id() {
        MissionRepository repo = Probe.emptyRepository();
        repo.save(new Probe.FixedMission(30, 10, 2));
        repo.save(new Probe.FixedMission(10, 10, 2));
        repo.save(new Probe.FixedMission(20, 5, 2));
        repo.save(new Probe.FixedMission(40, 50, 4));
        DispatchPlan p = new DispatchService(repo).plan(1000, false);
        assertEquals(List.of(40L, 20L, 10L, 30L), ids(p.getSelected()),
                "priority DESC, then energy ASC, then id ASC");
        PlanLine first = p.getSelected().get(0);
        assertEquals(4, first.getPriority(), "PlanLine.priority");
        assertEquals(50, first.getEnergyUnits(), "PlanLine.energyUnits");
        assertNotNull(first.getType(), "PlanLine.type should be set");
    }

    @Test
    void t2_3_polymorphic_and_matches_reference_on_random_inputs() {
        Random rnd = new Random(20261120L);
        for (int round = 0; round < 60; round++) {
            MissionRepository repo = Probe.emptyRepository();
            List<Probe.FixedMission> all = new ArrayList<>();
            int n = 1 + rnd.nextInt(9);
            Set<Long> used = new HashSet<>();
            for (int i = 0; i < n; i++) {
                long id;
                do { id = 1 + rnd.nextInt(60); } while (!used.add(id));
                Probe.FixedMission m = new Probe.FixedMission(id, 1 + rnd.nextInt(40), 1 + rnd.nextInt(5));
                all.add(m);
                repo.save(m);
            }
            int capacity = 1 + rnd.nextInt(120);
            boolean urgent = rnd.nextBoolean();

            // Reference implementation of the paper's rules
            List<Probe.FixedMission> eligible = new ArrayList<>();
            for (Probe.FixedMission m : all) if (!urgent || m.priority() >= 3) eligible.add(m);
            eligible.sort(Comparator.comparingInt(Probe.FixedMission::priority).reversed()
                    .thenComparingInt(Probe.FixedMission::energyUnits)
                    .thenComparingLong(Probe.FixedMission::getId));
            List<Long> expSel = new ArrayList<>(), expSkip = new ArrayList<>();
            int remaining = capacity;
            for (Probe.FixedMission m : eligible) {
                if (m.energyUnits() <= remaining) { expSel.add(m.getId()); remaining -= m.energyUnits(); }
                else expSkip.add(m.getId());
            }

            DispatchPlan p = new DispatchService(repo).plan(capacity, urgent);
            String ctx = "round " + round + " capacity=" + capacity + " urgentOnly=" + urgent;
            assertEquals(expSel, ids(p.getSelected()), "selected, " + ctx);
            assertEquals(expSkip, p.getSkipped(), "skipped, " + ctx);
            assertEquals(capacity - remaining, p.getEnergyUsed(), "energyUsed, " + ctx);
            assertEquals(remaining, p.getEnergyRemaining(), "energyRemaining, " + ctx);
        }
    }
}
