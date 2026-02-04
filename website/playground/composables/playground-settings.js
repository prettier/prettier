import { reactive, watch } from "vue";
import * as storage from "../storage.js";
import { getVersion } from "../utilities.js";

/**
@typedef {typeof defaultSettings} PlaygroundSettings
*/

const defaultSettings = {
  showSidebar: window.innerWidth > window.innerHeight,
  showInput: true,
  showAst: false,
  showPreprocessedAst: false,
  showDoc: false,
  showComments: false,
  showSecondFormat: false,
  showOutput: true,
  rethrowEmbedErrors: false,
};

const togglers = Object.fromEntries(
  Object.keys(defaultSettings).map((property) => [
    property,
    () => {
      settings[property] = !settings[property];
    },
  ]),
);

/** @type {PlaygroundSettings} */
const initialSettings = {
  ...defaultSettings,
  ...storage.get("editor_state"),
  // eslint-disable-next-line no-undef
  version: __IS_PULL_REQUEST__ ? "next" : getVersion(),
};

const settings = reactive(initialSettings);

watch(
  () => settings,
  () => {
    storage.set("editor_state", settings);
  },
  { deep: true },
);

export { settings, togglers };
