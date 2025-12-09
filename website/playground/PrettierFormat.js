import { reactive, watch, onMounted } from "vue";

export default function PrettierFormat(props, { slots }) {
  const state = reactive({ formatted: "", debug: {} });

  const format = async () => {
    const {
      worker,
      code,
      options,
      debugAst: ast,
      debugPreprocessedAst: preprocessedAst,
      debugDoc: doc,
      debugComments: comments,
      reformat,
      rethrowEmbedErrors,
    } = props;

    const result = await worker.format(code, options, {
      ast,
      preprocessedAst,
      doc,
      comments,
      reformat,
      rethrowEmbedErrors,
    });

    Object.assign(state, result);
  };

  onMounted(() => {
    format();
  });

  watch(
    () => [
      props.code,
      props.options,
      props.debugAst,
      props.debugPreprocessedAst,
      props.debugDoc,
      props.debugComments,
      props.reformat,
      props.rethrowEmbedErrors,
    ],
    () => {
      format();
    },
    { deep: true },
  );

  return () => slots.default?.(state);
}
