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

    @GetMapping("/{id}")
    public Ticket one(@PathVariable("id") Long id) {
        return service.getById(id);
    }

    @PostMapping("/vip")
    @ResponseStatus(HttpStatus.CREATED)
    public Ticket createVip(@RequestBody NewVipTicket request) {
        return service.createVip(request);
    }
}
