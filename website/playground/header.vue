<script setup>
import GithubButton from "./github-button.vue";
import ThemeToggle from "./theme-toggle.vue";
import VersionLink from "./version-link.vue";

const logo = "/icon.png";

const props = defineProps({
  version: { type: Object, required: true },
});
</script>

<template>
  <header class="header">
    <a href="/" class="logo-wrapper">
      <img class="logo" :src="logo" alt="" />
      <h1>Prettier</h1>
    </a>

    <VersionLink :version="version" />

    <div class="links">
      <div class="github-button">
        <GithubButton
          href="https://github.com/prettier/prettier"
          dataShowCount="true"
          aria-label="Star prettier on GitHub"
          >GitHub</GithubButton
        >
      </div>
      <ThemeToggle></ThemeToggle>
    </div>
  </header>
</template>

<style>
.header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-wrapper {
  display: flex;
  align-items: center;
}

.logo-wrapper h1 {
  font-size: 20px;
  display: block;
  font-family: inherit;
  font-weight: 400;
  line-height: 18px;
  position: relative;
  margin: 0;
}

.logo {
  height: 34px;
  margin-right: 10px;
}

.links {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}


.github-button span {
  display: flex;
}
</style>
