import "./install-service-worker.js";

import { createApp, onMounted, reactive } from "vue";
import { worker } from "./composables/prettier-worker.js";
import Header from "./header.vue";
import Playground from "./Playground.jsx";
import { fixPrettierVersion } from "./utilities.js";

function getInitialSelectedVersion() {
  const params = new URLSearchParams(window.location.search);
  return params.get("version") === "next" ? "next" : "stable";
}

async function checkNextVersionAvailable() {
  try {
    const response = await fetch("/lib-next/package-manifest.mjs", {
      method: "HEAD",
    });
    return response.ok;
  } catch {
    return false;
  }
}

const App = {
  name: "App",
  setup() {
    const state = reactive({
      loaded: false,
      selectedVersion: getInitialSelectedVersion(),
      hasNextVersion: false,
    });

    const componentDidMount = async () => {
      const [{ supportInfo, version }, hasNextVersion] = await Promise.all([
        worker.getMetadata(),
        checkNextVersionAvailable(),
      ]);

      Object.assign(state, {
        loaded: true,
        availableOptions: supportInfo.options.map(augmentOption),
        version: fixPrettierVersion(version),
        hasNextVersion,
      });
    };

    const onSelectedVersionChange = (newVersion) => {
      state.selectedVersion = newVersion;
      const url = new URL(window.location);
      if (newVersion === "next") {
        url.searchParams.set("version", "next");
      } else {
        url.searchParams.delete("version");
      }
      window.history.replaceState({}, "", url);
      window.location.reload();
    };

    const render = () => {
      const {
        loaded,
        availableOptions,
        version,
        selectedVersion,
        hasNextVersion,
      } = state;

      if (!loaded) {
        return "Loading...";
      }

      return (
        <>
          <Header
            version={version}
            selectedVersion={selectedVersion}
            hasNextVersion={hasNextVersion}
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
