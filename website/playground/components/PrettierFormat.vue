<script setup>
import { inject, onMounted, toRaw, watch } from "vue";

const props = defineProps({
  worker: { type: Object, required: true },
  code: { type: String, required: true },
  options: { type: Object, required: true },
});

const playgroundState = inject("playgroundState");
const prettierFormatState = inject("prettierFormatState");

const format = async () => {
  let { worker, code, options } = props;
  options = toRaw(options);

  const result = await worker.format(code, options, {
    ast: playgroundState.showAst,
    preprocessedAst: playgroundState.showPreprocessedAst,
    doc: playgroundState.showDoc,
    comments: playgroundState.showComments,
    reformat: playgroundState.showSecondFormat,
    rethrowEmbedErrors: playgroundState.rethrowEmbedErrors,
  });

  Object.assign(prettierFormatState, result);
};

onMounted(() => {
  format();
});

watch(
  () => [
    props.code,
    props.options,
    playgroundState.showAst,
    playgroundState.showPreprocessedAst,
    playgroundState.showDoc,
    playgroundState.showComments,
    playgroundState.showSecondFormat,
    playgroundState.rethrowEmbedErrors,
  ],
  () => {
    format();
  },
  { deep: true },
);
</script>

<template>
  <slot />
</template>
