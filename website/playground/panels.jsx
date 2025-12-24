import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  selectAll,
} from "@codemirror/commands";
import {
  bracketMatching,
  defaultHighlightStyle,
  foldable,
  foldEffect,
  foldGutter as foldGutterExt,
  foldKeymap,
  syntaxHighlighting,
} from "@codemirror/language";
import {
  Compartment,
  EditorState,
  StateEffect,
  StateField,
} from "@codemirror/state";
import {
  Decoration,
  EditorView,
  keymap,
  lineNumbers as lineNumbersExt,
} from "@codemirror/view";
import { onMounted, onUnmounted, useTemplateRef, watch } from "vue";

function setup(props, { emit }) {
  const editorRef = useTemplateRef("editorRef");

  let _codeMirror = null;
  let _cached = "";
  const _overlay = StateEffect.define();

  const overlayField = StateField.define({
    create() {
      return Decoration.none;
    },
    update(decorations, tr) {
      for (const effect of tr.effects) {
        if (effect.is(_overlay)) {
          const { start, end } = effect.value;
          if (start !== undefined && end !== undefined && start < end) {
            return Decoration.set([overlayMark.range(start, end)]);
          }
          return Decoration.none;
        }
      }
      return decorations.map(tr.changes);
    },
    provide: (f) => EditorView.decorations.from(f),
  });

  const overlayMark = Decoration.mark({
    class: "cm-overlay-highlight",
  });

  const languageExt = new Compartment();
  const rulerTheme = new Compartment();
  const foldGutterCompartment = new Compartment();

  const onChange = (value) => {
    emit("change", value);
  };

  const createRulerTheme = (printWidth, color) => {
    if (!printWidth) {
      return EditorView.theme({});
    }

    return EditorView.theme({
      ".cm-content::before": {
        content: '""',
        position: "absolute",
        top: "0",
        bottom: "0",
        left: `${printWidth}ch`,
        width: "1px",
        backgroundColor: color || "var(--color-gray-300)",
        pointerEvents: "none",
        zIndex: "1",
      },
    });
  };

  async function getLanguageExtension(mode) {
    switch (mode) {
      case "css": {
        const { css } = await import("@codemirror/lang-css");
        return css();
      }
      case "graphql": {
        const { graphql } = await import("cm6-graphql");
        return graphql();
      }
      case "markdown": {
        const { markdown } = await import("@codemirror/lang-markdown");
        return markdown();
      }
      default: {
        const { javascript } = await import("@codemirror/lang-javascript");
        return javascript({ jsx: true, typescript: true });
      }
    }
  }

  const componentDidMount = async () => {
    const options = { ...props };
    for (const property of [
      "ruler",
      "rulerColor",
      "value",
      "selection",
      "onChange",
    ]) {
      delete options[property];
    }

    for (const [key, value] of Object.entries(options)) {
      if (value === undefined) {
        delete options[key];
      }
    }

    const state = EditorState.create({
      doc: props.value || "",
      extensions: [
        props.lineNumbers && lineNumbersExt(),
        foldGutterCompartment.of(props.foldGutter ? foldGutterExt() : []),
        props.autoCloseBrackets && closeBrackets(),
        props.matchBrackets && bracketMatching(),

        languageExt.of(await getLanguageExtension(props.mode)),
        syntaxHighlighting(defaultHighlightStyle),
        overlayField,

        history(),
        keymap.of([
          ...defaultKeymap,
          ...closeBracketsKeymap,
          ...historyKeymap,
          ...foldKeymap,
          indentWithTab,
          { key: "Ctrl-l", run: () => false },
          ...(props.extraKeys
            ? Object.entries(props.extraKeys).map(([key, cmd]) => ({
                key,
                run: cmd,
              }))
            : []),
        ]),

        EditorState.tabSize.of(props.tabSize ?? 4),
        EditorState.readOnly.of(props.readOnly ?? false),

        rulerTheme.of(createRulerTheme(props.ruler, props.rulerColor)),
        EditorView.theme({
          "&": {
            height: "100%",
          },
          "&.cm-focused": {
            outline: "none",
          },
          ".cm-gutters": {
            backgroundColor: "",
            padding: "0 8px",
            borderRight: "none",
          },
          ".cm-content": {
            position: "relative",
          },
        }),

        EditorView.domEventHandlers({
          focus(event, view) {
            if (view.state.doc.toString() === props.codeSample) {
              selectAll(view);
            }
          },
        }),

        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const value = update.state.doc.toString();
            if (value !== _cached) {
              handleChange(value);
            }
          }

          if (update.selectionSet) {
            const selection = update.state.selection.main;
            handleSelectionChange(selection);
          }
        }),
      ].filter(Boolean),
    });

    _codeMirror = new EditorView({
      state,
      parent: editorRef.value,
    });

    updateSelection();
    updateOverlay();
  };

  const componentWillUnmount = () => {
    _codeMirror?.destroy();
  };

  const updateValue = (value) => {
    if (_cached === value) {
      return;
    }
    _cached = value;
    _codeMirror.dispatch({
      changes: {
        from: 0,
        to: _codeMirror.state.doc.length,
        insert: value,
      },
    });

    if (!(props.autoFold instanceof RegExp)) {
      return;
    }

    const lines = value.split("\n");
    const effects = [];

    for (let i = lines.length - 1; i >= 0; i--) {
      if (props.autoFold.test(lines[i])) {
        const lineNumber = i + 1;
        const range = foldable(
          _codeMirror.state,
          _codeMirror.state.doc.line(lineNumber).from,
          _codeMirror.state.doc.line(lineNumber).to,
        );

        if (range) {
          effects.push(foldEffect.of(range));
        }
      }
    }

    if (effects.length > 0) {
      _codeMirror.dispatch({ effects });
    }
  };

  const updateSelection = () => {
    if (!props.selection || !_codeMirror) {
      return;
    }

    const anchor = props.selection.anchor ?? 0;
    const head = props.selection.head ?? anchor;

    const currentSelection = _codeMirror.state.selection.main;
    if (currentSelection.anchor !== anchor || currentSelection.head !== head) {
      _codeMirror.dispatch({
        selection: { anchor, head },
      });
    }
  };

  const updateOverlay = () => {
    if (!_codeMirror) {
      return;
    }

    _codeMirror.dispatch({
      effects: _overlay.of({
        start: props.overlayStart,
        end: props.overlayEnd,
      }),
    });
  };

  const handleChange = (value) => {
    _cached = value;
    onChange(value);
    updateOverlay();
  };

  const handleSelectionChange = (selection) => {
    if (!props.onSelectionChange || !selection) {
      return;
    }

    props.onSelectionChange({
      anchor: selection.anchor,
      head: selection.head,
    });
  };

  const render = () => (
    <div class="editor input">
      <div ref="editorRef" style={{ position: "absolute", inset: 0 }} />
    </div>
  );

  onMounted(componentDidMount);
  onUnmounted(componentWillUnmount);

  watch(
    () => props.value,
    (value) => {
      if (!_codeMirror) {
        return;
      }

      if (value !== _cached) {
        updateValue(value);
      }
    },
  );

  watch(
    () => props.mode,
    async (mode) => {
      if (!_codeMirror) {
        return;
      }

      _codeMirror.dispatch({
        effects: languageExt.reconfigure(await getLanguageExtension(mode)),
      });
    },
  );

  watch(
    () => props.ruler,
    (ruler) => {
      if (!_codeMirror) {
        return;
      }

      _codeMirror.dispatch({
        effects: rulerTheme.reconfigure(
          createRulerTheme(ruler, props.rulerColor),
        ),
      });
    },
  );

  watch(
    () => props.rulerColor,
    (rulerColor) => {
      if (!_codeMirror) {
        return;
      }

      _codeMirror.dispatch({
        effects: rulerTheme.reconfigure(
          createRulerTheme(props.ruler, rulerColor),
        ),
      });
    },
  );

  watch(
    () => props.selection,
    () => {
      if (!_codeMirror) {
        return;
      }

      updateSelection();
    },
    { deep: true },
  );

  watch(
    () => [props.overlayStart, props.overlayEnd],
    () => {
      if (!_codeMirror) {
        return;
      }

      updateOverlay();
    },
  );

  watch(
    () => props.foldGutter,
    (foldGutter) => {
      if (!_codeMirror) {
        return;
      }

      _codeMirror.dispatch({
        effects: foldGutterCompartment.reconfigure(
          foldGutter ? foldGutterExt() : [],
        ),
      });
    },
  );

  return render;
}

const CodeMirrorPanel = {
  name: "CodeMirrorPanel",
  props: {
    value: { type: String, required: true },
    selection: { type: Object, default: undefined },
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
    extraKeys: { type: Object, default: undefined },
  },
  emits: ["change"],
  setup,
};

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
