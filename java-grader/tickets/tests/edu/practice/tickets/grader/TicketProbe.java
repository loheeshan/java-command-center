package edu.practice.tickets.grader;

import edu.practice.tickets.model.Ticket;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/** Reflection helpers: classes the student creates are optional, so the suite always compiles. */
final class TicketProbe {
    private TicketProbe() {}

    static Class<?> cls(String fqcn, String what) {
        try {
            return Class.forName(fqcn);
        } catch (ClassNotFoundException e) {
            throw new AssertionError(what + " not found: create " + fqcn);
        }
    }

    static Class<?> vip() { return cls("edu.practice.tickets.model.VipTicket", "VipTicket"); }
    static Class<?> notFound() { return cls("edu.practice.tickets.exception.TicketNotFoundException", "TicketNotFoundException"); }
    static Class<?> invalid() { return cls("edu.practice.tickets.exception.InvalidTicketException", "InvalidTicketException"); }

    static Object construct(Class<?> c, Class<?>[] types, Object... args) {
        try {
            Constructor<?> k = c.getConstructor(types);
            return k.newInstance(args);
        } catch (NoSuchMethodException e) {
            throw new AssertionError(c.getSimpleName() + " needs a public constructor " + sig(types));
        } catch (InvocationTargetException e) {
            throw new AssertionError(c.getSimpleName() + " constructor threw " + e.getCause());
        } catch (ReflectiveOperationException e) {
            throw new AssertionError("Could not create " + c.getSimpleName() + ": " + e);
        }
    }

    static String sig(Class<?>[] types) {
        StringBuilder sb = new StringBuilder("(");
        for (int i = 0; i < types.length; i++) sb.append(i == 0 ? "" : ", ").append(types[i].getSimpleName());
        return sb.append(")").toString();
    }

    static Ticket standard(Long id, String name, double price, String row) {
        return (Ticket) construct(edu.practice.tickets.model.StandardTicket.class,
                new Class<?>[]{Long.class, String.class, double.class, String.class}, id, name, price, row);
    }

    static Ticket vip(Long id, String name, double price, boolean lounge) {
        Object o = construct(vip(), new Class<?>[]{Long.class, String.class, double.class, boolean.class}, id, name, price, lounge);
        if (!(o instanceof Ticket t)) throw new AssertionError("VipTicket must extend Ticket");
        return t;
    }

    static Object call(Object target, String... names) {
        for (String n : names) {
            try {
                Method m = target.getClass().getMethod(n);
                return m.invoke(target);
            } catch (NoSuchMethodException ignored) {
                // try next
            } catch (InvocationTargetException e) {
                if (e.getCause() instanceof RuntimeException re) throw re;
                throw new AssertionError(e.getCause());
            } catch (IllegalAccessException e) {
                throw new AssertionError(n + " is not public");
            }
        }
        throw new AssertionError("Expected a public method named one of " + String.join(", ", names));
    }
}
