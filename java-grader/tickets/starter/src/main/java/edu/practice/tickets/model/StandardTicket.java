package edu.practice.tickets.model;

public class StandardTicket extends Ticket {

    // TODO Task 1.1: add a private String field seatRow

    public StandardTicket(Long id, String eventName, double basePrice) {
        super(id, eventName, basePrice);
    }

    // TODO Task 1.2: add a constructor (Long id, String eventName, double basePrice, String seatRow)
    //                that initialises the inherited fields with super(...) and then sets seatRow

    // TODO Task 1.3: add getSeatRow()

    @Override
    public String getSummary() {
        // TODO Task 1.4: return "Standard: <eventName>, row <seatRow>", e.g. "Standard: Jazz Night, row C"
        throw new UnsupportedOperationException("Task 1");
    }
}
