import { DISPATCH_RUBRIC, reviewDispatchCode, type CodeFlag, type RubricTask } from "@/lib/assessment/dispatch-rubric";
import { TICKETS_RUBRIC, reviewTicketCode } from "@/lib/assessment/tickets-rubric";
import { DISPATCH_BASE, PAPER_TASKS, TICKETS_BASE, TICKET_TASKS, type PaperTask } from "@/content/exam-paper";

export type ProjectId = "dispatch" | "tickets";

export interface ProjectConfig {
  id: ProjectId;
  title: string;
  short: string;
  origin: "university" | "original";
  description: string;
  base: string;
  packageName: string;
  defaultFile: string;
  tasks: PaperTask[];
  rubric: RubricTask[];
  review: (files: Record<string, string>) => CodeFlag[];
  testCount: number;
  /** Lab page */
  href: string;
}

export const PROJECTS: Record<ProjectId, ProjectConfig> = {
  dispatch: {
    id: "dispatch",
    title: "Emergency Dispatch Energy Planner API",
    short: "Dispatch (university mock)",
    origin: "university",
    description: "The university's MODERATE mock paper with its real starter project: overriding, overflow-safe arithmetic, a greedy planner, validation, 400/404, three endpoints.",
    base: DISPATCH_BASE,
    packageName: "edu.practice.dispatch",
    defaultFile: DISPATCH_BASE + "model/GroundMission.java",
    tasks: PAPER_TASKS,
    rubric: DISPATCH_RUBRIC,
    review: reviewDispatchCode,
    testCount: 33,
    href: "/exam",
  },
  tickets: {
    id: "tickets",
    title: "Event Ticketing API",
    short: "Ticketing (real-paper shape)",
    origin: "original",
    description: "An original project written in the exact task shape Lecture 6 describes for the real paper: complete a subclass, create a subclass with two constructors, 404 via a custom exception, GET by id + POST 201, and a 400 handler.",
    base: TICKETS_BASE,
    packageName: "edu.practice.tickets",
    defaultFile: TICKETS_BASE + "model/StandardTicket.java",
    tasks: TICKET_TASKS,
    rubric: TICKETS_RUBRIC,
    review: reviewTicketCode,
    testCount: 24,
    href: "/exam/tickets",
  },
};

export const PROJECT_LIST: ProjectConfig[] = [PROJECTS.tickets, PROJECTS.dispatch];

export function isProjectId(x: unknown): x is ProjectId {
  return x === "dispatch" || x === "tickets";
}
