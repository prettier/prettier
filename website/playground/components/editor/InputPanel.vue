<script setup>
import CodeEditor from "./CodeEditor.vue";
</script>

<template>
  <CodeEditor
    :line-numbers="true"
    :auto-close-brackets="true"
    :match-brackets="true"
    :show-cursor-when-selecting="true"
    :tab-size="4"
    ruler-color="color-mix(in oklab, currentColor 10%, transparent)"
  />
</template>
