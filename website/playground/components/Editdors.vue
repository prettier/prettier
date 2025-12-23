<script setup>
import { computed, inject } from "vue";
import { getAstAutoFold, getCodemirrorMode, getCodeSample } from "../utils";
import DebugPanel from "./editor/DebugPanel.vue";
import InputPanel from "./editor/InputPanel.vue";
import OutputPanel from "./editor/OutputPanel.vue";

const prettierFormatState = inject("prettierFormatState");
const playgroundState = inject("playgroundState");
const optionsState = inject("optionsState");
const { state, setContent, setSelection, insertDummyId } = optionsState;

const parser = computed(() => state.options.parser);
const printWidth = computed(() => state.options.printWidth);
const rangeStart = computed(() => state.options.rangeStart);
const rangeEnd = computed(() => state.options.rangeEnd);

const formatInput = () => {
  if (parser.value !== "doc-explorer") {
    return;
  }
};

const isDocExplorer = computed(() => parser.value === "doc-explorer");

const getSecondFormat = (formatted, reformatted) => {
  if (formatted === "") {
    return "";
  }

  if (formatted === reformatted) {
    return "✓ Second format is unchanged.";
  }

  return reformatted ?? "";
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
      @selection-change="setSelection"
      :extraKeys="{
        'Shift-Alt-f': formatInput,
        'Ctrl-q': insertDummyId,
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
      v-if="playgroundState.showDoc && !isDocExplorer"
      :value="prettierFormatState.debug?.doc || ''"
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
          prettierFormatState.debug?.reformatted || '',
        )
      "
      :ruler="printWidth"
    />
  </div>
</template>

<style scoped>
.playground__editor {
  position: relative;
  display: flex;
  box-sizing: border-box;
  flex: 1 1 100%;
  border-bottom: 1px solid var(--color-border);
}

@media (min-width: 800px) {
  .playground__editor {
    flex-basis: 50%;
    margin-left: -1px;
    border-left: 1px solid var(--color-border);
  }
}

@media (min-width: 1200px) {
  .playground__editor {
    flex-basis: 25%;
  }
}
</style>
