import { createApp, onMounted, reactive } from "vue";
import { worker } from "./composables/prettier-worker.js";
import Header from "./header.vue";
import Playground from "./Playground.jsx";
import { fixPrettierVersion } from "./utilities.js";

const App = {
  name: "App",
  setup() {
    const state = reactive({ loaded: false });

    const componentDidMount = async () => {
      const { supportInfo, version } = await worker.getMetadata();

      Object.assign(state, {
        loaded: true,
        availableOptions: supportInfo.options.map(augmentOption),
        version: fixPrettierVersion(version),
      });
    };

    const render = () => {
      const { loaded, availableOptions, version } = state;

      if (!loaded) {
        return "Loading...";
      }

      return (
        <>
          <Header version={version}></Header>
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
