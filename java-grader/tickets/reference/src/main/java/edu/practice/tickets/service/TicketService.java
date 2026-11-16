package edu.practice.tickets.service;

import edu.practice.tickets.exception.InvalidTicketException;
import edu.practice.tickets.exception.TicketNotFoundException;
import edu.practice.tickets.model.NewVipTicket;
import edu.practice.tickets.model.Ticket;
import edu.practice.tickets.model.VipTicket;
import edu.practice.tickets.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {
    private final TicketRepository repository;

    public TicketService(TicketRepository repository) {
        this.repository = repository;
    }

    public List<Ticket> getAll() {
        return repository.findAll();
    }

    public Ticket getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));
    }

    public Ticket createVip(NewVipTicket request) {
        if (request == null) {
            throw new InvalidTicketException("Request body is required.");
        }
        if (request.getEventName() == null || request.getEventName().isBlank()) {
            throw new InvalidTicketException("eventName must not be blank.");
        }
        if (request.getBasePrice() <= 0 || request.getBasePrice() > 10000) {
            throw new InvalidTicketException("basePrice must be greater than 0 and at most 10000.");
        }
        VipTicket ticket = new VipTicket(null, request.getEventName(),
                request.getBasePrice(), request.isLoungeAccess());
        return repository.save(ticket);
    }
}
