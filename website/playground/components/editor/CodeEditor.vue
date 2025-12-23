<script setup>
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
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
import { onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps({
  value: { type: String, required: true },
  selection: { type: Object, default: undefined },
  ruler: { type: Number, default: undefined },
  rulerColor: { type: String, default: undefined },
  overlayStart: { type: Number, default: undefined },
  overlayEnd: { type: Number, default: undefined },
  mode: { type: String, required: true },
  foldGutter: { type: Boolean, default: false },
  autoFold: { type: RegExp, default: undefined },
  codeSample: { type: String, default: undefined },
  lineNumbers: { type: Boolean, default: true },
  autoCloseBrackets: { type: Boolean, default: true },
  matchBrackets: { type: Boolean, default: true },
  extraKeys: { type: Object, default: undefined },
  tabSize: { type: Number, default: undefined },
  readOnly: { type: Boolean, default: false },
});

const emit = defineEmits(["change", "selection-change"]);

const editorRef = ref(null);
let view = null;

const highlightOverlay = StateEffect.define();

const highlightOverlayField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    for (const effect of tr.effects) {
      if (effect.is(highlightOverlay)) {
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

const languageExtensions = new Compartment();
const rulerTheme = new Compartment();

const applyAutoFold = (view, content) => {
  if (!(props.autoFold instanceof RegExp)) {
    return;
  }

  const lines = content.split("\n");
  const effects = [];

  for (let i = lines.length - 1; i >= 0; i--) {
    if (props.autoFold.test(lines[i])) {
      const lineNumber = i + 1;
      const range = foldable(
        view.state,
        view.state.doc.line(lineNumber).from,
        view.state.doc.line(lineNumber).to,
      );

      if (range) {
        effects.push(foldEffect.of(range));
      }
    }
  }

  if (effects.length > 0) {
    view.dispatch({ effects });
  }
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

onMounted(async () => {
  const languageExtension = await getLanguageExtension(props.mode);

  const state = EditorState.create({
    doc: props.value,
    extensions: [
      props.lineNumbers && lineNumbersExt(),
      props.foldGutter && foldGutterExt(),
      props.autoCloseBrackets && closeBrackets(),
      props.matchBrackets && bracketMatching(),

      history(),
      languageExtensions.of(languageExtension),
      syntaxHighlighting(defaultHighlightStyle),
      highlightOverlayField,

      keymap.of([
        ...defaultKeymap,
        ...closeBracketsKeymap,
        ...historyKeymap,
        ...foldKeymap,
        indentWithTab,
        { key: "Ctrl-L", run: () => false },
        ...(props.extraKeys
          ? Object.entries(props.extraKeys).map(([key, cmd]) => ({
              key,
              run: cmd,
            }))
          : []),
      ]),

      EditorState.tabSize.of(props.tabSize),
      EditorState.readOnly.of(props.readOnly),

      EditorView.theme({
        "&": {
          height: "100%",
        },
        "&.cm-focused": {
          outline: "none",
        },
        ".cm-scroller": {
          overflow: "auto",
        },
        ".cm-gutters": {
          backgroundColor: "var(--color-background)",
          padding: "0 8px",
          borderRight: "none",
        },
        ".cm-foldPlaceholder": {
          backgroundColor: "var(--color-gray-200)",
          color: "var(--color-text)",
          borderRadius: "3px",
          padding: "0 4px",
          margin: "0 2px",
        },
        // For the ruler
        ".cm-content": {
          position: "relative",
        },
      }),

      rulerTheme.of(createRulerTheme(props.ruler, props.rulerColor)),

      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          emit("change", update.state.doc.toString());
        }
        if (update.selectionSet) {
          emit("selection-change", update.state.selection);
        }
      }),
    ].filter(Boolean),
  });

  view = new EditorView({
    state,
    parent: editorRef.value,
  });

  applyAutoFold(view, props.value);

  if (
    props.overlayStart !== undefined &&
    props.overlayEnd !== undefined &&
    props.overlayStart < props.overlayEnd
  ) {
    view.dispatch({
      effects: highlightOverlay.of({
        start: props.overlayStart,
        end: props.overlayEnd,
      }),
    });
  }
});

onUnmounted(() => {
  view.destroy();
  view = null;
});

watch(
  () => props.value,
  (newValue) => {
    if (newValue !== view?.state.doc.toString()) {
      const transaction = {
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: newValue,
        },
      };

      if (props.selection && props.selection.main) {
        transaction.selection = {
          anchor: props.selection.main.from,
          head: props.selection.main.to,
        };
      }

      view.dispatch(transaction);

      applyAutoFold(view, newValue);
    }
  },
);

watch(
  () => props.mode,
  async (newValue) => {
    if (view) {
      const languageExtension = await getLanguageExtension(newValue);
      view.dispatch({
        effects: languageExtensions.reconfigure(languageExtension),
      });
    }
  },
);

watch(
  () => props.ruler,
  (newRuler) => {
    view?.dispatch({
      effects: rulerTheme.reconfigure(
        createRulerTheme(newRuler, props.rulerColor),
      ),
    });
  },
);

watch(
  () => [props.overlayStart, props.overlayEnd],
  ([newStart, newEnd]) => {
    view?.dispatch({
      effects: highlightOverlay.of({
        start: newStart,
        end: newEnd,
      }),
    });
  },
);

watch(
  () => props.selection,
  (newSelection) => {
    if (!view || !newSelection?.main) {
      return;
    }
    const currentSelection = view.state.selection.main;
    if (
      currentSelection.from !== newSelection.main.from ||
      currentSelection.to !== newSelection.main.to
    ) {
      view.dispatch({
        selection: {
          anchor: newSelection.main.from,
          head: newSelection.main.to,
        },
      });
    }
  },
  { deep: true },
);
</script>

<template>
  <div class="playground__editor">
    <div ref="editorRef" style="position: absolute; inset: 0" />
  </div>
</template>

<style>
.cm-overlay-highlight {
  background-color: var(--color-overlay-background);
}

@media (min-width: 800px) {
  .playground__editor {
    flex-basis: 50%;
    margin-left: -1px;
    border-left: 1px solid var(--color-border);
  }
}

@media (min-width: 1200px) {
  .playground__editor {
    flex-basis: 25%;
  }
}
</style>
