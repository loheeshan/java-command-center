package edu.practice.dispatch.controller;

import edu.practice.dispatch.model.DispatchMission;
import edu.practice.dispatch.model.DispatchPlan;
import edu.practice.dispatch.model.NewAirMission;
import edu.practice.dispatch.service.DispatchService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.Map;

@RestController
@RequestMapping("/missions")
public class DispatchController {
    private final DispatchService service;

    public DispatchController(DispatchService service) {
        this.service = service;
    }

    @GetMapping
    public Collection<DispatchMission> all() {
        return service.all();
    }

    /*
     * TASK 4.1 – Implement GET /missions/{id}/energy to return the energy consumption
     * of the requested mission. Return a JSON object containing energyUnits.
     */
    @GetMapping("/{id}/energy")
    public Map<String, Integer> energy(@PathVariable("id") long id) {
        return Map.of("energyUnits", service.energy(id));
    }

    /*
     * TASK 4.2 – Implement POST /missions/air to create an air mission.
     * Accept a NewAirMission JSON request body.
     * Return HTTP 201 Created with the created AirMission in the response body.
     */
    @PostMapping("/air")
    @ResponseStatus(HttpStatus.CREATED)
    public DispatchMission addAir(@RequestBody NewAirMission request) {
        return service.addAir(request);
    }

    /*
     * TASK 4.3 – Implement GET /missions/plan?capacity=60&urgentOnly=false.
     * Return a DispatchPlan containing capacity, energyUsed, energyRemaining,
     * selected and skipped. Use the dispatch-planning service algorithm.
     * urgentOnly must default to false when the query parameter is omitted.
     */
    @GetMapping("/plan")
    public DispatchPlan plan(
            @RequestParam("capacity") int capacity,
            @RequestParam(name = "urgentOnly", defaultValue = "false") boolean urgentOnly) {
        return service.plan(capacity, urgentOnly);
    }
}
