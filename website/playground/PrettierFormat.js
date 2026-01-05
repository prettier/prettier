import { onMounted, reactive, toRaw, watch } from "vue";
import { editorState } from "./composables/editor-state.js";
import { worker } from "./composables/prettier-worker.js";

function setup(props, { slots }) {
  const state = reactive({ formatted: "", debug: {} });

  const componentDidMount = () => {
    format();
  };

  const format = async () => {
    const {
      showAst: ast,
      showPreprocessedAst: preprocessedAst,
      showDoc: doc,
      showComments: comments,
      showSecondFormat: reformat,
      rethrowEmbedErrors,
    } = editorState;

    const result = await worker.format(props.code, toRaw(props.options), {
      ast,
      preprocessedAst,
      doc,
      comments,
      reformat,
      rethrowEmbedErrors,
    });

    Object.assign(state, result);
  };

  const render = () => slots.default(state);

  onMounted(componentDidMount);
  watch(
    () => [
      props.code,
      props.options,
      editorState.showAst,
      editorState.showPreprocessedAst,
      editorState.showDoc,
      editorState.showComments,
      editorState.reformat,
      editorState.rethrowEmbedErrors,
    ],
    () => {
      format();
    },
    { deep: true },
  );
  return render;
}

export default {
  name: "PrettierFormat",
  props: {
    code: String,
    options: Object,
  },
  setup,
};
