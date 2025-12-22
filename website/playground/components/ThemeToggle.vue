<script setup>
import { theme, toggleTheme } from "../composables/theme.js";
import DarkIcon from "./icons/DarkIcon.vue";
import LightIcon from "./icons/LightIcon.vue";
import Button from "./ui/Button.vue";
</script>

<template>
  <Button @click="toggleTheme" icon>
    <DarkIcon v-if="theme === 'dark'" />
    <LightIcon v-else />
  </Button>
</template>
