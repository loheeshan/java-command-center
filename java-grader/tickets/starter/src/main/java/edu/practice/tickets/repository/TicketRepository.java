package edu.practice.tickets.repository;

import edu.practice.tickets.model.StandardTicket;
import edu.practice.tickets.model.Ticket;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

/** Supplied in-memory repository. Do not change its API. */
@Repository
public class TicketRepository {
    private final Map<Long, Ticket> tickets = new LinkedHashMap<>();
    private final AtomicLong nextId = new AtomicLong(100);

    public TicketRepository() {
        // TODO Task 1: once the seatRow constructor exists, give ticket 1 row "C" and ticket 2 row "F"
        tickets.put(1L, new StandardTicket(1L, "Jazz Night", 40.0));
        tickets.put(2L, new StandardTicket(2L, "Rock Arena", 55.0));
        // TODO Task 2: after creating VipTicket, seed new VipTicket(3L, "Jazz Night", 120.0, true)
    }

    public synchronized List<Ticket> findAll() {
        return new ArrayList<>(tickets.values());
    }

    public synchronized Optional<Ticket> findById(Long id) {
        return Optional.ofNullable(tickets.get(id));
    }

    /** Assigns a new id (100, 101, ...) when the ticket has none. */
    public synchronized Ticket save(Ticket ticket) {
        if (ticket.getId() == null) {
            ticket.setId(nextId.getAndIncrement());
        }
        tickets.put(ticket.getId(), ticket);
        return ticket;
    }
}
