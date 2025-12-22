<script setup>
import { onMounted } from "vue";

const { version } = defineProps({
  version: {
    type: String,
    required: true,
  },
});

const match = version.match(/^pr-(\d+)$/u);
let href;
if (match) {
  href = `pull/${match[1]}`;
} else if (/\.0$/u.test(version)) {
  href = `releases/tag/${version}`;
} else {
  href = `blob/main/CHANGELOG.md#${version.replaceAll(".", "")}`;
}

const formattedVersion = match ? `PR #${match[1]}` : `v${version}`;

onMounted(() => {
  document.title = `Prettier ${formattedVersion}`;
});
</script>

<template>
  <a
    :href="`https://github.com/prettier/prettier/${href}`"
    target="_blank"
    rel="noreferrer noopener"
  >
    {{ formattedVersion }}
  </a>
</template>
