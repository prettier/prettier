import { reactive, watch } from "vue";
import * as storage from "./storage.js";

export default {
  name: "EditorState",
  setup(_, { slots }) {
    const stateToggler = (property) => () => {
      state[property] = !state[property];
    };
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
      toggleSidebar: stateToggler("showSidebar"),
      toggleAst: stateToggler("showAst"),
      togglePreprocessedAst: stateToggler("showPreprocessedAst"),
      toggleDoc: stateToggler("showDoc"),
      toggleComments: stateToggler("showComments"),
      toggleSecondFormat: stateToggler("showSecondFormat"),
      toggleInput: stateToggler("showInput"),
      toggleOutput: stateToggler("showOutput"),
      toggleEmbedErrors: stateToggler("rethrowEmbedErrors"),
      ...storage.get("editor_state"),
    });

    const render = () => slots.default(state);

    watch(
      () => state,
      () => {
        storage.set("editor_state", state);
      },
      { deep: true },
    );
    return render;
  },
};
