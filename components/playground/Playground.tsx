"use client";

import { useState } from "react";
import { AlignLeft } from "lucide-react";
import type { SourceFile } from "@/runner/protocol";
import { LESSONS } from "@/content/modules";
import { CODING_TASKS } from "@/content/coding-tasks";
import { reindentJava } from "@/lib/execution/reindent";
import { useProgress } from "@/lib/progress/store";
import { Badge, Button, Card, CardHeader, cn, Tabs } from "@/components/ui/primitives";
import { CodeRunner } from "./CodeRunner";
import { CodingTaskRunner } from "@/components/lessons/CodingTaskRunner";

const HELLO: SourceFile[] = [
  {
    name: "Main.java",
    content: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");

        // Try: read input from the stdin box below
        Scanner in = new Scanner(System.in);
        if (in.hasNextInt()) {
            int n = in.nextInt();
            System.out.println("You typed " + n + ", doubled = " + (n * 2));
        }
    }
}
`,
  },
];

const EXAMPLES: { id: string; label: string; files: SourceFile[] }[] = [
  { id: "hello", label: "Hello World + stdin", files: HELLO },
  ...LESSONS.map((l) => ({ id: l.id, label: `${l.title.split(":")[0].slice(0, 46)} — example`, files: l.example.files })),
  ...LESSONS.map((l) => ({ id: `${l.id}-trace`, label: `${l.title.split(":")[0].slice(0, 46)} — trace`, files: [{ name: "Main.java", content: l.trace.code }] })),
];

export function Playground() {
  const p = useProgress();
  const [tab, setTab] = useState<"free" | "challenges">("free");
  const [exampleId, setExampleId] = useState("hello");
  const [files, setFiles] = useState<SourceFile[]>(HELLO);
  const [version, setVersion] = useState(0);
  const [taskId, setTaskId] = useState(CODING_TASKS[0].id);
  const task = CODING_TASKS.find((t) => t.id === taskId)!;

  const load = (id: string) => {
    const ex = EXAMPLES.find((e) => e.id === id)!;
    setExampleId(id);
    setFiles(ex.files);
    setVersion((v) => v + 1);
  };

  return (
    <div className="space-y-4">
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "free", label: "Free playground" }, { id: "challenges", label: `Practice challenges (${CODING_TASKS.length})` }]} />
      {tab === "free" ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-ink-3" htmlFor="example">Load example</label>
            <select id="example" value={exampleId} onChange={(e) => load(e.target.value)} className="max-w-full rounded-md border border-line bg-surface-2 px-2 py-1.5 text-sm text-ink">
              {EXAMPLES.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
            </select>
            <Button size="sm" variant="ghost" onClick={() => { setFiles((fs) => fs.map((f) => ({ ...f, content: reindentJava(f.content) }))); setVersion((v) => v + 1); }} title="Fix indentation by brace depth (4 spaces)">
              <AlignLeft size={13} /> Re-indent
            </Button>
          </div>
          <CodeRunner key={`${exampleId}-${version}`} files={files} storageKey={exampleId === "hello" && version === 0 ? "playground:hello" : undefined} showStdin layout="split" height={460} />
          <p className="text-xs text-ink-3">The public class with <code className="font-mono">main</code> runs. Multi-file examples show tabs. Limits: 8 s run time, 256 MB heap, 64 KB output. Spring Boot projects run in the Exam Lab instead.</p>
        </>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <Card className="h-fit">
            <CardHeader title="Challenges" sub="Each runs hidden tests on the JDK" />
            <ul className="p-2">
              {CODING_TASKS.map((t) => (
                <li key={t.id}>
                  <button onClick={() => setTaskId(t.id)} className={cn("flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm", t.id === taskId ? "bg-accent-soft text-accent" : "text-ink-2 hover:bg-surface-3")}>
                    <span className="truncate">{t.title}</span>
                    {p.coding[t.id]?.passedAt ? <Badge tone="ok">✓</Badge> : p.coding[t.id] ? <Badge tone="warn">{p.coding[t.id].bestPassed}/{p.coding[t.id].total}</Badge> : <Badge tone="neutral">{t.difficulty}</Badge>}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-4"><h2 className="mb-2 text-lg font-semibold text-ink">{task.title}</h2><CodingTaskRunner key={task.id} task={task} height={420} /></Card>
        </div>
      )}
    </div>
  );
}
