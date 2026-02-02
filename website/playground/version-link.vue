<script setup>
import { computed, watch, onMounted, ref } from "vue";

const props = defineProps({
  version: { type: String, required: true },
  selectedVersion: { type: String, default: "stable" },
  hasNextVersion: { type: Boolean, default: false },
});

const emit = defineEmits(["update:selectedVersion"]);

const versionData = computed(() => {
  const match = props.version.match(/^pr-(\d+)$/);

  if (props.selectedVersion === "next") {
    return {
      next: match ? `PR #${match[1]}` : `v${props.version}`,
      stable: "stable",
    };
  } else {
    return {
      next: "next",
      stable: `v${props.version}`,
    };
  }
});

const updateTitle = () => {
  document.title = `Prettier ${versionData.value[props.selectedVersion]}`;
};

function onVersionChange(event) {
  const newValue = event.target.value;
  if (newValue !== props.selectedVersion) {
    emit("update:selectedVersion", newValue);
  }
}

watch(() => props.version, updateTitle);

onMounted(updateTitle);
</script>

<template>
  <span class="version-wrapper">
    <select
      v-if="hasNextVersion"
      class="version-select"
      :value="selectedVersion"
      @click.stop
      @change="onVersionChange"
    >
      <option value="stable">{{ versionData.stable }}</option>
      <option value="next">{{ versionData.next }}</option>
    </select>
    <span v-else class="version-label">{{ versionData.stable }}</span>
  </span>
</template>
