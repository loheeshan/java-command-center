package edu.practice.dispatch.model;

/*
 * TASK 2.1 – Create AirMission in the model package, extending DispatchMission.
 * Include windPenalty and critical fields, a constructor and appropriate getters.
 * Initialise inherited ID, distance and load by chaining to the parent constructor
 * using super(...). Initialise windPenalty and critical in the subclass.
 */
public class AirMission extends DispatchMission {
    private final int windPenalty;
    private final boolean critical;

    public AirMission(long id, int distanceKm, int loadKg,
                      int windPenalty, boolean critical) {
        super(id, distanceKm, loadKg);
        this.windPenalty = windPenalty;
        this.critical = critical;
    }

    public int getWindPenalty() {
        return windPenalty;
    }

    public boolean isCritical() {
        return critical;
    }

    /*
     * TASK 2.2 – Override both abstract methods inherited from DispatchMission.
     * Energy formula: energyUnits = 3 × distanceKm + 8 × loadKg + 2 × windPenalty.
     * Use long for intermediate arithmetic and convert safely to int.
     */
    @Override
    public int energyUnits() {
        long energy = (3L * getDistanceKm())
                + (8L * getLoadKg())
                + (2L * windPenalty);
        return Math.toIntExact(energy);
    }

    /*
     * TASK 2.2 – Priority is 5 when critical is true; otherwise priority is 2.
     */
    @Override
    public int priority() {
        if (critical) {
            return 5;
        }
        return 2;
    }
}
