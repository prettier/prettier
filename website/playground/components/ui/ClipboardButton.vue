<script setup>
import { onMounted, reactive, useTemplateRef } from "vue";
import Button from "./Button.vue";

const props = defineProps({
  copy: {
    type: [String, Function],
    required: true,
  },
  variant: {
    type: String,
    default: "default",
  },
});

const buttonRef = useTemplateRef("button");
const state = reactive({
  showTooltip: false,
  tooltipText: "",
});

let timer = null;

const showTooltip = (text) => {
  Object.assign(state, { showTooltip: true, tooltipText: text });

  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    timer = null;
    Object.assign(state, { showTooltip: false });
  }, 2000);
};

onMounted(() => {
  const { ClipboardJS } = window;

  const clipboard = new ClipboardJS(buttonRef.value.$el, {
    text() {
      const { copy } = props;
      return typeof copy === "function" ? copy() : copy;
    },
  });

  clipboard.on("success", () => showTooltip("Copied!"));
  clipboard.on("error", () => showTooltip("Press ctrl+c to copy"));
});
</script>

<template>
  <Button ref="button" :variant="variant">
    <span>
      <slot />
      <span
        v-if="state.showTooltip"
        :class="[
          'button__tooltip',
          state.showTooltip && 'button__tooltip--visible',
        ]"
      >
        {{ state.tooltipText }}
      </span>
    </span>
  </Button>
</template>

<style scoped>
.button__tooltip {
  position: absolute;
  z-index: 6;
  bottom: 100%;
  left: 50%;
  margin-top: 4px;
  padding: 0.4em 0.8em;
  border: 1px solid var(--color-border);
  border-radius: 0.4em;
  background-color: var(--color-background);
  color: var(--color-text);
  pointer-events: none;
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
  transition:
    opacity 0.2s ease-in-out,
    transform 0.2s ease-in-out;
}

.button__tooltip--visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.button__tooltip::before {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  border: 6px solid transparent;
  border-top-color: var(--color-background);
  border-bottom: none;
  transform: translateX(-50%);
}
</style>
