import type { ReactNode } from "react";

const KEYWORDS = new Set(
  "abstract boolean break byte case catch char class continue default do double else enum extends final finally float for if implements import instanceof int interface long new package private protected public record return short static super switch this throw throws try void while var true false null".split(" "),
);

/** Small, dependency-free Java highlighter for static (non-editable) code. */
export function highlightJava(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)')|(@[A-Za-z]+)|\b(\d[\d_]*(?:\.\d+)?[LlFfDd]?)\b|\b([A-Za-z_][A-Za-z0-9_]*)\b/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const k = i++;
    if (m[1]) out.push(<span key={k} className="tok-com">{m[1]}</span>);
    else if (m[2]) out.push(<span key={k} className="tok-str">{m[2]}</span>);
    else if (m[3]) out.push(<span key={k} className="tok-ann">{m[3]}</span>);
    else if (m[4]) out.push(<span key={k} className="tok-num">{m[4]}</span>);
    else if (m[5]) {
      const w = m[5];
      if (KEYWORDS.has(w)) out.push(<span key={k} className="tok-kw">{w}</span>);
      else if (/^[A-Z]/.test(w)) out.push(<span key={k} className="tok-type">{w}</span>);
      else out.push(w);
    }
    last = m.index + m[0].length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export function CodeBlock({
  code,
  className,
  title,
  lineNumbers,
  highlightLine,
  onLineClick,
  selectedLine,
}: {
  code: string;
  className?: string;
  title?: ReactNode;
  lineNumbers?: boolean;
  highlightLine?: number;
  onLineClick?: (line: number) => void;
  selectedLine?: number;
}) {
  const lines = code.split("\n");
  const numbered = lineNumbers || onLineClick || highlightLine;
  return (
    <div className={`overflow-hidden rounded-lg border border-line bg-[#0a0e15] ${className ?? ""}`}>
      {title && <div className="border-b border-line px-3 py-1.5 font-mono text-[11px] text-ink-3">{title}</div>}
      <pre className="overflow-x-auto p-3 font-mono text-[12.5px] leading-relaxed text-ink">
        {numbered ? (
          lines.map((l, idx) => {
            const n = idx + 1;
            const active = n === highlightLine || n === selectedLine;
            const Tag = onLineClick ? "button" : "div";
            return (
              <Tag
                key={idx}
                type={onLineClick ? "button" : undefined}
                onClick={onLineClick ? () => onLineClick(n) : undefined}
                className={`flex w-full text-left ${onLineClick ? "cursor-pointer hover:bg-surface-3" : ""} ${active ? (n === selectedLine ? "bg-accent-soft" : "bg-warn-soft") : ""}`}
              >
                <span className="mr-3 inline-block w-6 shrink-0 select-none text-right text-ink-3">{n}</span>
                <code className="whitespace-pre">{highlightJava(l)}{l === "" ? " " : ""}</code>
              </Tag>
            );
          })
        ) : (
          <code>{highlightJava(code)}</code>
        )}
      </pre>
    </div>
  );
}
