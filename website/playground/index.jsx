import { createApp, onMounted, reactive } from "vue";
import Header from "./header.vue";
import Playground from "./Playground.jsx";
import { fixPrettierVersion } from "./utilities.js";
import WorkerApi from "./WorkerApi.js";

const App = {
  name: "App",
  setup() {
    const state = reactive({ loaded: false });
    const worker = new WorkerApi();

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
          <Playground
            worker={worker}
            availableOptions={availableOptions}
            version={version}
          />
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
