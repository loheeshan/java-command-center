package edu.practice.tickets.model;

/** Request body for POST /tickets/vip. Supplied. */
public class NewVipTicket {
    private String eventName;
    private double basePrice;
    private boolean loungeAccess;

    public NewVipTicket() {}

    public NewVipTicket(String eventName, double basePrice, boolean loungeAccess) {
        this.eventName = eventName;
        this.basePrice = basePrice;
        this.loungeAccess = loungeAccess;
    }

    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }
    public double getBasePrice() { return basePrice; }
    public void setBasePrice(double basePrice) { this.basePrice = basePrice; }
    public boolean isLoungeAccess() { return loungeAccess; }
    public void setLoungeAccess(boolean loungeAccess) { this.loungeAccess = loungeAccess; }
}
