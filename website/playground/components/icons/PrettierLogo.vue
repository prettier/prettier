<script setup>
import darkLogo from "../../assets/prettier-icon-dark.svg";
import lightLogo from "../../assets/prettier-icon-light.svg";
import { theme } from "../../composables/theme";
</script>

<template>
  <img :src="theme === 'dark' ? darkLogo : lightLogo" alt="Prettier" />
</template>

