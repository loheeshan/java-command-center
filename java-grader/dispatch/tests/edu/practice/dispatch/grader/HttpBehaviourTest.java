package edu.practice.dispatch.grader;

import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.test.annotation.DirtiesContext;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Starts the real application on a random port and exercises it over HTTP,
 * the same way Section B markers run your ZIP.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class HttpBehaviourTest {

    @Autowired
    Environment env;

    private static final HttpClient CLIENT = HttpClient.newHttpClient();
    private static final JsonMapper JSON = JsonMapper.builder().build();

    record Res(int status, String body) {
        JsonNode json() {
            try {
                return JSON.readTree(body);
            } catch (RuntimeException e) {
                throw new AssertionError("Response body is not JSON: " + body);
            }
        }
    }

    private String base() {
        return "http://localhost:" + env.getProperty("local.server.port");
    }

    private Res get(String path) throws Exception {
        HttpResponse<String> r = CLIENT.send(HttpRequest.newBuilder(URI.create(base() + path)).GET().build(),
                HttpResponse.BodyHandlers.ofString());
        return new Res(r.statusCode(), r.body());
    }

    private Res post(String path, String json) throws Exception {
        HttpResponse<String> r = CLIENT.send(HttpRequest.newBuilder(URI.create(base() + path))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(json)).build(),
                HttpResponse.BodyHandlers.ofString());
        return new Res(r.statusCode(), r.body());
    }

    private static List<Long> ids(JsonNode arr, String field) {
        List<Long> out = new ArrayList<>();
        if (arr == null || !arr.isArray()) return out;
        for (JsonNode n : arr) out.add(field == null ? n.asLong() : n.get(field).asLong());
        return out;
    }

    private static void assertError(Res r, int status, String code) {
        assertEquals(status, r.status(), "HTTP status; body was: " + r.body());
        JsonNode j = r.json();
        assertNotNull(j.get("code"), "ErrorResponse must contain 'code'");
        assertEquals(code, j.get("code").asString(), "ErrorResponse.code");
        assertNotNull(j.get("message"), "ErrorResponse must contain 'message'");
        assertFalse(j.get("message").asString().isBlank(), "ErrorResponse.message must be descriptive");
    }

    private JsonNode planLine(JsonNode plan, long id) {
        for (JsonNode n : plan.get("selected")) if (n.get("id").asLong() == id) return n;
        return null;
    }

    // ---------------- Task 3.3: GlobalExceptionHandler ----------------

    @Test @Order(1)
    void t3_3_handler_maps_not_found_to_404() throws Exception {
        assertError(get("/missions/9999/energy"), 404, "NOT_FOUND");
    }

    @Test @Order(2)
    void t3_3_handler_maps_illegal_argument_to_400() throws Exception {
        assertError(get("/missions/plan?capacity=0&urgentOnly=false"), 400, "BAD_REQUEST");
    }

    // ---------------- Task 4: endpoints ----------------

    @Test @Order(3)
    void t4_1_get_energy_endpoint() throws Exception {
        Res r = get("/missions/101/energy");
        assertEquals(200, r.status(), r.body());
        assertEquals(39, r.json().get("energyUnits").asInt(), "expected {\"energyUnits\":39}");
    }

    @Test @Order(4)
    void t4_3_get_plan_endpoint_shape() throws Exception {
        Res r = get("/missions/plan?capacity=60&urgentOnly=false");
        assertEquals(200, r.status(), r.body());
        JsonNode p = r.json();
        for (String f : new String[]{"capacity", "energyUsed", "energyRemaining", "selected", "skipped"}) {
            assertNotNull(p.get(f), "DispatchPlan JSON must contain " + f);
        }
        assertEquals(60, p.get("capacity").asInt());
        JsonNode first = p.get("selected").get(0);
        for (String f : new String[]{"id", "type", "priority", "energyUnits"}) {
            assertNotNull(first.get(f), "PlanLine JSON must contain " + f);
        }
    }

    @Test @Order(5)
    void t4_3_urgent_only_defaults_to_false() throws Exception {
        Res withDefault = get("/missions/plan?capacity=60");
        assertEquals(200, withDefault.status(), "urgentOnly must be optional; body: " + withDefault.body());
        Res explicit = get("/missions/plan?capacity=60&urgentOnly=false");
        assertEquals(ids(explicit.json().get("selected"), "id"), ids(withDefault.json().get("selected"), "id"));
        assertEquals(ids(explicit.json().get("skipped"), null), ids(withDefault.json().get("skipped"), null));
    }

    // ---------------- Section B: functional checks ----------------

    @Test @Order(6)
    void b1_ground_101_energy_39_priority_3() throws Exception {
        assertEquals(39, get("/missions/101/energy").json().get("energyUnits").asInt());
        JsonNode line = planLine(get("/missions/plan?capacity=10000").json(), 101);
        assertNotNull(line, "101 should be selected when capacity is large");
        assertEquals(3, line.get("priority").asInt());
    }

    @Test @Order(7)
    void b2_air_103_energy_38_priority_5() throws Exception {
        Res e = get("/missions/103/energy");
        assertEquals(200, e.status(), "mission 103 must exist; body: " + e.body());
        assertEquals(38, e.json().get("energyUnits").asInt());
        JsonNode line = planLine(get("/missions/plan?capacity=10000").json(), 103);
        assertNotNull(line, "103 should be selected when capacity is large");
        assertEquals(5, line.get("priority").asInt());
    }

    @Test @Order(8)
    void b3_capacity_60_selects_103_102_skips_101() throws Exception {
        JsonNode p = get("/missions/plan?capacity=60&urgentOnly=false").json();
        assertEquals(List.of(103L, 102L), ids(p.get("selected"), "id"));
        assertEquals(List.of(101L), ids(p.get("skipped"), null));
        assertEquals(56, p.get("energyUsed").asInt());
        assertEquals(4, p.get("energyRemaining").asInt());
    }

    @Test @Order(9)
    void b4_urgent_only_selects_103_skips_101_excludes_102() throws Exception {
        JsonNode p = get("/missions/plan?capacity=60&urgentOnly=true").json();
        assertEquals(List.of(103L), ids(p.get("selected"), "id"));
        assertEquals(List.of(101L), ids(p.get("skipped"), null));
    }

    @Test @Order(10)
    void b5_invalid_input_400_and_unknown_404() throws Exception {
        assertError(get("/missions/plan?capacity=0"), 400, "BAD_REQUEST");
        assertError(get("/missions/plan?capacity=-3"), 400, "BAD_REQUEST");
        assertError(post("/missions/air", "{\"id\":101,\"distanceKm\":5,\"loadKg\":1,\"windPenalty\":1,\"critical\":false}"),
                400, "BAD_REQUEST");
        assertError(post("/missions/air", "{\"id\":321,\"distanceKm\":0,\"loadKg\":1,\"windPenalty\":1,\"critical\":false}"),
                400, "BAD_REQUEST");
        assertError(post("/missions/air", "{\"id\":322,\"distanceKm\":5,\"loadKg\":1,\"windPenalty\":10001,\"critical\":false}"),
                400, "BAD_REQUEST");
        assertEquals(404, get("/missions/321/energy").status(), "invalid mission 321 must not have been saved");
        assertError(get("/missions/4242/energy"), 404, "NOT_FOUND");
    }

    @Test @Order(11)
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.AFTER_METHOD)
    void t4_2_post_air_returns_201_with_created_mission() throws Exception {
        Res r = post("/missions/air", "{\"id\":105,\"distanceKm\":2,\"loadKg\":1,\"windPenalty\":0,\"critical\":true}");
        assertEquals(201, r.status(), "POST must return 201 Created; body: " + r.body());
        JsonNode j = r.json();
        assertEquals(105, j.get("id").asLong(), "response body should be the created AirMission");
        assertEquals(2, j.get("distanceKm").asInt());
    }

    @Test @Order(12)
    void b6_post_104_then_plan_125() throws Exception {
        Res created = post("/missions/air", "{\"id\":104,\"distanceKm\":6,\"loadKg\":1,\"windPenalty\":2,\"critical\":false}");
        assertEquals(201, created.status(), "POST mission 104; body: " + created.body());
        List<Long> listed = ids(get("/missions").json(), "id");
        assertTrue(listed.contains(104L), "GET /missions must include 104; got " + listed);
        JsonNode p = get("/missions/plan?capacity=125&urgentOnly=false").json();
        assertEquals(List.of(103L, 101L, 104L, 102L), ids(p.get("selected"), "id"));
        assertEquals(125, p.get("energyUsed").asInt());
        assertEquals(0, p.get("energyRemaining").asInt());
    }
}
