/**
 * Exam timing. All instants are absolute (ISO with +05:30), so the countdown is correct
 * no matter which time zone the browser is in. Display always uses Asia/Colombo.
 */
export const TIME_ZONE = "Asia/Colombo";
export const EXAM_START = new Date("2026-11-20T13:30:00+05:30");
export const PREP_START = new Date("2026-11-17T19:00:00+05:30");
export const EXAM_DURATION_MIN = 100;
export const EXAM_SUBMIT_WINDOW_MIN = 10;

export interface Countdown {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  past: boolean;
}

export function countdown(target: Date, now: Date): Countdown {
  const totalMs = target.getTime() - now.getTime();
  const past = totalMs <= 0;
  let s = Math.max(0, Math.floor(totalMs / 1000));
  const days = Math.floor(s / 86400);
  s -= days * 86400;
  const hours = Math.floor(s / 3600);
  s -= hours * 3600;
  const minutes = Math.floor(s / 60);
  return { totalMs, days, hours, minutes, seconds: s - minutes * 60, past };
}

export function formatColombo(d: Date, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, ...opts }).format(d);
}

/** "2026-11-18" for the Colombo calendar day containing `d`. */
export function colomboDateKey(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  return parts;
}

export function formatClock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
