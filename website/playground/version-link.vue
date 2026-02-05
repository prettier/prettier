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
  <span class="version-wrapper">
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
