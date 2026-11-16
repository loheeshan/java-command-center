package edu.practice.tickets.model;

public class VipTicket extends Ticket {
    private boolean loungeAccess;

    public VipTicket() {
        super();
    }

    public VipTicket(Long id, String eventName, double basePrice, boolean loungeAccess) {
        super(id, eventName, basePrice);
        this.loungeAccess = loungeAccess;
    }

    public boolean isLoungeAccess() {
        return loungeAccess;
    }

    @Override
    public String getSummary() {
        if (loungeAccess) {
            return "VIP: " + getEventName() + ", lounge access";
        }
        return "VIP: " + getEventName() + ", no lounge";
    }
}
