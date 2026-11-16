package edu.practice.tickets.grader;

import edu.practice.tickets.model.NewVipTicket;
import edu.practice.tickets.model.StandardTicket;
import edu.practice.tickets.model.Ticket;
import edu.practice.tickets.repository.TicketRepository;
import edu.practice.tickets.service.TicketService;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;

import static org.junit.jupiter.api.Assertions.*;

/** Tasks 1, 2, 3 (service part) and 5 (service part). */
class TicketUnitTest {

    // ---------- Task 1: complete StandardTicket ----------

    @Test
    void t1_seat_row_field_and_getter() throws Exception {
        Field f = StandardTicket.class.getDeclaredField("seatRow");
        assertEquals(String.class, f.getType(), "seatRow must be a String");
        assertTrue(Modifier.isPrivate(f.getModifiers()), "seatRow must be private");
        assertEquals("C", TicketProbe.call(TicketProbe.standard(1L, "Jazz Night", 40.0, "C"), "getSeatRow"));
    }

    @Test
    void t1_constructor_calls_super() {
        Ticket t = TicketProbe.standard(7L, "Opera", 33.5, "A");
        assertEquals(7L, t.getId(), "id must be passed to super(...)");
        assertEquals("Opera", t.getEventName(), "eventName must be passed to super(...)");
        assertEquals(33.5, t.getBasePrice(), 1e-9, "basePrice must be passed to super(...)");
    }

    @Test
    void t1_summary() {
        assertEquals("Standard: Jazz Night, row C", TicketProbe.standard(1L, "Jazz Night", 40.0, "C").getSummary());
        assertEquals("Standard: Rock Arena, row F", TicketProbe.standard(2L, "Rock Arena", 55.0, "F").getSummary());
    }

    @Test
    void t1_seeds_have_rows() {
        TicketRepository repo = new TicketRepository();
        assertEquals("C", TicketProbe.call(repo.findById(1L).orElseThrow(), "getSeatRow"), "ticket 1 should be row C");
        assertEquals("F", TicketProbe.call(repo.findById(2L).orElseThrow(), "getSeatRow"), "ticket 2 should be row F");
    }

    // ---------- Task 2: create VipTicket ----------

    @Test
    void t2_vip_extends_ticket() {
        Class<?> c = TicketProbe.vip();
        assertEquals(Ticket.class, c.getSuperclass(), "VipTicket must extend Ticket");
        assertFalse(Modifier.isAbstract(c.getModifiers()), "VipTicket must be concrete");
    }

    @Test
    void t2_two_constructors() {
        Class<?> c = TicketProbe.vip();
        assertDoesNotThrow(() -> c.getConstructor(), "VipTicket needs a public no-arg constructor (for JSON)");
        assertDoesNotThrow(() -> c.getConstructor(Long.class, String.class, double.class, boolean.class),
                "VipTicket needs a public constructor (Long id, String eventName, double basePrice, boolean loungeAccess)");
    }

    @Test
    void t2_full_constructor_and_getter() {
        Ticket t = TicketProbe.vip(9L, "Gala", 250.0, true);
        assertEquals(9L, t.getId());
        assertEquals("Gala", t.getEventName());
        assertEquals(250.0, t.getBasePrice(), 1e-9);
        assertEquals(Boolean.TRUE, TicketProbe.call(t, "isLoungeAccess", "getLoungeAccess"));
    }

    @Test
    void t2_summary_with_lounge() {
        assertEquals("VIP: Gala, lounge access", TicketProbe.vip(9L, "Gala", 250.0, true).getSummary());
    }

    @Test
    void t2_summary_without_lounge() {
        assertEquals("VIP: Gala, no lounge", TicketProbe.vip(9L, "Gala", 250.0, false).getSummary());
    }

    @Test
    void t2_seed_vip_3() {
        TicketRepository repo = new TicketRepository();
        Ticket t = repo.findById(3L).orElseThrow(() -> new AssertionError("ticket 3 (VipTicket) must be seeded"));
        assertEquals(TicketProbe.vip(), t.getClass());
        assertEquals("VIP: Jazz Night, lounge access", t.getSummary());
        assertEquals(3, repo.findAll().size(), "exactly three seeded tickets");
    }

    // ---------- Task 3: TicketNotFoundException ----------

    @Test
    void t3_not_found_exception_is_unchecked() {
        assertTrue(RuntimeException.class.isAssignableFrom(TicketProbe.notFound()), "TicketNotFoundException must extend RuntimeException");
    }

    @Test
    void t3_service_throws_not_found() {
        TicketService s = new TicketService(new TicketRepository());
        assertEquals(1L, s.getById(1L).getId());
        RuntimeException e = assertThrows(RuntimeException.class, () -> s.getById(999L));
        assertEquals(TicketProbe.notFound(), e.getClass(), "unknown id must throw TicketNotFoundException, not " + e.getClass().getSimpleName());
        assertNotNull(e.getMessage());
        assertTrue(e.getMessage().contains("999"), "message should name the id; was: " + e.getMessage());
    }

    // ---------- Task 5: InvalidTicketException ----------

    @Test
    void t5_invalid_exception_is_unchecked() {
        assertTrue(RuntimeException.class.isAssignableFrom(TicketProbe.invalid()), "InvalidTicketException must extend RuntimeException");
    }

    @Test
    void t5_service_rejects_invalid_and_saves_nothing() {
        TicketRepository repo = new TicketRepository();
        TicketService s = new TicketService(repo);
        int before = repo.findAll().size();
        NewVipTicket[] bad = {
                new NewVipTicket("", 50, true), new NewVipTicket("   ", 50, true), new NewVipTicket(null, 50, true),
                new NewVipTicket("Gala", 0, true), new NewVipTicket("Gala", -5, true), new NewVipTicket("Gala", 10000.01, true)
        };
        for (NewVipTicket r : bad) {
            RuntimeException e = assertThrows(RuntimeException.class, () -> s.createVip(r),
                    "should reject eventName='" + r.getEventName() + "' basePrice=" + r.getBasePrice());
            assertEquals(TicketProbe.invalid(), e.getClass(), "invalid input must throw InvalidTicketException, not " + e.getClass().getSimpleName());
        }
        assertEquals(before, repo.findAll().size(), "nothing may be saved for invalid input");
        assertDoesNotThrow(() -> s.createVip(new NewVipTicket("Gala", 10000, false)), "10000 is the inclusive upper limit");
    }
}
