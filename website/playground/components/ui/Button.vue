<script setup>
import { computed } from "vue";

const props = defineProps({
  variant: {
    type: String,
    default: "default",
  },
  link: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: Boolean,
    default: false,
  },
});

const computedCls = computed(() => {
  return [
    "button",
    props.variant ? `button--${props.variant}` : "",
    props.icon ? "button__icon" : "",
  ];
});
</script>

<template>
  <a v-if="link" :class="computedCls">
    <slot />
  </a>
  <button v-else :class="computedCls">
    <slot />
  </button>
</template>

<style scoped>
.button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: 2.5rem;
  margin: 0;
  padding: 0 0.875rem;
  outline: 0;
  border: 1px solid var(--color-gray-200);
  border-radius: 0.375rem;
  background-color: var(--color-background);
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5rem;
  color: var(--color-text);
  text-decoration: none;
  cursor: pointer;
  user-select: none;
}

.button:hover {
  background-color: var(--color-background-hover);
}

.button:focus-visible {
  outline: 2px solid var(--color-text);
  outline-offset: -1px;
}

.button--primary {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
  color: #fff;
}

.button--primary:hover {
  border-color: #147a82;
  background-color: #147a82;
}

.button--danger {
  border-color: var(--color-red);
  background-color: var(--color-red);
  color: #fff;
}

.button--danger:hover {
  border-color: #cb2431;
  background-color: #cb2431;
}

.button__icon {
  width: 3rem;
  height: 3rem;
  padding: 0;
  border: none;
}

.button__icon > svg {
  display: block;
  flex-shrink: 0;
}
</style>
