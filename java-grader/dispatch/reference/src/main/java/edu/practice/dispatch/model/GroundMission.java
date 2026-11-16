package edu.practice.dispatch.model;

public class GroundMission extends DispatchMission {
    private final boolean medical;

    public GroundMission(long id, int distanceKm, int loadKg, boolean medical) {
        super(id, distanceKm, loadKg);
        this.medical = medical;
    }

    public boolean isMedical() {
        return medical;
    }

    /*
     * TASK 1.1 – Complete the energyUnits() TODO in the supplied GroundMission class.
     * Use the formula: energyUnits = 2 × distanceKm + 5 × loadKg.
     * Use long for intermediate arithmetic and convert safely to the required int return type;
     * do not allow silent integer overflow.
     */
    @Override
    public int energyUnits() {
        long energy = (2L * getDistanceKm()) + (5L * getLoadKg());
        return Math.toIntExact(energy);
    }

    /*
     * TASK 1.2 – Complete the priority() TODO in GroundMission.
     * A medical mission must have priority 3.
     * A non-medical mission must have priority 1.
     * Correctly override the abstract parent method.
     */
    @Override
    public int priority() {
        if (medical) {
            return 3;
        }
        return 1;
    }
}
