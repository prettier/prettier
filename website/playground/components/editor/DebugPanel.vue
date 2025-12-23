<script setup>
import CodeEditor from "./CodeEditor.vue";

defineProps({
  value: { type: String, required: true },
  autoFold: { type: RegExp, default: undefined },
});
</script>

<template>
  <CodeEditor
    :read-only="true"
    :line-numbers="false"
    :fold-gutter="true"
    :auto-fold="autoFold"
    :value="value"
    mode="jsx"
  />
</template>
