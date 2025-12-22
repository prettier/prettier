<script setup>
import { computed, inject } from "vue";
import { getAstAutoFold, getCodemirrorMode, getCodeSample } from "../utils";
import DebugPanel from "./editor/DebugPanel.vue";
import InputPanel from "./editor/InputPanel.vue";
import OutputPanel from "./editor/OutputPanel.vue";

const prettierFormatState = inject("prettierFormatState");
const playgroundState = inject("playgroundState");
const optionsState = inject("optionsState");
const { state, setContent, setSelection } = optionsState;

const parser = computed(() => state.options.parser);
const printWidth = computed(() => state.options.printWidth);
const rangeStart = computed(() => state.options.rangeStart);
const rangeEnd = computed(() => state.options.rangeEnd);

const formatInput = () => {
  if (parser.value !== "doc-explorer") {
    return;
  }

  // TODO: This needs a worker instance to be passed in
  // For now, this feature is disabled
  console.warn("Format input is not yet implemented in Vue version");
};

const isDocExplorer = computed(() => parser.value === "doc-explorer");

const getSecondFormat = (formatted, reformatted) => {
  return formatted === reformatted ? "" : reformatted;
};
</script>

<template>
  <div class="playground__editors">
    <InputPanel
      v-if="playgroundState.showInput"
      :mode="getCodemirrorMode(parser)"
      :ruler="printWidth"
      :value="state.content"
      :selection="state.selection"
      :codeSample="getCodeSample(parser)"
      :overlayStart="rangeStart"
      :overlayEnd="rangeEnd"
      @change="setContent"
      :onSelectionChange="setSelection"
      :extraKeys="{
        'Shift-Alt-F': formatInput,
      }"
      :foldGutter="parser === 'doc-explorer'"
    />
    <DebugPanel
      v-if="playgroundState.showAst"
      :value="prettierFormatState.debug?.ast || ''"
      :auto-fold="getAstAutoFold(parser)"
    />
    <DebugPanel
      v-if="playgroundState.showPreprocessedAst && !isDocExplorer"
      :value="prettierFormatState.debug?.preprocessedAst || ''"
      :auto-fold="getAstAutoFold(parser)"
    />
    <DebugPanel
      v-if="playgroundState.showComments && !isDocExplorer"
      :value="prettierFormatState.debug?.comments || ''"
    />
    <OutputPanel
      v-if="playgroundState.showOutput"
      :mode="getCodemirrorMode(parser)"
      :value="prettierFormatState.formatted"
      :ruler="printWidth"
      :overlayStart="
        prettierFormatState.cursorOffset === -1
          ? undefined
          : prettierFormatState.cursorOffset
      "
      :overlayEnd="
        prettierFormatState.cursorOffset === -1
          ? undefined
          : prettierFormatState.cursorOffset + 1
      "
    />
    <OutputPanel
      v-if="playgroundState.showSecondFormat && !isDocExplorer"
      :mode="getCodemirrorMode(parser)"
      :value="
        getSecondFormat(
          prettierFormatState.formatted,
          prettierFormatState.debug?.reformatted,
        )
      "
      :ruler="printWidth"
    />
  </div>
</template>

<style scoped>
.playground__editor {
  box-sizing: border-box;
  display: flex;
  flex: 1 1 100%;
  position: relative;
  border-bottom: 1px solid var(--color-border);
}

@media (min-width: 800px) {
  .playground__editor {
    flex-basis: 50%;
    border-left: 1px solid var(--color-border);
    margin-left: -1px;
  }
}

@media (min-width: 1200px) {
  .playground__editor {
    flex-basis: 25%;
  }
}
</style>
