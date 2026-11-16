package edu.practice.tickets.model;

/** Supplied abstract parent. Do not edit. */
public abstract class Ticket {
    private Long id;
    private String eventName;
    private double basePrice;

    protected Ticket() {}

    protected Ticket(Long id, String eventName, double basePrice) {
        this.id = id;
        this.eventName = eventName;
        this.basePrice = basePrice;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEventName() { return eventName; }
    public double getBasePrice() { return basePrice; }

    /** A one-line description; Jackson includes it in JSON as "summary". */
    public abstract String getSummary();
}
