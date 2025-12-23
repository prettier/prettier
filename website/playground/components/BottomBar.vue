<script setup>
import { computed, inject } from "vue";
import { COPY_MESSAGE, ISSUES_URL, MAX_LENGTH } from "../constants";
import Button from "./ui/Button.vue";
import ClipboardButton from "./ui/ClipboardButton.vue";

const { getMarkdown } = defineProps({
  getMarkdown: { type: Function, required: true },
});

const playgroundState = inject("playgroundState");
const prettierFormatState = inject("prettierFormatState");
const optionsState = inject("optionsState");

const { clearContent, insertDummyId } = optionsState;

const fullReport = computed(() =>
  getMarkdown({
    formatted: prettierFormatState.formatted,
    reformatted: prettierFormatState.debug.reformatted,
    full: true,
  }),
);

const showFullReport = computed(
  () => encodeURIComponent(fullReport.value).length < MAX_LENGTH,
);

function getCurrentHref() {
  return window.location.href;
}

function getReportLink(reportBody) {
  return `${ISSUES_URL}${encodeURIComponent(reportBody)}`;
}
</script>

<template>
  <div class="playground__bottom-bar">
    <div
      class="playground__bottom-bar-actions playground__bottom-bar-actions--left"
    >
      <Button @click="playgroundState.toggleSidebar">
        {{ playgroundState.showSidebar ? "Hide" : "Show" }} options
      </Button>
      <Button @click="clearContent">Clear</Button>
      <Button
        @click="insertDummyId"
        @mousedown="(event) => event.preventDefault()"
        title="Generate a nonsense variable name (Ctrl-Q)"
      >
        Insert dummy id
      </Button>
    </div>
    <div
      class="playground__bottom-bar-actions playground__bottom-bar-actions--right"
    >
      <ClipboardButton :copy="getCurrentHref" variant="primary">
        Copy link
      </ClipboardButton>
      <ClipboardButton
        :copy="
          () =>
            getMarkdown({
              formatted: prettierFormatState.formatted,
              reformatted: prettierFormatState.debug.reformatted,
            })
        "
        variant="primary"
      >
        Copy markdown
      </ClipboardButton>
      <ClipboardButton
        :copy="
          JSON.stringify(
            // Remove `parser` since people usually paste this
            // into their .prettierrc and specifying a top-level
            // parser there is an anti-pattern. Note:
            // `JSON.stringify` omits keys whose values are
            // `undefined`.
            { ...optionsState.state.options, parser: undefined },
            null,
            2,
          )
        "
        variant="primary"
      >
        Copy config JSON
      </ClipboardButton>
      <a
        :href="getReportLink(showFullReport ? fullReport : COPY_MESSAGE)"
        target="_blank"
        rel="noopener noreferrer"
      >
        <ClipboardButton
          :copy="() => (showFullReport ? '' : fullReport)"
          variant="danger"
        >
          Report issue
        </ClipboardButton>
      </a>
    </div>
  </div>
</template>

<style scoped>
.playground__bottom-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background-color: var(--color-background);
}

.playground__bottom-bar-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.playground__bottom-bar-actions--left {
  flex: 1;
  justify-content: flex-start;
}

.playground__bottom-bar-actions--right {
  justify-content: flex-end;
}

@media (max-width: 799px) {
  .playground__bottom-bar {
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .playground__bottom-bar-actions {
    gap: 0.5rem;
  }
}
</style>
