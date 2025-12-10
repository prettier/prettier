import { reactive, watch } from "vue";
import { shallowEqual, stateToggler } from "./helpers.js";
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
      toggleSidebar: () =>
        Object.assign(state, stateToggler("showSidebar")(state)),
      toggleAst: () => Object.assign(state, stateToggler("showAst")(state)),
      togglePreprocessedAst: () =>
        Object.assign(state, stateToggler("showPreprocessedAst")(state)),
      toggleDoc: () => Object.assign(state, stateToggler("showDoc")(state)),
      toggleComments: () =>
        Object.assign(state, stateToggler("showComments")(state)),
      toggleSecondFormat: () =>
        Object.assign(state, stateToggler("showSecondFormat")(state)),
      toggleInput: () => Object.assign(state, stateToggler("showInput")(state)),
      toggleOutput: () =>
        Object.assign(state, stateToggler("showOutput")(state)),
      toggleEmbedErrors: () =>
        Object.assign(state, stateToggler("rethrowEmbedErrors")(state)),
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

    const render = () => slots.default(state);

    return render;
  },
};
