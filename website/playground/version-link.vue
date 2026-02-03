<script setup>
import { computed, watch, onMounted } from "vue";
import { settings } from "./composables/playground-settings.js";

const props = defineProps({
  version: { type: String, required: true },
});

const versionLabel = computed(() => {
  const match = props.version.match(/^pr-(\d+)$/);
  return match ? `PR #${match[1]}` : `v${props.version}`;
});

const updateTitle = () => {
  document.title = `Prettier ${versionLabel.value}`;
};

function onReleaseChannelChange(event) {
  settings.releaseChannel = event.target.value;
}

watch(() => props.version, updateTitle);

onMounted(updateTitle);
</script>

<template>
  <span class="version-wrapper">
    <a
      class="version-link"
      :href="`https://github.com/prettier/prettier/releases/tag/${version}`"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ versionLabel }}
    </a>
    <select
      class="channel-select"
      :value="settings.releaseChannel"
      @click.stop
      @change="onReleaseChannelChange"
    >
      <option value="stable">stable</option>
      <option value="next">next</option>
    </select>
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
}
</style>
