"use client";

import { useEffect, useRef, useState } from "react";
import type { Diagnostic } from "@/runner/protocol";

type MonacoNS = typeof import("monaco-editor");
type EditorComp = typeof import("@monaco-editor/react").default;

/**
 * Monaco editor (loaded from its CDN by @monaco-editor/react) with a plain textarea fallback
 * when Monaco cannot load (e.g. offline). Compiler diagnostics are shown as squiggles.
 */
export function JavaEditor({
  value,
  onChange,
  readOnly,
  height = 360,
  diagnostics,
  path,
  onRun,
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  height?: number | string;
  diagnostics?: Diagnostic[];
  path?: string;
  onRun?: () => void;
}) {
  const [Editor, setEditor] = useState<EditorComp | null>(null);
  const [failed, setFailed] = useState(false);
  const monacoRef = useRef<MonacoNS | null>(null);
  const editorRef = useRef<import("monaco-editor").editor.IStandaloneCodeEditor | null>(null);
  const runRef = useRef(onRun);
  runRef.current = onRun;

  useEffect(() => {
    let alive = true;
    let loaded = false;
    const timer = setTimeout(() => alive && !loaded && setFailed(true), 12_000);
    import("@monaco-editor/react")
      // loader.init() fetches Monaco itself; if the CDN is unreachable it rejects (or the timer fires)
      .then((m) => m.loader.init().then(() => m))
      .then((m) => {
        loaded = true;
        if (alive) setEditor(() => m.default);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const monaco = monacoRef.current;
    const model = editorRef.current?.getModel();
    if (!monaco || !model) return;
    monaco.editor.setModelMarkers(
      model,
      "javac",
      (diagnostics ?? []).map((d) => ({
        startLineNumber: d.line,
        endLineNumber: d.line,
        startColumn: d.column ?? 1,
        endColumn: d.column ? d.column + 1 : model.getLineMaxColumn(Math.min(d.line, model.getLineCount())),
        message: d.message,
        severity: d.severity === "error" ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
      })),
    );
  }, [diagnostics, Editor]);

  if (failed && !Editor) {
    return (
      <div>
        <textarea
          aria-label="Java code editor"
          spellCheck={false}
          readOnly={readOnly}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              const t = e.currentTarget;
              const s = t.selectionStart;
              const next = value.slice(0, s) + "    " + value.slice(t.selectionEnd);
              onChange?.(next);
              requestAnimationFrame(() => (t.selectionStart = t.selectionEnd = s + 4));
            }
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) runRef.current?.();
          }}
          style={{ height }}
          className="w-full resize-y rounded-lg border border-line bg-[#0a0e15] p-3 font-mono text-[13px] leading-relaxed text-ink outline-none focus:border-accent/60"
        />
        <p className="mt-1 text-[11px] text-ink-3">Plain editor (Monaco could not load — it needs internet access the first time).</p>
      </div>
    );
  }

  if (!Editor) {
    return <div style={{ height }} className="flex items-center justify-center rounded-lg border border-line bg-[#0a0e15] text-xs text-ink-3">Loading editor…</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line" style={{ height }}>
      <Editor
        height="100%"
        language="java"
        theme="vs-dark"
        path={path}
        value={value}
        onChange={(v) => onChange?.(v ?? "")}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          monacoRef.current = monaco as unknown as MonacoNS;
          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current?.());
        }}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Cascadia Code', Consolas, monospace",
          scrollBeyondLastLine: false,
          tabSize: 4,
          automaticLayout: true,
          renderLineHighlight: "line",
          padding: { top: 8 },
          fixedOverflowWidgets: true,
        }}
      />
    </div>
  );
}
