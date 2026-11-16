/**
 * Runner self-test: exercises the real JDK through compileAndRun().
 * Usage: npm run test:runner
 */
import { compileAndRun } from "./java";

type Check = { name: string; ok: boolean; detail: string };
const checks: Check[] = [];
const check = (name: string, ok: boolean, detail = "") => checks.push({ name, ok, detail });

async function main() {
  const hello = await compileAndRun({
    files: [{ name: "Main.java", content: 'public class Main { public static void main(String[] a){ System.out.println("Hello, Java " + (20 + 1)); } }' }],
  });
  check("hello world runs", hello.compile.ok && hello.run?.stdout.trim() === "Hello, Java 21", JSON.stringify(hello.run));

  const broken = await compileAndRun({ files: [{ name: "Main.java", content: "public class Main {\n  int x = 5\n}" }] });
  check("compile error reported", !broken.compile.ok && broken.compile.diagnostics.some((d) => d.line === 2), JSON.stringify(broken.compile.diagnostics));

  const loop = await compileAndRun({ files: [{ name: "Main.java", content: "public class Main { public static void main(String[] a){ while(true){} } }" }] });
  check("infinite loop is killed", loop.run?.timedOut === true, JSON.stringify({ ...loop.run, stdout: undefined }));

  const spam = await compileAndRun({ files: [{ name: "Main.java", content: 'public class Main { public static void main(String[] a){ for(;;) System.out.println("spam spam spam"); } }' }] });
  check("output is capped", spam.run?.truncated === true && (spam.run?.stdout.length ?? 0) <= 64 * 1024, `len=${spam.run?.stdout.length}`);

  const stdin = await compileAndRun({
    files: [{ name: "Main.java", content: "import java.util.Scanner; public class Main { public static void main(String[] a){ Scanner s=new Scanner(System.in); int n=s.nextInt(); System.out.println(n*2); } }" }],
    stdin: "21\n",
  });
  check("stdin is passed", stdin.run?.stdout.trim() === "42", JSON.stringify(stdin.run));

  const exc = await compileAndRun({ files: [{ name: "Main.java", content: "public class Main { public static void main(String[] a){ Math.toIntExact(3_000_000_000L); } }" }] });
  check("runtime exception surfaces", exc.run?.exitCode !== 0 && /ArithmeticException/.test(exc.run?.stderr ?? ""), exc.run?.stderr ?? "");

  const multi = await compileAndRun({
    files: [
      { name: "Shape.java", content: "public abstract class Shape { abstract double area(); }" },
      { name: "Sq.java", content: "public class Sq extends Shape { double area(){ return 4; } }" },
      { name: "Main.java", content: "public class Main { public static void main(String[] a){ Shape s = new Sq(); System.out.println(s.area()); } }" },
    ],
  });
  check("multi-file + polymorphism", multi.run?.stdout.trim() === "4.0", JSON.stringify(multi.run));

  let rejected = false;
  try {
    await compileAndRun({ files: [{ name: "../evil.java", content: "" }] });
  } catch {
    rejected = true;
  }
  check("path traversal rejected", rejected);

  for (const c of checks) console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name}${c.ok ? "" : "  -> " + c.detail.slice(0, 400)}`);
  const failed = checks.filter((c) => !c.ok).length;
  console.log(`\n${checks.length - failed}/${checks.length} runner checks passed`);
  process.exit(failed ? 1 : 0);
}

main();
