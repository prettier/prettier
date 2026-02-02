<script setup>
import GithubButton from "./github-button.vue";
import ThemeToggle from "./theme-toggle.vue";
import VersionLink from "./version-link.vue";

const logo = "/icon.png";

defineProps({
  version: { type: String, required: true },
  selectedVersion: { type: String, required: true },
  hasNextVersion: { type: Boolean, default: false },
});

const emit = defineEmits(["update:selectedVersion"]);
</script>

<template>
  <header>
    <div class="logo-wrapper">
      <a href="/">
        <img class="logo" :src="logo" alt="" />
        <h1>Prettier</h1>
      </a>
      <VersionLink
        :version="version"
        :selectedVersion="selectedVersion"
        :hasNextVersion="hasNextVersion"
        @update:selectedVersion="emit('update:selectedVersion', $event)"
      />
    </div>

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
  align-items: flex-end;
}

.links > * {
  display: flex;
}

.github-button span {
  display: flex;
}
</style>
