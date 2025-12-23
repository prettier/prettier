<script setup>
import LoadingIcon from "./icons/LoadingIcon.vue";
</script>

<template>
  <div class="loading-container">
    <LoadingIcon />
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
  font-size: 1.5rem;
  color: var(--color-text);
}
</style>
