import { Fragment, type ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";

/** Inline: **bold**, `code`. Kept deliberately small — curriculum content uses only these. */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith("**")) out.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) out.push(<code key={key}>{tok.slice(1, -1)}</code>);
    else out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/**
 * Block-level: paragraphs, "- " lists and ```java fences.
 * `inline` renders only <span>s so it is valid inside <p>, <button>, <label> etc.
 */
export function Markdown({ text, className, inline: inlineMode }: { text: string; className?: string; inline?: boolean }) {
  if (inlineMode) {
    return <span className={`prose-jcc ${className ?? ""}`}>{inline(text.replace(/\s*\n\s*/g, " "), "i")}</span>;
  }
  const blocks: ReactNode[] = [];
  const parts = text.split(/```(?:java|json|bash|text)?\n?([\s\S]*?)```/g);
  parts.forEach((part, pi) => {
    if (pi % 2 === 1) {
      blocks.push(<CodeBlock key={`c${pi}`} code={part.replace(/\n$/, "")} className="my-2" />);
      return;
    }
    const lines = part.split("\n");
    let list: string[] = [];
    let para: string[] = [];
    const flushList = () => {
      if (list.length) {
        const items = list;
        blocks.push(
          <ul key={`l${pi}-${blocks.length}`}>
            {items.map((l, i) => (
              <li key={i}>{inline(l, `li${pi}-${i}`)}</li>
            ))}
          </ul>,
        );
        list = [];
      }
    };
    const flushPara = () => {
      if (para.length) {
        const t = para.join(" ");
        blocks.push(<p key={`p${pi}-${blocks.length}`}>{inline(t, `p${pi}-${blocks.length}`)}</p>);
        para = [];
      }
    };
    for (const raw of lines) {
      const line = raw.trimEnd();
      if (/^\s*- /.test(line)) {
        flushPara();
        list.push(line.replace(/^\s*- /, ""));
      } else if (line.trim() === "") {
        flushPara();
        flushList();
      } else {
        flushList();
        para.push(line.trim());
      }
    }
    flushPara();
    flushList();
  });
  return <div className={`prose-jcc text-sm text-ink-2 ${className ?? ""}`}>{blocks.map((b, i) => <Fragment key={i}>{b}</Fragment>)}</div>;
}
