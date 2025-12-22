<script setup>
defineProps({
  width: { type: Number, default: 10 },
  height: { type: Number, default: 10 },
});
</script>

<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 10 10"
    fill="none"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path d="M3.5 9L7.5 5L3.5 1" />
  </svg>
</template>

