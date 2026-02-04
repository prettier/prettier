<script setup>
import { watch, onMounted } from "vue";
import { settings } from "./composables/playground-settings.js";

const props = defineProps({
  version: { type: Object, required: true },
});

function onVersionChange(event) {
  settings.version = event.target.value;
}

const updateTitle = () => {
  document.title = props.version.title;
};

watch(() => props.version.title, updateTitle);

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
      :href="version.link"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ version.text }}
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
