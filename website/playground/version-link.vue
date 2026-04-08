<script setup>
import { watch, onMounted } from "vue";
import {
  version as playgroundVersion,
  setVersion as setPlaygroundVersion,
} from "./composables/use-version.js";

const props = defineProps({
  version: { type: Object, required: true },
});

const updateTitle = () => {
  document.title = props.version.title;
};

watch(() => props.version.title, updateTitle);

onMounted(updateTitle);
</script>

<template>
  <div class="version-wrapper">
    <select
      class="channel-select"
      :value="playgroundVersion"
      @change="
        (event) => {
          setPlaygroundVersion(event.target.value);
        }
      "
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
  </div>
</template>

<style>
.version-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5em;
  flex: 1;
}

.version-link {
  opacity: 0.5;
}
</style>
