import CodeEditor from "./CodeEditor";

export function InputPanel(props) {
  return (
    <CodeEditor
      lineNumbers={true}
      autoCloseBrackets={true}
      matchBrackets={true}
      showCursorWhenSelecting={true}
      tabSize={4}
      rulerColor="color-mix(in oklab, currentColor 10%, transparent)"
      {...props}
    />
  );
}

export function OutputPanel(props) {
  return (
    <CodeEditor
      readOnly={true}
      lineNumbers={true}
      rulerColor="currentColor"
      {...props}
    />
  );
}

export function DebugPanel({ value, autoFold }) {
  return (
    <CodeEditor
      readOnly={true}
      lineNumbers={false}
      foldGutter={true}
      autoFold={autoFold}
      value={value}
      mode="jsx"
    />
  );
}
