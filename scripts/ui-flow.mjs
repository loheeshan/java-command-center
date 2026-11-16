// End-to-end learner flow in real (headless) Chrome against a running app + runner.
// Usage: node scripts/ui-flow.mjs [screenshotDir]
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import path from "node:path";

const OUT = process.argv[2] ?? "screenshots";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message.slice(0, 200)));
const results = [];
const step = async (name, fn) => {
  try {
    await fn();
    results.push(["PASS", name]);
  } catch (e) {
    results.push(["FAIL", name + " — " + String(e.message ?? e).split("\n")[0].slice(0, 200)]);
    await page.screenshot({ path: path.join(OUT, `fail-${results.length}.png`) }).catch(() => {});
  }
};
const shot = (n) => page.screenshot({ path: path.join(OUT, n), fullPage: false });

await step("1. dashboard shows the start→finish path with a Start button", async () => {
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.getByText("Your path: start → exam-ready").waitFor();
  await page.getByText("How the Command Center works").waitFor();
  await page.getByRole("button", { name: /Start here/ }).first().waitFor();
  await shot("flow-1-dashboard.png");
});

await step("2. countdown targets Fri 20 Nov 13:30 Asia/Colombo", async () => {
  await page.getByText(/Friday, 20 November 2026, 13:30/).waitFor();
});

await step("3. Start here opens the Week 1 lecture guide; a guide example runs on the JDK", async () => {
  await page.getByRole("button", { name: /Start here/ }).first().click();
  await page.waitForURL(/\/lectures\/week-1/);
  await page.getByRole("heading", { name: /Java from zero/ }).waitFor();
  await page.getByRole("button", { name: "Run on JDK" }).first().click();
  await page.getByText("matches expected output").first().waitFor({ timeout: 60000 });
  await page.getByRole("button", { name: /Mark this guide finished/ }).click();
  await page.getByRole("button", { name: /Guide finished/ }).waitFor();
  await shot("flow-3-guide.png");
  await page.goto(BASE + "/learn/java-quickstart", { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /Java Quick Start/ }).waitFor();
  await page.getByText("New to this topic?").waitFor();
});

await step("4. lesson example runs on the real JDK and matches expected output", async () => {
  await page.getByRole("button", { name: "Run on JDK" }).first().click();
  await page.getByText("matches expected output").waitFor({ timeout: 60000 });
  await page.getByText(/Real JDK/).first().waitFor();
  await shot("flow-4-run.png");
});

await step("5. a quiz answer is graded", async () => {
  const card = page.locator("text=What does `javac` produce").first();
  await card.scrollIntoViewIfNeeded().catch(() => {});
  await page.getByRole("button", { name: /Main\.class containing bytecode/ }).click();
  await page.getByRole("button", { name: "Check answer" }).first().click();
  await page.getByText("Correct", { exact: true }).first().waitFor();
});

await step("6. mark lesson complete → path advances after refresh (persistence)", async () => {
  await page.getByRole("button", { name: /Mark lesson complete/ }).click();
  await page.getByRole("button", { name: /Completed — undo/ }).waitFor();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByText(/1\/13 stages/).waitFor();
  await page.getByText(/You are here — stage 2/).waitFor();
  await page.goto(BASE + "/lectures", { waitUntil: "networkidle" });
  await page.getByText("1/7", { exact: true }).waitFor();
});

await step("7. Ticketing lab: untouched starter builds and fails every test", async () => {
  await page.goto(BASE + "/exam/tickets", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Compile & run tests/ }).click();
  await page.getByText("BUILD SUCCESS").waitFor({ timeout: 240000 });
  await page.getByText("0/24 tests passed").waitFor();
  await shot("flow-7-tickets.png");
});

await step("8. simulator offers both papers", async () => {
  await page.goto(BASE + "/exam/simulator", { waitUntil: "networkidle" });
  await page.getByText("real-paper shape").first().waitFor();
  await page.getByText("university mock").first().waitFor();
});

await step("9. coverage page lists topics with statuses", async () => {
  await page.goto(BASE + "/coverage", { waitUntil: "networkidle" });
  await page.getByText(/covered$/).first().waitFor();
  await page.getByText("The other two sample assessments").waitFor();
});

await step("10. OOP lab shows guided steps", async () => {
  await page.goto(BASE + "/oop-lab", { waitUntil: "networkidle" });
  await page.getByText("How to use this lab").waitFor();
  await page.getByText("STEP 4").waitFor();
  await shot("flow-10-ooplab.png");
});

if (errors.length) results.push(["FAIL", "page errors: " + errors.join(" | ")]);
for (const [s, n] of results) console.log(s.padEnd(5), n);
console.log(`\n${results.filter((r) => r[0] === "PASS").length}/${results.length} passed`);
await browser.close();
process.exit(results.some((r) => r[0] === "FAIL") ? 1 : 0);
