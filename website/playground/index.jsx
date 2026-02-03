import "./install-service-worker.js";

import { createApp, onMounted, reactive, watch } from "vue";
import { settings } from "./composables/playground-settings.js";
import { worker } from "./composables/prettier-worker.js";
import Header from "./header.vue";
import Playground from "./Playground.jsx";
import { fixPrettierVersion } from "./utilities.js";

const App = {
  name: "App",
  setup() {
    const state = reactive({
      loaded: false,
    });

    const updateMetadata = async (channel) => {
      const { supportInfo, version } = await worker.getMetadata(channel);

      Object.assign(state, {
        loaded: true,
        availableOptions: supportInfo.options.map(augmentOption),
        version: fixPrettierVersion(version),
      });
    };

    watch(
      () => settings.releaseChannel,
      async (newChannel) => {
        const url = new URL(window.location);
        if (newChannel === "next") {
          url.searchParams.set("version", "next");
        } else {
          url.searchParams.delete("version");
        }
        window.history.replaceState({}, "", url);

        await updateMetadata(newChannel);
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

    onMounted(() => updateMetadata(settings.releaseChannel));
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
