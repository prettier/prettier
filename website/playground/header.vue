<script setup>
import GithubButton from "./github-button.vue";
import ThemeToggle from "./theme-toggle.vue";
import VersionLink from "./version-link.vue";

const logo = "/icon.png";

defineProps({ version: { type: String, required: true } });
</script>

<template>
  <header>
    <a href="/" class="logo-wrapper">
      <img class="logo" :src="logo" alt="" />
      <h1>Prettier <VersionLink :version></VersionLink></h1>
    </a>

    <span class="links">
      <GithubButton
        href="https://github.com/prettier/prettier"
        dataShowCount="true"
        class="github-button"
        aria-label="Star prettier on GitHub"
        >GitHub</GithubButton
      >
      <ThemeToggle></ThemeToggle>
    </span>
  </header>
</template>

<style>
.links {
  display: flex;
  gap: 8px;
  font-size: 16px;
  align-items: flex-end;
}

.links > * {
  display: flex;
}

.github-button span {
  display: flex;
}
</style>
