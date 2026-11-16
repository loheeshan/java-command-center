/**
 * Verified on 16 Nov 2026 from each video's own page data (title, channel, length and the
 * creator-written chapter list). Chapter TITLES and START TIMES are the creators' own.
 * This app has not reviewed the content inside each chapter.
 */
export interface VideoChapter {
  n: number;
  start: string;
  title: string;
}

export interface VideoInfo {
  key: "java" | "spring";
  youtubeId: string;
  title: string;
  channel: string;
  duration: string;
  language: string;
  verifiedOn: string;
  note: string;
  chapters: VideoChapter[];
}

const j = (n: number, start: string, title: string): VideoChapter => ({ n, start, title });

export const VIDEOS: Record<"java" | "spring", VideoInfo> = {
  java: {
    key: "java",
    youtubeId: "xTtL8E4LzTQ",
    title: "Java Full Course for free ☕",
    channel: "Bro Code",
    duration: "12:00:00",
    language: "English",
    verifiedOn: "2026-11-16",
    note: "General Java course. It does not cover Spring Boot. Watch single chapters, then practise immediately.",
    chapters: [
      j(1, "0:00:00", "introduction to java"), j(2, "0:10:58", "variables"), j(3, "0:31:30", "user input"),
      j(4, "0:47:25", "mad libs game"), j(5, "0:54:08", "arithmetic"), j(6, "1:02:29", "shopping cart program"),
      j(7, "1:09:00", "if statements"), j(8, "1:22:28", "random numbers"), j(9, "1:27:28", "math class"),
      j(10, "1:42:37", "printf"), j(11, "1:56:14", "compound interest calculator"), j(12, "2:03:47", "nested if statements"),
      j(13, "2:10:20", "string methods"), j(14, "2:18:55", "substrings"), j(15, "2:27:00", "weight converter"),
      j(16, "2:35:19", "ternary operator"), j(17, "2:41:10", "temperature converter"), j(18, "2:49:05", "enhanced switches"),
      j(19, "2:57:42", "calculator program"), j(20, "3:09:58", "logical operators"), j(21, "3:21:23", "while loops"),
      j(22, "3:33:47", "number guessing game"), j(23, "3:43:33", "for loops"), j(24, "3:53:33", "break & continue"),
      j(25, "3:55:45", "nested loops"), j(26, "4:04:27", "methods"), j(27, "4:19:51", "overloaded methods"),
      j(28, "4:25:59", "variable scope"), j(29, "4:30:57", "banking program"), j(30, "4:51:26", "dice roller program"),
      j(31, "5:03:26", "arrays"), j(32, "5:12:35", "enter user input into an array"), j(33, "5:20:38", "search an array"),
      j(34, "5:28:07", "varargs"), j(35, "5:34:36", "2d arrays"), j(36, "5:44:13", "quiz game"),
      j(37, "5:59:14", "rock paper scissors"), j(38, "6:15:02", "slot machine"), j(39, "6:41:47", "object-oriented programming"),
      j(40, "6:51:38", "constructors"), j(41, "7:01:45", "overloaded constructors"), j(42, "7:08:22", "array of objects"),
      j(43, "7:14:07", "static"), j(44, "7:22:04", "inheritance"), j(45, "7:31:09", "super"),
      j(46, "7:41:37", "method overriding"), j(47, "7:46:08", "tostring method"), j(48, "7:51:58", "abstraction"),
      j(49, "8:01:30", "interfaces"), j(50, "8:07:44", "polymorphism"), j(51, "8:14:27", "runtime polymorphism"),
      j(52, "8:19:35", "getters and setters"), j(53, "8:29:39", "aggregation"), j(54, "8:39:02", "composition"),
      j(55, "8:45:17", "wrapper classes"), j(56, "8:55:51", "arraylists"), j(57, "9:05:29", "exception handling"),
      j(58, "9:13:28", "write files"), j(59, "9:21:58", "read files"), j(60, "9:28:50", "music player"),
      j(61, "9:43:10", "hangman game"), j(62, "10:11:42", "dates & times"), j(63, "10:20:24", "anonymous classes"),
      j(64, "10:25:23", "timertasks"), j(65, "10:31:45", "countdown timer"), j(66, "10:38:16", "generics"),
      j(67, "10:52:09", "hashmaps"), j(68, "11:02:38", "enums"), j(69, "11:12:45", "threading"),
      j(70, "11:23:04", "multithreading"), j(71, "11:31:02", "alarm clock"),
    ],
  },
  spring: {
    key: "spring",
    youtubeId: "52YKZV_Qj3o",
    title: "Spring Boot Full Course with Project | Tamil | code io",
    channel: "code io - Tamil",
    duration: "6:37:36",
    language: "Tamil (with English technical terms)",
    verifiedOn: "2026-11-16",
    note: "Taught in Tamil. Database, Lombok, security and JWT chapters are beyond what the practical needs — skip them before Friday.",
    chapters: [
      j(1, "0:00:00", "What is SpringBoot?"), j(2, "0:01:34", "Installation and Setup"), j(3, "0:05:36", "Creating First Spring Project"),
      j(4, "0:16:26", "Hello World API"), j(5, "0:23:11", "API Basics"), j(6, "0:32:03", "HTTP Request Method Types"),
      j(7, "0:38:17", "Project Hierarchy Explained"), j(8, "0:59:08", "What is Maven?"), j(9, "1:21:30", "Spring vs Spring Boot"),
      j(10, "1:24:16", "Inputs to API"), j(11, "1:28:00", "RequestMapping, PathVariable, RequestParam, RequestBody"),
      j(12, "1:48:42", "PutMapping, DeleteMapping"), j(13, "1:52:13", "Dependency Injection, Inversion of Control and Spring Annotations"),
      j(14, "2:19:15", "Todo CRUD API"), j(15, "3:22:55", "Database Connection"), j(16, "3:37:30", "Pagination"),
      j(17, "3:46:04", "Validations"), j(18, "3:53:52", "Lombok"), j(19, "3:57:10", "Logging"), j(20, "4:00:23", "Swagger Doc"),
      j(21, "4:11:37", "Spring Security Basics"), j(22, "4:31:30", "JWT Token based Auth"), j(23, "5:43:00", "Connecting With Frontend"),
    ],
  },
};

export function toSeconds(ts: string): number {
  return ts.split(":").map(Number).reduce((acc, v) => acc * 60 + v, 0);
}

/** End of a chapter = start of the next one (or the video end). */
export function chapterRange(key: "java" | "spring", n: number): { start: number; end: number } {
  const v = VIDEOS[key];
  const idx = v.chapters.findIndex((c) => c.n === n);
  const start = toSeconds(v.chapters[idx].start);
  const next = v.chapters[idx + 1];
  return { start, end: next ? toSeconds(next.start) : toSeconds(v.duration) };
}
