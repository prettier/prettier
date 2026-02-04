import "./install-service-worker.js";

import { createApp, onMounted, reactive, toRaw, watch } from "vue";
import { settings } from "./composables/playground-settings.js";
import { worker } from "./composables/prettier-worker.js";
import Header from "./header.vue";
import Playground from "./Playground.jsx";
import { formatVersion } from "./utilities.js";

const App = {
  name: "App",
  setup() {
    const state = reactive({
      loaded: false,
    });

    const updateMetadata = async () => {
      const { supportInfo, version } = await worker.getMetadata(
        toRaw(settings),
      );

      Object.assign(state, {
        loaded: true,
        availableOptions: supportInfo.options.map(augmentOption),
        version: formatVersion(version),
      });
    };

    watch(
      () => settings.version,
      async () => {
        const { version } = settings;
        const url = new URL(window.location);
        if (version === "next") {
          url.searchParams.set("version", "next");
        } else {
          url.searchParams.delete("version");
        }
        window.history.replaceState({}, "", url);

        await updateMetadata();
      },
    );

    const render = () => {
      const { loaded, availableOptions, version } = state;

      if (!loaded) {
        return "Loading...";
      }

      return (
        <>
          <Header version={version} />
          <Playground availableOptions={availableOptions} version={version} />
        </>
      );
    };

    onMounted(() => updateMetadata());
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
