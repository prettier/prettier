<script setup>
import { provide } from "vue";
import PlaygroundBottomBar from "./components/BottomBar.vue";
import PlaygroundEditors from "./components/Editdors.vue";
import PrettierFormat from "./components/PrettierFormat.vue";
import PlaygroundSidebar from "./components/Sidebar.vue";
import PlaygroundStateProvider from "./components/StateProvider.vue";
import { orderOptions, useOptions } from "./composables/use-options.js";
import { ENABLED_OPTIONS } from "./constants";
import { buildCliArgs, formatMarkdown } from "./utils";

const props = defineProps({
  worker: { type: Object, required: true },
  availableOptions: { type: Object, required: true },
  version: { type: String, required: true },
});

const optionsState = useOptions(props.availableOptions);

provide("optionsState", optionsState);

function getMarkdown({ formatted, reformatted, full, doc }) {
  const orderedOptions = orderOptions(props.availableOptions, [
    ...ENABLED_OPTIONS,
    "rangeStart",
    "rangeEnd",
    "cursorOffset",
  ]);
  const cliOptions = buildCliArgs(orderedOptions, optionsState.state.options);

  return formatMarkdown({
    input: optionsState.state.content,
    output: formatted,
    output2: reformatted,
    doc,
    version: props.version,
    url: window.location.href,
    options: optionsState.state.options,
    cliOptions,
    full,
  });
}
</script>

<template>
  <PlaygroundStateProvider>
    <PrettierFormat
      :worker="worker"
      :code="optionsState.state.content"
      :options="optionsState.state.options"
    >
      <div class="playground__editors-container">
        <PlaygroundSidebar
          :availableOptions="availableOptions"
          @get-markdown="getMarkdown"
        />
        <PlaygroundEditors />
      </div>
      <PlaygroundBottomBar :get-markdown="getMarkdown" />
    </PrettierFormat>
  </PlaygroundStateProvider>
</template>

<style>
#root,
.playground {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.playground__editors-container {
  display: flex;
  flex: 1;
  min-height: 0;
}

.playground__editors {
  display: flex;
  flex: 1;
  flex-flow: row wrap;
}

.playground__cursor-tracking {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
</style>
