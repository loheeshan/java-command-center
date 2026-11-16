package edu.practice.dispatch.service;

import edu.practice.dispatch.exception.MissionNotFoundException;
import edu.practice.dispatch.model.AirMission;
import edu.practice.dispatch.model.DispatchMission;
import edu.practice.dispatch.model.DispatchPlan;
import edu.practice.dispatch.model.NewAirMission;
import edu.practice.dispatch.model.PlanLine;
import edu.practice.dispatch.repository.MissionRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Service
public class DispatchService {
    private final MissionRepository repo;

    public DispatchService(MissionRepository repo) {
        this.repo = repo;
    }

    public Collection<DispatchMission> all() {
        return repo.all();
    }

    /*
     * TASK 3.1 – Implement DispatchService.energy(id).
     * Return the energyUnits() value for the mission with the supplied ID.
     * If the ID does not exist, throw MissionNotFoundException.
     */
    public int energy(long id) {
        DispatchMission mission = repo.find(id);
        if (mission == null) {
            throw new MissionNotFoundException(id);
        }
        return mission.energyUnits();
    }

    /*
     * TASK 3.2 – Implement DispatchService.addAir(...) using the supplied NewAirMission request model.
     * Validate ID (1–10,000), distanceKm (1–10,000), loadKg (0–10,000),
     * and windPenalty (0–10,000). Reject duplicate mission IDs.
     * Calculate the energy before saving. Do not save an invalid mission.
     * Invalid values must raise IllegalArgumentException for GlobalExceptionHandler to handle.
     */
    public DispatchMission addAir(NewAirMission request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required.");
        }

        validateAirMission(request);

        if (repo.exists(request.getId())) {
            throw new IllegalArgumentException(
                    "A mission with ID " + request.getId() + " already exists.");
        }

        AirMission mission = new AirMission(
                request.getId(),
                request.getDistanceKm(),
                request.getLoadKg(),
                request.getWindPenalty(),
                request.getCritical()
        );

        // Calculate before saving so invalid/overflowing values are not stored.
        mission.energyUnits();
        repo.save(mission);
        return mission;
    }

    private void validateAirMission(NewAirMission request) {
        if (request.getId() < 1 || request.getId() > 10000) {
            throw new IllegalArgumentException("ID must be between 1 and 10000.");
        }
        if (request.getDistanceKm() < 1 || request.getDistanceKm() > 10000) {
            throw new IllegalArgumentException(
                    "distanceKm must be between 1 and 10000.");
        }
        if (request.getLoadKg() < 0 || request.getLoadKg() > 10000) {
            throw new IllegalArgumentException(
                    "loadKg must be between 0 and 10000.");
        }
        if (request.getWindPenalty() < 0 || request.getWindPenalty() > 10000) {
            throw new IllegalArgumentException(
                    "windPenalty must be between 0 and 10000.");
        }
    }

    /*
     * TASK 2.3 – Implement the dispatch planning algorithm and return a DispatchPlan.
     * When urgentOnly is true, include only missions with priority >= 3.
     * Sort eligible missions by priority descending, then energy ascending, then ID ascending.
     * Traverse the complete sorted list. Select a mission if it fits the remaining capacity;
     * otherwise add its ID to skipped and continue checking later missions.
     * Filtered-out missions must appear in neither selected nor skipped.
     * Do not use concrete subclass type checks. Use DispatchMission methods polymorphically.
     * DispatchPlan.selected contains PlanLine objects; skipped contains mission IDs.
     *
     * TASK 3.3 – Reject plan capacity values less than or equal to zero.
     */
    public DispatchPlan plan(int capacity, boolean urgentOnly) {
        if (capacity <= 0) {
            throw new IllegalArgumentException(
                    "Capacity must be greater than zero.");
        }

        List<DispatchMission> eligible = new ArrayList<>();

        // Filter first: excluded missions belong in neither result list.
        for (DispatchMission mission : repo.all()) {
            if (!urgentOnly || mission.priority() >= 3) {
                eligible.add(mission);
            }
        }

        // Priority descending, energy ascending, ID ascending.
        Collections.sort(eligible, new Comparator<DispatchMission>() {
            @Override
            public int compare(DispatchMission first, DispatchMission second) {
                int result = Integer.compare(second.priority(), first.priority());
                if (result != 0) {
                    return result;
                }

                result = Integer.compare(first.energyUnits(), second.energyUnits());
                if (result != 0) {
                    return result;
                }

                return Long.compare(first.getId(), second.getId());
            }
        });

        List<PlanLine> selected = new ArrayList<>();
        List<Long> skipped = new ArrayList<>();
        int energyUsed = 0;

        for (DispatchMission mission : eligible) {
            int energy = mission.energyUnits();

            if (energy <= capacity - energyUsed) {
                selected.add(new PlanLine(
                        mission.getId(),
                        mission.getClass().getSimpleName(),
                        mission.priority(),
                        energy
                ));
                energyUsed = energyUsed + energy;
            } else {
                // Continue checking the remaining missions.
                skipped.add(mission.getId());
            }
        }

        int energyRemaining = capacity - energyUsed;
        return new DispatchPlan(
                capacity, energyUsed, energyRemaining, selected, skipped);
    }
}
