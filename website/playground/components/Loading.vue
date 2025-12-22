<script setup>
import LoadingIcon from "./icons/LoadingIcon.vue";
</script>

<template>
  <div class="loading-container">
    <LoadingIcon width="48" height="48" />
    Loading ...
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  height: 100%;
  color: var(--color-text);
  font-size: 1.5rem;
}
</style>
