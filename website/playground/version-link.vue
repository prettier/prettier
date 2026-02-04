<script setup>
import { computed, watch, onMounted } from "vue";
import { settings } from "./composables/playground-settings.js";

const props = defineProps({
  version: { type: Object, required: true },
});

const updateTitle = () => {
  document.title = versionData.value.title;
};

function onVersionChange(event) {
  settings.version = event.target.value;
}

const versionData = computed(() => {
  const version = props.version;

  if (version.name === "stable") {
    return {
      text: `v${version.version}`,
      title: `Prettier v${version.version}`,
      link: `https://github.com/prettier/prettier/releases/tag/${version.version}`,
    };
  }

  if (version.name === "next" && version.pr) {
    return {
      text: `PR #${version.pr}`,
      title: `Prettier #${version.pr}`,
      link: `https://github.com/prettier/prettier/pull/${version.pr}`,
    };
  }

  const commit = version.gitTree?.commit;

  return {
    text: commit ?? "uncommitted changes",
    title: `Prettier (${commit ?? "uncommitted"})`,
    link: commit
      ? `https://github.com/prettier/prettier/commit/${commit}`
      : "https://github.com/prettier/prettier/",
  };
});

watch(() => props.version, updateTitle);

onMounted(updateTitle);
</script>

<template>
  <span class="version-wrapper">
    <select
      class="channel-select"
      :value="settings.version"
      @change="onVersionChange"
    >
      <option value="stable">stable</option>
      <option value="next">next</option>
    </select>
    <a
      class="version-link"
      :href="versionData.link"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ versionData.text }}
    </a>
  </span>
</template>

<style>
.version-wrapper {
  display: flex;
}

.version-link {
  color: inherit;
  text-decoration: none;
  line-height: 0;
  opacity: 0.5;
  margin-inline-start: 0.5em;
}
</style>
