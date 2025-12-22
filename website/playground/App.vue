<script setup>
import { onMounted, reactive } from "vue";
import Header from "./Header.vue";
import Playground from "./Playground.vue";
import Loading from "./components/Loading.vue";
import { fixPrettierVersion } from "./utils";
import WorkerApi from "./WorkerApi.js";

const state = reactive({ loaded: false });
const worker = new WorkerApi();

onMounted(async () => {
  const { supportInfo, version } = await worker.getMetadata();

  Object.assign(state, {
    loaded: true,
    availableOptions: supportInfo.options.map(augmentOption),
    version: fixPrettierVersion(version),
  });
});

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
</script>

<template>
  <Loading v-if="!state.loaded" />

  <template v-else>
    <Header :version="state.version" />
    <Playground
      :worker="worker"
      :availableOptions="state.availableOptions"
      :version="state.version"
    />
  </template>
</template>
