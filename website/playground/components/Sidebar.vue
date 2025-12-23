<script setup>
import { computed, inject } from "vue";
import { orderOptions } from "../composables/use-options.js";
import { CATEGORIES_ORDER, ENABLED_OPTIONS } from "../constants";
import Option from "./sidebar/Options.vue";
import SidebarOptions from "./sidebar/SidebarOptions.vue";
import Button from "./ui/Button.vue";
import Checkbox from "./ui/Checkbox.vue";
import ClipboardButton from "./ui/ClipboardButton.vue";
import Collapsible from "./ui/Collapsible.vue";

const { availableOptions } = defineProps({
  availableOptions: {
    type: Array,
    required: true,
  },
});

defineEmits(["getMarkdown"]);

const optionsState = inject("optionsState");
const {
  state,
  rangeStartOption,
  rangeEndOption,
  cursorOffsetOption,
  setSelectionAsRange,
  handleOptionValueChange,
  resetOptions,
} = optionsState;

const enabledOptions = orderOptions(availableOptions, ENABLED_OPTIONS);

const playgroundState = inject("playgroundState");
const prettierFormatState = inject("prettierFormatState");

const visible = computed(() => playgroundState.showSidebar);
const isDocExplorer = computed(() => state.options.parser === "doc-explorer");
</script>

<template>
  <div
    :class="['playground__sidebar', visible ? 'playground__sidebar--open' : '']"
  >
    <div class="playground__sidebar-content">
      <SidebarOptions
        :categories="CATEGORIES_ORDER"
        :available-options="enabledOptions"
        :option-values="state.options"
        @option-value-change="handleOptionValueChange"
      />

      <Collapsible v-if="!isDocExplorer" title="Range">
        <label>
          The selected range will be highlighted in yellow in the input editor
        </label>
        <Option
          :option="rangeStartOption"
          :value="
            typeof state.options.rangeStart === 'number'
              ? state.options.rangeStart
              : undefined
          "
          @change="handleOptionValueChange"
        />
        <Option
          :option="rangeEndOption"
          :value="
            typeof state.options.rangeEnd === 'number'
              ? state.options.rangeEnd
              : undefined
          "
          :overrideMax="state.content.length"
          @change="handleOptionValueChange"
        />
        <Button variant="primary" @click="setSelectionAsRange">
          Set selected text as range
        </Button>
      </Collapsible>

      <Collapsible v-if="!isDocExplorer" title="Cursor">
        <Option
          :option="cursorOffsetOption"
          :value="
            state.options.cursorOffset >= 0
              ? state.options.cursorOffset
              : undefined
          "
          @change="handleOptionValueChange"
        />
        <div
          :style="{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'baseline',
            gap: '10px',
          }"
        >
          <Checkbox
            label="track"
            :checked="Boolean(state.trackCursorOffset)"
            @change="
              () => {
                state.trackCursorOffset = !state.trackCursorOffset;
              }
            "
          />

          <div
            v-if="state.options.cursorOffset >= 0"
            class="playground__cursor-tracking"
          >
            <label>Result: {{ prettierFormatState.cursorOffset }}</label>
            <Button
              variant="primary"
              @click="
                () => {
                  handleOptionValueChange(cursorOffsetOption, -1);
                }
              "
            >
              Reset
            </Button>
          </div>
        </div>
      </Collapsible>

      <Collapsible title="Debug">
        <Checkbox
          label="show input"
          :checked="playgroundState.showInput"
          @change="playgroundState.toggleInput"
        />
        <Checkbox
          label="show AST"
          :checked="playgroundState.showAst"
          @change="playgroundState.toggleAst"
        />
        <Checkbox
          v-if="!isDocExplorer"
          label="show preprocessed AST"
          :checked="playgroundState.showPreprocessedAst"
          @change="playgroundState.togglePreprocessedAst"
        />
        <Checkbox
          v-if="!isDocExplorer"
          label="show doc"
          :checked="playgroundState.showDoc"
          @change="playgroundState.toggleDoc"
        />
        <Checkbox
          v-if="!isDocExplorer"
          label="show comments"
          :checked="playgroundState.showComments"
          @change="playgroundState.toggleComments"
        />
        <Checkbox
          v-if="!isDocExplorer"
          label="show output"
          :checked="playgroundState.showOutput"
          @change="playgroundState.toggleOutput"
        />
        <Checkbox
          v-if="!isDocExplorer"
          label="show second format"
          :checked="playgroundState.showSecondFormat"
          @change="playgroundState.toggleSecondFormat"
        />
        <Checkbox
          v-if="!isDocExplorer"
          label="rethrow embed errors"
          :checked="playgroundState.rethrowEmbedErrors"
          @change="playgroundState.toggleEmbedErrors"
        />
        <ClipboardButton
          v-if="playgroundState.showDoc && !isDocExplorer"
          :copy="() => $emit('getMarkdown', { doc: debug.doc })"
          :disabled="!prettierFormatState.doc"
        >
          Copy doc
        </ClipboardButton>
      </Collapsible>

      <div class="playground__sidebar-section">
        <Button @click="resetOptions">Reset to defaults</Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playground__sidebar {
  display: none;
  box-sizing: border-box;
  flex: 0 1 auto;
  width: 225px;
  overflow-y: auto;
  border-right: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.playground__sidebar--open {
  display: block;
}

.playground__sidebar-content {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: auto;
}

.playground__sidebar-section {
  flex: 1;
  padding: 15px 0 10px;
  border-bottom: 1px solid var(--color-border);
}

.playground__sidebar-section:last-child {
  border: 0;
}

.playground__sidebar-section > .button {
  margin-left: 10px;
}

@media (min-width: 800px) {
  .playground__sidebar {
    border-right: 0;
  }
}
</style>
