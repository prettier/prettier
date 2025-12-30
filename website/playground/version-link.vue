<script setup>
import { computed, watch } from "vue";

const props = defineProps({ version: { type: String, required: true } });

const versionData = computed(() => {
  const match = props.version.match(/^pr-(\d+)$/);
  let href;
  if (match) {
    href = `pull/${match[1]}`;
  } else if (/\.0$/.test(props.version)) {
    href = `releases/tag/${props.version}`;
  } else {
    href = `blob/main/CHANGELOG.md#${props.version.replaceAll(".", "")}`;
  }

  return {
    href,
    formattedVersion: match ? `PR #${match[1]}` : `v${props.version}`,
  };
});

watch(
  () => props.version,
  () => {
    document.title = `Prettier ${versionData.value.formattedVersion}`;
  },
);
</script>

<template>
  <a
    :href="`https://github.com/prettier/prettier/${versionData.href}`"
    target="_blank"
    rel="noreferrer noopener"
    class="version"
  >
    {{ versionData.formattedVersion }}
  </a>
</template>

<style>
.version {
  font-size: 0.5em;
  line-height: 0;
  opacity: 0.5;
}
</style>
