package edu.practice.tickets.service;

import edu.practice.tickets.model.NewVipTicket;
import edu.practice.tickets.model.Ticket;
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
        // TODO Task 3: return the ticket, or throw TicketNotFoundException (create it in the exception package)
        //              with a message that names the id, e.g. "Ticket not found with id 999"
        throw new UnsupportedOperationException("Task 3");
    }

    public Ticket createVip(NewVipTicket request) {
        // TODO Task 5: reject a blank/missing eventName and a basePrice outside (0, 10000] with
        //              InvalidTicketException (create it). Nothing may be saved for invalid input.
        // TODO Task 4: create a VipTicket with a null id from the request, save it, and return the saved ticket.
        throw new UnsupportedOperationException("Task 4/5");
    }
}
