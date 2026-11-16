/**
 * Minimal Java re-indenter: indentation by brace depth (4 spaces), ignoring braces inside
 * strings, chars and comments. It does not reflow or reorder code — it only fixes leading whitespace.
 */
export function reindentJava(code: string): string {
  let depth = 0;
  let inBlockComment = false;
  const out: string[] = [];
  for (const raw of code.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      out.push("");
      continue;
    }
    // count braces outside strings/comments
    let opens = 0, closes = 0, leadingCloses = 0, seenCode = false;
    let inStr: string | null = null;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i], nx = line[i + 1];
      if (inBlockComment) {
        if (ch === "*" && nx === "/") { inBlockComment = false; i++; }
        continue;
      }
      if (inStr) {
        if (ch === "\\") i++;
        else if (ch === inStr) inStr = null;
        continue;
      }
      if (ch === "/" && nx === "/") break;
      if (ch === "/" && nx === "*") { inBlockComment = true; i++; continue; }
      if (ch === '"' || ch === "'") { inStr = ch; seenCode = true; continue; }
      if (ch === "}") { closes++; if (!seenCode) leadingCloses++; continue; }
      if (ch === "{") opens++;
      if (!/\s/.test(ch)) seenCode = true;
    }
    const indent = Math.max(0, depth - leadingCloses);
    out.push("    ".repeat(indent) + (line.startsWith("*") ? " " + line : line));
    depth = Math.max(0, depth + opens - closes);
  }
  return out.join("\n");
}
