package edu.practice.tickets.model;

public class StandardTicket extends Ticket {
    private String seatRow;

    public StandardTicket(Long id, String eventName, double basePrice) {
        super(id, eventName, basePrice);
    }

    public StandardTicket(Long id, String eventName, double basePrice, String seatRow) {
        super(id, eventName, basePrice);
        this.seatRow = seatRow;
    }

    public String getSeatRow() {
        return seatRow;
    }

    @Override
    public String getSummary() {
        return "Standard: " + getEventName() + ", row " + seatRow;
    }
}
