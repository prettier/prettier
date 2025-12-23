<script setup>
import { provide, watch } from "vue";
import {
  usePlaygroundState,
  usePrettierFormatState,
} from "../composables/use-playground-state.js";
import { STORE_KEY } from "../constants/index.js";
import * as storage from "../utils/storage.js";

const playgroundState = usePlaygroundState();
const prettierFormatState = usePrettierFormatState();

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
