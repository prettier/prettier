<script setup>
import CodeEditor from "./CodeEditor.vue";
</script>

<template>
  <CodeEditor
    v-bind="$attrs"
    :read-only="true"
    :line-numbers="true"
    ruler-color="currentColor"
  />
</template>

