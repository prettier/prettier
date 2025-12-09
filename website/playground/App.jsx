import { ref, onMounted } from "vue";
import Playground from "./Playground.jsx";
import VersionLink from "./VersionLink.jsx";
import WorkerApi from "./WorkerApi.js";
import { fixPrettierVersion } from "./utilities.js";

function augmentOption(option) {
  if (option.type === "boolean" && option.default === true) {
    option.inverted = true;
  }

  option.cliName =
    "--" +
    (option.inverted ? "no-" : "") +
    option.name.replaceAll(/(?<=[a-z])(?=[A-Z])/gu, "-").toLowerCase();

  return option;
}

export default {
  name: "App",
  setup() {
    const loaded = ref(false);
    const availableOptions = ref([]);
    const version = ref("");
    const worker = new WorkerApi();

    onMounted(async () => {
      const { supportInfo, version: workerVersion } =
        await worker.getMetadata();

      availableOptions.value = supportInfo.options.map(augmentOption);
      version.value = fixPrettierVersion(workerVersion);
      loaded.value = true;
    });

    return () => {
      if (!loaded.value) {
        return <div>Loading...</div>;
      }

      return (
        <>
          <VersionLink version={version.value} />
          <Playground
            worker={worker}
            availableOptions={availableOptions.value}
            version={version.value}
          />
        </>
      );
    };
  },
};
