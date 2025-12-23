<script setup>
import CodeEditor from "./CodeEditor.vue";
</script>

<template>
  <CodeEditor
    :read-only="true"
    :line-numbers="true"
    ruler-color="currentColor"
  />
</template>
