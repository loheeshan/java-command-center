// Visits every page in real (headless) Chrome: collects console errors, page errors,
// failed requests, and saves desktop + phone screenshots. Usage: node scripts/browser-check.mjs <outDir> [paths...]
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import path from "node:path";

const out = process.argv[2] ?? "screenshots";
const PAGES = process.argv.slice(3).length ? process.argv.slice(3) : ["/", "/roadmap", "/learn", "/learn/polymorphism", "/learn/interfaces-enums", "/learn/rest-crud-extras", "/oop-lab", "/algorithms", "/spring-boot", "/playground", "/exam", "/exam/tickets", "/exam/simulator", "/coverage", "/quizzes", "/revision", "/progress", "/resources"];
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
let problems = 0;
for (const [label, viewport] of [["desktop", { width: 1440, height: 900 }], ["phone", { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport });
  for (const p of PAGES) {
    const page = await ctx.newPage();
    const errs = [];
    page.on("console", (m) => { if (m.type() === "error" && !/monaco|jsdelivr|favicon/i.test(m.text())) errs.push("console: " + m.text().slice(0, 300)); });
    page.on("pageerror", (e) => errs.push("pageerror: " + e.message.slice(0, 300)));
    await page.goto("http://localhost:3000" + p, { waitUntil: "networkidle", timeout: 60000 }).catch((e) => errs.push("goto: " + e.message));
    await page.waitForTimeout(800);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (label === "phone" && overflow > 2) errs.push(`horizontal overflow ${overflow}px`);
    const name = (p === "/" ? "home" : p.slice(1).replaceAll("/", "_")) + `-${label}.png`;
    await page.screenshot({ path: path.join(out, name), fullPage: false });
    console.log(`${errs.length ? "PROBLEM" : "ok     "} ${label.padEnd(7)} ${p}${errs.length ? "\n   " + errs.join("\n   ") : ""}`);
    problems += errs.length;
    await page.close();
  }
  await ctx.close();
}
await browser.close();
console.log(`\n${problems} problem(s)`);
