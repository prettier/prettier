<script setup>
import { render } from "github-buttons";
import { useTemplateRef, onMounted } from "vue";

const anchor = useTemplateRef("anchor");

onMounted(() => {
  render(anchor.value, function (el) {
    anchor.value.parentNode.replaceChild(el, anchor.value);
  });
});
</script>

<template>
  <a
    ref="anchor"
    class="github-button"
    href="https://github.com/prettier/prettier"
    data-show-count="true"
    aria-label="Star prettier on GitHub"
  >
    GitHub
  </a>
</template>
