<script setup>
defineProps({
  width: { type: Number, default: 16 },
  height: { type: Number, default: 16 },
});
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    :width="width"
    :height="height"
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M9.37 5.51a7.4 7.4 0 009.12 9.12A7 7 0 119.37 5.51M12 3a9 9 0 108.9 7.64 5.39 5.39 0 01-9.8-3.14 5.4 5.4 0 012.26-4.4Q12.69 3 12 3"
    />
  </svg>
</template>

