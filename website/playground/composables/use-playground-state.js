import { reactive } from "vue";
import { STORE_KEY } from "../constants/index.js";
import * as storage from "../utils/storage.js";

export function usePlaygroundState() {
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
    toggleOutput: stateToggler("toggleOutput"),
    toggleEmbedErrors: stateToggler("rethrowEmbedErrors"),
    ...storage.get(STORE_KEY),
  });

  return state;
}

export function usePrettierFormatState() {
  return reactive({
    formatted: "",
    cursorOffset: -1,
    debug: {},
  });
}
