<script setup>
import GitHubIcon from "./components/icons/GitHubIcon.vue";
import PrettierLogo from "./components/icons/PrettierLogo.vue";
import ThemeToggle from "./components/ThemeToggle.vue";
import Button from "./components/ui/Button.vue";
import VersionLink from "./components/VersionLink.vue";

defineProps({
  version: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <header class="header">
    <a href="/" class="header__logo-wrapper">
      <PrettierLogo class="header__logo" />
      <h1 class="header__title">
        Prettier Playground
        <span id="version">
          <VersionLink :version="version" />
        </span>
      </h1>
    </a>

    <span class="header__links">
      <Button link icon href="https://github.com/prettier/prettier">
        <GitHubIcon />
      </Button>

      <ThemeToggle />
    </span>
  </header>
</template>

<style scoped>
.header {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  height: 30px;
  padding: 11px 27px;
  border-bottom: 1px solid var(--color-border);
}

.header a,
.header a:visited,
.header a:focus,
.header a:active,
.header a:hover {
  color: inherit;
  text-decoration: none;
}

.header__logo-wrapper {
  display: flex;
  align-items: center;
}

.header__logo {
  height: 24px;
  margin-right: 10px;
}

.header__title {
  position: relative;
  z-index: 9999;
  display: block;
  margin: 0;
  font-family: inherit;
  font-size: 20px;
  font-weight: 400;
  line-height: 18px;
}

#version {
  font-size: 0.5em;
  line-height: 0;
  opacity: 0.5;
}

.header__links {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.header__links > * {
  display: flex;
}

@media (max-width: 400px) {
  .header {
    padding: 10px;
  }
}
</style>
