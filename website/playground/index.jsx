import "./install-service-worker.js";

import { createApp, onMounted, reactive } from "vue";
import { worker } from "./composables/prettier-worker.js";
import Header from "./header.vue";
import Playground from "./Playground.jsx";
import { fixPrettierVersion, getSelectedVersion } from "./utilities.js";

const App = {
  name: "App",
  setup() {
    const state = reactive({
      loaded: false,
      selectedVersion: getSelectedVersion(),
    });

    const componentDidMount = async () => {
      const { supportInfo, version } = await worker.getMetadata();

      Object.assign(state, {
        loaded: true,
        availableOptions: supportInfo.options.map(augmentOption),
        version: fixPrettierVersion(version),
      });
    };

    const onSelectedVersionChange = async (newVersion) => {
      state.selectedVersion = newVersion;
      const url = new URL(window.location);
      if (newVersion === "next") {
        url.searchParams.set("version", "next");
      } else {
        url.searchParams.delete("version");
      }
      window.history.replaceState({}, "", url);

      worker.switchVersion(newVersion);
      const { supportInfo, version } = await worker.getMetadata();

      Object.assign(state, {
        availableOptions: supportInfo.options.map(augmentOption),
        version: fixPrettierVersion(version),
      });
    };

    const render = () => {
      const { loaded, availableOptions, version, selectedVersion } = state;

      if (!loaded) {
        return "Loading...";
      }

      return (
        <>
          <Header
            version={version}
            selectedVersion={selectedVersion}
            onUpdate:selectedVersion={onSelectedVersionChange}
          />
          <Playground availableOptions={availableOptions} version={version} />
        </>
      );
    };

    onMounted(componentDidMount);
    return render;
  },
};

function augmentOption(option) {
  if (option.type === "boolean" && option.default === true) {
    option.inverted = true;
  }

  option.cliName =
    "--" +
    (option.inverted ? "no-" : "") +
    option.name.replaceAll(/(?<=[a-z])(?=[A-Z])/g, "-").toLowerCase();

  return option;
}

const container = document.getElementById("root");
const root = createApp(App);
root.mount(container);
