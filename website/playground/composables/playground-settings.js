import { reactive, watch } from "vue";
import * as storage from "../storage.js";
import { getReleaseChannel } from "../utilities.js";

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
  releaseChannel: getReleaseChannel(),
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
