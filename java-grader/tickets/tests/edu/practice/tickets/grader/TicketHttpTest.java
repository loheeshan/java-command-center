package edu.practice.tickets.grader;

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
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/** Real HTTP against the running app: Task 3/4/5 endpoints and Section B checks. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class TicketHttpTest {

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

    private String base() { return "http://localhost:" + env.getProperty("local.server.port"); }

    private Res get(String path) throws Exception {
        HttpResponse<String> r = CLIENT.send(HttpRequest.newBuilder(URI.create(base() + path)).GET().build(), HttpResponse.BodyHandlers.ofString());
        return new Res(r.statusCode(), r.body());
    }

    private Res post(String path, String json) throws Exception {
        HttpResponse<String> r = CLIENT.send(HttpRequest.newBuilder(URI.create(base() + path))
                .header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(json)).build(), HttpResponse.BodyHandlers.ofString());
        return new Res(r.statusCode(), r.body());
    }

    private static String text(JsonNode n, String field) {
        JsonNode v = n.get(field);
        return v == null || v.isNull() ? null : v.asString();
    }

    private int count() throws Exception {
        return get("/tickets").json().size();
    }

    // ---------- Task 3 ----------
    @Test @Order(1)
    void t3_handler_maps_to_404() throws Exception {
        Res r = get("/tickets/999");
        assertEquals(404, r.status(), "unknown id must be 404; body: " + r.body());
        String msg = text(r.json(), "message");
        assertNotNull(msg, "404 body must be an ErrorResponse with a message");
        assertTrue(msg.contains("999"), "message should name the id: " + msg);
    }

    // ---------- Task 4 ----------
    @Test @Order(2)
    void t4_get_by_id_endpoint() throws Exception {
        Res r = get("/tickets/2");
        assertEquals(200, r.status(), r.body());
        assertEquals(2, r.json().get("id").asLong());
        assertTrue(String.valueOf(text(r.json(), "summary")).startsWith("Standard"), "summary of ticket 2: " + r.body());
    }

    @Test @Order(3)
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.AFTER_METHOD)
    void t4_post_vip_returns_201() throws Exception {
        Res r = post("/tickets/vip", "{\"eventName\":\"Opera Gala\",\"basePrice\":300,\"loungeAccess\":true}");
        assertEquals(201, r.status(), "POST must return 201 Created; body: " + r.body());
        JsonNode j = r.json();
        assertNotNull(j.get("id"), "response must include the new id");
        assertFalse(j.get("id").isNull(), "the saved ticket must have an id");
        assertEquals("Opera Gala", text(j, "eventName"));
        assertEquals("VIP: Opera Gala, lounge access", text(j, "summary"));
    }

    // ---------- Task 5 ----------
    @Test @Order(4)
    void t5_handler_maps_to_400() throws Exception {
        Res r = post("/tickets/vip", "{\"eventName\":\"\",\"basePrice\":50,\"loungeAccess\":false}");
        assertEquals(400, r.status(), "invalid input must be 400; body: " + r.body());
        String msg = text(r.json(), "message");
        assertNotNull(msg, "400 body must contain a message");
        assertFalse(msg.isBlank());
    }

    // ---------- Section B ----------
    @Test @Order(5)
    void b1_get_all_200_with_seeds_and_distinct_summaries() throws Exception {
        Res r = get("/tickets");
        assertEquals(200, r.status(), r.body());
        Set<Long> ids = new HashSet<>();
        Set<String> kinds = new HashSet<>();
        for (JsonNode n : r.json()) {
            ids.add(n.get("id").asLong());
            String s = text(n, "summary");
            assertNotNull(s, "every ticket must have a summary: " + n);
            kinds.add(s.split(":")[0]);
        }
        assertTrue(ids.containsAll(Set.of(1L, 2L, 3L)), "seeded tickets 1, 2, 3 expected; got " + ids);
        assertTrue(kinds.contains("Standard") && kinds.contains("VIP"), "the two subclasses' summaries must read differently: " + kinds);
    }

    @Test @Order(6)
    void b2_get_by_id_200() throws Exception {
        Res r = get("/tickets/3");
        assertEquals(200, r.status(), r.body());
        assertEquals(3, r.json().get("id").asLong());
    }

    @Test @Order(7)
    void b3_unknown_id_404_not_500() throws Exception {
        Res ok = get("/tickets/1");
        assertEquals(200, ok.status(), "GET /tickets/{id} must exist first; body: " + ok.body());
        Res r = get("/tickets/4242");
        assertEquals(404, r.status(), "not 500 and not an empty 200; body: " + r.body());
        assertNotNull(text(r.json(), "message"), "designed error body expected");
    }

    @Test @Order(8)
    void b4_404_body_names_the_id() throws Exception {
        String msg = text(get("/tickets/31337").json(), "message");
        assertNotNull(msg);
        assertTrue(msg.contains("31337"), "message must name the missing id: " + msg);
    }

    @Test @Order(9)
    void b6_post_invalid_400_and_nothing_saved() throws Exception {
        int before = count();
        Res r = post("/tickets/vip", "{\"eventName\":\"Gala\",\"basePrice\":-10,\"loungeAccess\":true}");
        assertEquals(400, r.status(), r.body());
        assertNotNull(text(r.json(), "message"));
        assertEquals(before, count(), "invalid POST must not save anything");
    }

    @Test @Order(10)
    void b5_post_valid_201_then_retrievable() throws Exception {
        int before = count();
        Res r = post("/tickets/vip", "{\"eventName\":\"Film Premiere\",\"basePrice\":90,\"loungeAccess\":false}");
        assertEquals(201, r.status(), r.body());
        long id = r.json().get("id").asLong();
        assertEquals(before + 1, count(), "the ticket must be saved");
        Res back = get("/tickets/" + id);
        assertEquals(200, back.status(), "the new ticket must be retrievable by its id");
        assertEquals("VIP: Film Premiere, no lounge", text(back.json(), "summary"));
    }
}
