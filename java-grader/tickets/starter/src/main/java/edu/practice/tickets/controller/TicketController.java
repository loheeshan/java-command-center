package edu.practice.tickets.controller;

import edu.practice.tickets.model.NewVipTicket;
import edu.practice.tickets.model.Ticket;
import edu.practice.tickets.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tickets")
public class TicketController {
    private final TicketService service;

    public TicketController(TicketService service) {
        this.service = service;
    }

    @GetMapping
    public List<Ticket> all() {
        return service.getAll();
    }

    // TODO Task 4: GET /tickets/{id}  -> one ticket (delegate to service.getById)
    // TODO Task 4: POST /tickets/vip  -> 201 Created with the saved ticket (body: NewVipTicket)
    // No try/catch here: exceptions must reach GlobalExceptionHandler.
}
