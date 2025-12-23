<script setup>
import ChevronIcon from "../icons/ChevronIcon.vue";

defineProps({
  title: {
    type: String,
    required: true,
  },
  defaultOpen: {
    type: Boolean,
    default: true,
  },
});
</script>

<template>
  <details class="collapsible" :open="defaultOpen">
    <summary class="collapsible__trigger">
      <ChevronIcon class="collapsible__icon" />
      {{ title }}
    </summary>
    <div class="collapsible__content">
      <slot />
    </div>
  </details>
</template>

<style scoped>
.collapsible {
  padding: 1.25rem 0 1rem;
  border-bottom: 1px solid var(--color-border);
}

.collapsible:last-child {
  border-bottom: 0;
}

.collapsible__trigger {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin: 0;
  padding: 0.5rem 0.75rem;
  outline: 0;
  border: 0;
  font-size: 15px;
  font-weight: bold;
  line-height: 1.75rem;
  color: var(--color-gray-900);
  text-align: left;
  cursor: pointer;
}

.collapsible__trigger:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -1px;
}

.collapsible__icon {
  flex-shrink: 0;
  width: 0.75rem;
  height: 0.75rem;
  transition: transform 150ms ease-out;
}

.collapsible[open] .collapsible__icon {
  transform: rotate(90deg);
}

.collapsible__content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.875rem 0.75rem 0.625rem 1rem;
}
</style>
