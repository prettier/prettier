import { reactive, watch } from "vue";
import * as storage from "../storage.js";

/**
@typedef {typeof defaultState} EditorState
*/

const defaultState = {
  showSidebar: window.innerWidth > window.innerHeight,
  showAst: false,
  showPreprocessedAst: false,
  showDoc: false,
  showComments: false,
  showSecondFormat: false,
  showInput: true,
  showOutput: true,
  rethrowEmbedErrors: false,
};

const editorStateTogglers = Object.fromEntries(
  Object.keys(defaultState).map((property) => [
    property,
    () => {
      editorState[property] = !editorState[property];
    },
  ]),
);

/** @type {EditorState} */
const initialState = {
  ...defaultState,
  ...storage.get("editor_state"),
};

const editorState = reactive(initialState);

watch(
  () => editorState,
  () => {
    storage.set("editor_state", editorState);
  },
  { deep: true },
);

export { editorState, editorStateTogglers };
