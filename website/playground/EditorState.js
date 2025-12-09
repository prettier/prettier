import { reactive, watch } from "vue";
import { shallowEqual } from "./helpers.js";
import * as storage from "./storage.js";

export default {
  name: "EditorState",
  setup(_, { slots }) {
    const state = reactive({
      showSidebar: window.innerWidth > window.innerHeight,
      showAst: false,
      showPreprocessedAst: false,
      showDoc: false,
      showComments: false,
      showSecondFormat: false,
      showInput: true,
      showOutput: true,
      rethrowEmbedErrors: false,
      toggleSidebar: () => (state.showSidebar = !state.showSidebar),
      toggleAst: () => (state.showAst = !state.showAst),
      togglePreprocessedAst: () =>
        (state.showPreprocessedAst = !state.showPreprocessedAst),
      toggleDoc: () => (state.showDoc = !state.showDoc),
      toggleComments: () => (state.showComments = !state.showComments),
      toggleSecondFormat: () =>
        (state.showSecondFormat = !state.showSecondFormat),
      toggleInput: () => (state.showInput = !state.showInput),
      toggleOutput: () => (state.showOutput = !state.showOutput),
      toggleEmbedErrors: () =>
        (state.rethrowEmbedErrors = !state.rethrowEmbedErrors),
      ...storage.get("editor_state"),
    });

    watch(
      state,
      (newState, oldState) => {
        if (!shallowEqual(newState, oldState)) {
          storage.set("editor_state", newState);
        }
      },
      { deep: true },
    );

    return () => slots.default?.(state);
  },
};
