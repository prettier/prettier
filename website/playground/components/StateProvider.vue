<script setup>
import { watch, provide } from "vue";
import { STORE_KEY } from "../constants/index.js";
import * as storage from "../utils/storage.js";
import {
  usePlaygroundState,
  usePrettierFormatState,
} from "../composables/use-playground-state.js";

const playgroundState = usePlaygroundState();
const prettierFormatState = usePrettierFormatState();

// Persist playground state changes to local storage
watch(
  playgroundState,
  (newState) => {
    storage.set(STORE_KEY, newState);
  },
  { deep: true },
);

provide("playgroundState", playgroundState);
provide("prettierFormatState", prettierFormatState);
</script>

<template>
  <slot />
</template>
