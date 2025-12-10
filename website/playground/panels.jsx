import { onMounted, onUnmounted, useTemplateRef, watch } from "vue";

const { CodeMirror } = window;

const CodeMirrorPanel = {
  name: "CodeMirrorPanel",
  props: {
    value: { type: String, required: true },
    selection: { type: Object, default: undefined },
    onChange: { type: Function, default: undefined },
    onSelectionChange: { type: Function, default: undefined },
    ruler: { type: Number, default: undefined },
    rulerColor: { type: String, default: undefined },
    overlayStart: { type: Number, default: undefined },
    overlayEnd: { type: Number, default: undefined },
    mode: { type: String, required: true },
    foldGutter: { type: Boolean, default: undefined },
    autoFold: { type: RegExp, default: undefined },
    codeSample: { type: String, default: undefined },
    lineNumbers: { type: Boolean, default: undefined },
    keyMap: { type: String, default: undefined },
    autoCloseBrackets: { type: Boolean, default: undefined },
    matchBrackets: { type: Boolean, default: undefined },
    showCursorWhenSelecting: { type: Boolean, default: undefined },
    tabSize: { type: Number, default: undefined },
    readOnly: { type: Boolean, default: undefined },
  },
  setup(props) {
    const textareaRef = useTemplateRef("textarea");
    let codeMirror = null;
    let cached = "";
    let overlay = null;

    const componentDidMount = () => {
      const options = {
        lineNumbers: props.lineNumbers,
        autoCloseBrackets: props.autoCloseBrackets,
        matchBrackets: props.matchBrackets,
        showCursorWhenSelecting: props.showCursorWhenSelecting,
        tabSize: props.tabSize,
        readOnly: props.readOnly,
        mode: props.mode,
      };

      // Only set keyMap if it exists in CodeMirror
      if (props.keyMap && window.CodeMirror.keyMap[props.keyMap]) {
        options.keyMap = props.keyMap;
      }

      options.rulers = [makeRuler(props)];
      options.gutters = makeGutters(props);

      codeMirror = CodeMirror.fromTextArea(textareaRef.value, options);
      codeMirror.on("change", handleChange);
      codeMirror.on("focus", handleFocus);
      codeMirror.on("beforeSelectionChange", handleSelectionChange);

      window.CodeMirror.keyMap.pcSublime["Ctrl-L"] = false;
      window.CodeMirror.keyMap.sublime["Ctrl-L"] = false;

      updateValue(props.value || "");
      updateSelection();
      updateOverlay();
    };

    const componentWillUnmount = () => {
      if (codeMirror) {
        codeMirror.toTextArea();
      }
    };

    const componentDidUpdate = (_, prevProps) => {
      if (props.value !== cached) {
        updateValue(props.value);
      }
      if (
        !isEqualSelection(props.selection, prevProps.selection) &&
        !isEqualSelection(props.selection, codeMirror.listSelections()[0])
      ) {
        updateSelection();
      }
      if (
        props.overlayStart !== prevProps.overlayStart ||
        props.overlayEnd !== prevProps.overlayEnd
      ) {
        updateOverlay();
      }
      if (props.mode !== prevProps.mode) {
        codeMirror.setOption("mode", props.mode);
      }
      if (props.ruler !== prevProps.ruler) {
        codeMirror.setOption("rulers", [makeRuler(props)]);
      }
      if (props.foldGutter !== prevProps.foldGutter) {
        codeMirror.setOption("gutters", makeGutters(props));
      }
    };

    const updateValue = (value) => {
      cached = value;
      codeMirror.setValue(value);

      if (props.autoFold instanceof RegExp) {
        const lines = value.split("\n");
        // going backwards to prevent unfolding folds created earlier
        for (let i = lines.length - 1; i >= 0; i--) {
          if (props.autoFold.test(lines[i])) {
            codeMirror.foldCode(i);
          }
        }
      }
    };

    const updateSelection = () => {
      codeMirror.setSelection(
        props.selection?.anchor ?? { line: 0, ch: 0 },
        props.selection?.head,
      );
    };

    const updateOverlay = () => {
      if (overlay) {
        codeMirror.removeOverlay(overlay);
      }
      if (props.overlayStart !== undefined) {
        const [start, end] = getIndexPosition(props.value, [
          props.overlayStart,
          props.overlayEnd,
        ]);
        overlay = createOverlay(start, end);
        codeMirror.addOverlay(overlay);
      }
    };

    const handleFocus = () => {
      if (codeMirror.getValue() === props.codeSample) {
        codeMirror.execCommand("selectAll");
      }
    };

    const handleChange = (doc, change) => {
      if (change.origin !== "setValue") {
        cached = doc.getValue();
        props.onChange?.(cached);
        updateOverlay();
      }
    };

    const handleSelectionChange = (doc, change) => {
      props.onSelectionChange?.(change.ranges[0]);
    };

    const render = () => (
      <div class="editor input">
        <textarea ref="textarea" />
      </div>
    );

    onMounted(componentDidMount);
    onUnmounted(componentWillUnmount);
    watch(() => props, componentDidUpdate, { deep: true });
    return render;
  },
};

function getIndexPosition(text, indexes) {
  indexes = [...indexes];
  let line = 0;
  let count = 0;
  let lineStart = 0;
  const result = [];

  while (indexes.length > 0) {
    const index = indexes.shift();

    while (count < index && count < text.length) {
      if (text[count] === "\n") {
        line++;
        lineStart = count + 1;
      }
      count++;
    }

    result.push({ line, pos: count - lineStart });
  }

  return result;
}

function createOverlay(start, end) {
  return {
    token(stream) {
      const { line } = stream.lineOracle;

      if (line < start.line || line > end.line) {
        stream.skipToEnd();
      } else if (line === start.line && stream.pos < start.pos) {
        stream.pos = start.pos;
      } else if (line === end.line) {
        if (stream.pos < end.pos) {
          stream.pos = end.pos;
          return "searching";
        }
        stream.skipToEnd();
      } else {
        stream.skipToEnd();
        return "searching";
      }
    },
  };
}

function makeRuler(props) {
  return { column: props.ruler, color: props.rulerColor };
}

function makeGutters(props) {
  return props.foldGutter
    ? ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
    : [];
}

function isEqualSelection(selection1, selection2) {
  const anchor1 = selection1?.anchor ?? { line: 0, ch: 0 };
  const head1 = selection1?.head ?? anchor1;
  const anchor2 = selection2?.anchor ?? { line: 0, ch: 0 };
  const head2 = selection2?.head ?? anchor2;
  return (
    head1.line === head2.line &&
    head1.ch === head2.ch &&
    anchor1.line === anchor2.line &&
    anchor1.ch === anchor2.ch
  );
}

export function InputPanel(props) {
  return (
    <CodeMirrorPanel
      lineNumbers={true}
      keyMap="sublime"
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
    <CodeMirrorPanel
      readOnly={true}
      lineNumbers={true}
      rulerColor="currentColor"
      {...props}
    />
  );
}

export function DebugPanel({ value, autoFold }) {
  return (
    <CodeMirrorPanel
      readOnly={true}
      lineNumbers={false}
      foldGutter={true}
      autoFold={autoFold}
      mode="jsx"
      value={value}
    />
  );
}
