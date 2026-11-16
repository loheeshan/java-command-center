package edu.practice.dispatch.repository;

import edu.practice.dispatch.model.AirMission;
import edu.practice.dispatch.model.DispatchMission;
import edu.practice.dispatch.model.GroundMission;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class MissionRepository {
    private final Map<Long, DispatchMission> map = new ConcurrentHashMap<>();

    /*
     * STARTER DATA REQUIREMENT – The two GroundMission objects are already supplied.
     * After creating AirMission, add AirMission(103, 8, 1, 3, true) here.
     * Do not add duplicate GroundMission objects.
     */
    public MissionRepository() {
        map.put(101L, new GroundMission(101, 12, 3, true));
        map.put(102L, new GroundMission(102, 4, 2, false));
        map.put(103L, new AirMission(103, 8, 1, 3, true));
    }

    public Collection<DispatchMission> all() {
        return map.values();
    }

    public DispatchMission find(long id) {
        return map.get(id);
    }

    public boolean exists(long id) {
        return map.containsKey(id);
    }

    public void save(DispatchMission mission) {
        map.put(mission.getId(), mission);
    }
}
