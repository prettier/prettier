import { useTemplateRef, onMounted, onUnmounted, watch } from "vue";

const { CodeMirror } = window;

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

const CodeMirrorPanel = {
  name: "CodeMirrorPanel",
  props: {
    value: String,
    selection: Object,
    onChange: Function,
    onSelectionChange: Function,
    ruler: Number,
    rulerColor: String,
    overlayStart: Number,
    overlayEnd: Number,
    mode: String,
    foldGutter: Boolean,
    autoFold: RegExp,
    codeSample: String,
    lineNumbers: Boolean,
    keyMap: String,
    autoCloseBrackets: Boolean,
    matchBrackets: Boolean,
    showCursorWhenSelecting: Boolean,
    tabSize: Number,
    readOnly: Boolean,
  },
  setup(props) {
    const textareaRef = useTemplateRef("textarea");
    let codeMirror = null;
    let cached = "";
    let overlay = null;

    const handleChange = (doc, change) => {
      if (change.origin !== "setValue") {
        cached = doc.getValue();
        props.onChange?.(cached);
        updateOverlay();
      }
    };

    const handleFocus = () => {
      if (codeMirror.getValue() === props.codeSample) {
        codeMirror.execCommand("selectAll");
      }
    };

    const handleSelectionChange = (doc, change) => {
      props.onSelectionChange?.(change.ranges[0]);
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

    onMounted(() => {
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

      if (window.CodeMirror.keyMap.pcSublime) {
        window.CodeMirror.keyMap.pcSublime["Ctrl-L"] = false;
      }
      if (window.CodeMirror.keyMap.sublime) {
        window.CodeMirror.keyMap.sublime["Ctrl-L"] = false;
      }

      updateValue(props.value || "");
      updateSelection();
      updateOverlay();
    });

    onUnmounted(() => {
      if (codeMirror) {
        codeMirror.toTextArea();
      }
    });

    watch(
      () => props.value,
      (newValue) => {
        if (codeMirror && newValue !== cached) {
          updateValue(newValue);
        }
      },
    );

    watch(
      () => props.selection,
      (newSelection, oldSelection) => {
        if (
          codeMirror &&
          !isEqualSelection(newSelection, oldSelection) &&
          !isEqualSelection(newSelection, codeMirror.listSelections()[0])
        ) {
          updateSelection();
        }
      },
      { deep: true },
    );

    watch(
      () => [props.overlayStart, props.overlayEnd],
      () => {
        if (codeMirror) {
          updateOverlay();
        }
      },
    );

    watch(
      () => props.mode,
      (newMode) => {
        if (codeMirror) {
          codeMirror.setOption("mode", newMode);
        }
      },
    );

    watch(
      () => props.ruler,
      () => {
        if (codeMirror) {
          codeMirror.setOption("rulers", [makeRuler(props)]);
        }
      },
    );

    watch(
      () => props.foldGutter,
      () => {
        if (codeMirror) {
          codeMirror.setOption("gutters", makeGutters(props));
        }
      },
    );

    watch(
      () => props.tabSize,
      (newTabSize) => {
        if (codeMirror) {
          codeMirror.setOption("tabSize", newTabSize);
        }
      },
    );

    watch(
      () => props.autoCloseBrackets,
      (newValue) => {
        if (codeMirror) {
          codeMirror.setOption("autoCloseBrackets", newValue);
        }
      },
    );

    watch(
      () => props.matchBrackets,
      (newValue) => {
        if (codeMirror) {
          codeMirror.setOption("matchBrackets", newValue);
        }
      },
    );

    return () => (
      <div class="editor input">
        <textarea ref="textarea" />
      </div>
    );
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

export const DebugPanel = {
  name: "DebugPanel",
  props: {
    value: String,
    autoFold: RegExp,
  },
  setup(props) {
    return () => {
      const { value, autoFold } = props;
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
    };
  },
};

export const InputPanel = {
  name: "InputPanel",
  props: {
    mode: String,
    ruler: Number,
    value: String,
    selection: Object,
    codeSample: String,
    overlayStart: Number,
    overlayEnd: Number,
    onChange: Function,
    onSelectionChange: Function,
    extraKeys: Object,
    foldGutter: Boolean,
  },
  setup(props) {
    return () => {
      const {
        mode,
        ruler,
        value,
        selection,
        codeSample,
        overlayStart,
        overlayEnd,
        onChange,
        onSelectionChange,
        extraKeys,
        foldGutter,
      } = props;
      return (
        <CodeMirrorPanel
          lineNumbers={true}
          keyMap="sublime"
          autoCloseBrackets={true}
          matchBrackets={true}
          showCursorWhenSelecting={true}
          tabSize={4}
          rulerColor="color-mix(in oklab, currentColor 10%, transparent)"
          mode={mode}
          ruler={ruler}
          value={value}
          selection={selection}
          codeSample={codeSample}
          overlayStart={overlayStart}
          overlayEnd={overlayEnd}
          onChange={onChange}
          onSelectionChange={onSelectionChange}
          extraKeys={extraKeys}
          foldGutter={foldGutter}
        />
      );
    };
  },
};

export const OutputPanel = {
  name: "OutputPanel",
  props: {
    mode: String,
    value: String,
    ruler: Number,
    overlayStart: Number,
    overlayEnd: Number,
  },
  setup(props) {
    return () => {
      const { mode, value, ruler, overlayStart, overlayEnd } = props;
      return (
        <CodeMirrorPanel
          readOnly={true}
          lineNumbers={true}
          rulerColor="currentColor"
          mode={mode}
          value={value}
          ruler={ruler}
          overlayStart={overlayStart}
          overlayEnd={overlayEnd}
        />
      );
    };
  },
};
