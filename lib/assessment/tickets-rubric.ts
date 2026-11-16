import type { CodeFlag, RubricTask } from "./dispatch-rubric";

/**
 * Event Ticketing practice project (original, in the shape of the Lecture 6 mock briefing):
 * Task marks 18 / 22 / 16 / 14 / 10 copy the briefing; Section B checks copy its list.
 */
export const TICKETS_RUBRIC: RubricTask[] = [
  {
    id: "task1", section: "A", title: "Task 1 — Complete StandardTicket", marks: 18, skills: ["oop"],
    items: [
      { test: "t1_seat_row_field_and_getter", marks: 5, label: "private String seatRow + getSeatRow()" },
      { test: "t1_constructor_calls_super", marks: 5, label: "4-arg constructor passes id/eventName/basePrice to super(...)" },
      { test: "t1_summary", marks: 6, label: "getSummary() → \"Standard: <event>, row <seatRow>\"" },
      { test: "t1_seeds_have_rows", marks: 2, label: "seeds 1 and 2 use rows C and F" },
    ],
  },
  {
    id: "task2", section: "A", title: "Task 2 — Create VipTicket", marks: 22, skills: ["oop"],
    items: [
      { test: "t2_vip_extends_ticket", marks: 4, label: "VipTicket extends Ticket" },
      { test: "t2_two_constructors", marks: 4, label: "no-arg + full constructor" },
      { test: "t2_full_constructor_and_getter", marks: 4, label: "super(...) fields + isLoungeAccess()" },
      { test: "t2_summary_with_lounge", marks: 3, label: "summary with lounge access" },
      { test: "t2_summary_without_lounge", marks: 3, label: "summary without lounge" },
      { test: "t2_seed_vip_3", marks: 4, label: "VipTicket 3 seeded" },
    ],
  },
  {
    id: "task3", section: "A", title: "Task 3 — Not found → 404", marks: 16, skills: ["exceptions", "spring"],
    items: [
      { test: "t3_not_found_exception_is_unchecked", marks: 3, label: "TicketNotFoundException extends RuntimeException" },
      { test: "t3_service_throws_not_found", marks: 5, label: "service throws it, message names the id" },
      { test: "t3_handler_maps_to_404", marks: 8, label: "global handler → 404 + ErrorResponse" },
    ],
  },
  {
    id: "task4", section: "A", title: "Task 4 — GET by id + POST 201", marks: 14, skills: ["rest", "spring"],
    items: [
      { test: "t4_get_by_id_endpoint", marks: 6, label: "GET /tickets/{id} → 200" },
      { test: "t4_post_vip_returns_201", marks: 8, label: "POST /tickets/vip → 201 with saved ticket and new id" },
    ],
  },
  {
    id: "task5", section: "A", title: "Task 5 — Invalid data → 400", marks: 10, skills: ["exceptions", "rest"],
    items: [
      { test: "t5_invalid_exception_is_unchecked", marks: 2, label: "InvalidTicketException extends RuntimeException" },
      { test: "t5_service_rejects_invalid_and_saves_nothing", marks: 4, label: "blank name / price outside (0, 10000] rejected, nothing saved" },
      { test: "t5_handler_maps_to_400", marks: 4, label: "second handler → 400 + message" },
    ],
  },
  {
    id: "sectionB", section: "B", title: "Section B — Functional checks", marks: 20, skills: ["rest", "exam"],
    items: [
      { test: "b1_get_all_200_with_seeds_and_distinct_summaries", marks: 4, label: "GET all → 200, seeds, summaries differ by subclass" },
      { test: "b2_get_by_id_200", marks: 3, label: "GET by id → 200" },
      { test: "b3_unknown_id_404_not_500", marks: 3, label: "unknown id → 404, not 500 or empty 200" },
      { test: "b4_404_body_names_the_id", marks: 3, label: "404 body names the missing id" },
      { test: "b5_post_valid_201_then_retrievable", marks: 4, label: "POST valid → 201, saved, retrievable" },
      { test: "b6_post_invalid_400_and_nothing_saved", marks: 3, label: "POST invalid → 400, nothing saved" },
    ],
  },
];

/** Advisory flags for the ticketing project (never scored). */
export function reviewTicketCode(files: Record<string, string>): CodeFlag[] {
  const flags: CodeFlag[] = [];
  const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  const find = (suffix: string) => Object.entries(files).find(([p]) => p.endsWith(suffix));

  const ctrl = find("controller/TicketController.java");
  if (ctrl) {
    const c = strip(ctrl[1]);
    if (/\btry\s*\{/.test(c)) flags.push({ file: ctrl[0], severity: "warn", message: "try/catch in the controller hides exceptions from GlobalExceptionHandler." });
    if (/@PostMapping/.test(c) && !/CREATED|201/.test(c)) flags.push({ file: ctrl[0], severity: "warn", message: "POST without 201 — add @ResponseStatus(HttpStatus.CREATED)." });
  }
  for (const name of ["model/StandardTicket.java", "model/VipTicket.java"]) {
    const f = find(name);
    if (!f) continue;
    const c = strip(f[1]);
    if (!/@Override/.test(c)) flags.push({ file: f[0], severity: "warn", message: "No @Override on getSummary() — the compiler cannot check your override." });
    if (/private\s+(Long|long)\s+id\b|private\s+String\s+eventName/.test(c)) flags.push({ file: f[0], severity: "warn", message: "This subclass re-declares a field that already exists in Ticket. Use super(...) and the inherited getters instead." });
  }
  const svc = find("service/TicketService.java");
  if (svc && /orElse\s*\(\s*null\s*\)/.test(strip(svc[1]))) flags.push({ file: svc[0], severity: "warn", message: ".orElse(null) leads to a 200 with an empty body (Lecture 6). Throw TicketNotFoundException instead." });
  if (svc && /\.orElseThrow\s*\(\s*\)/.test(strip(svc[1]))) flags.push({ file: svc[0], severity: "warn", message: ".orElseThrow() with no argument throws NoSuchElementException → 500. Pass () -> new TicketNotFoundException(id)." });
  const handler = find("exception/GlobalExceptionHandler.java");
  if (handler && (strip(handler[1]).match(/@ExceptionHandler/g) ?? []).length < 2)
    flags.push({ file: handler[0], severity: "info", message: "The handler should end up with two @ExceptionHandler methods (404 and 400)." });
  return flags;
}
