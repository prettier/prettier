import { onMounted, reactive, toRaw, watch } from "vue";
import { settings } from "./composables/playground-settings.js";
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
    } = settings;

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
      settings.showAst,
      settings.showPreprocessedAst,
      settings.showDoc,
      settings.showComments,
      settings.showSecondFormat,
      settings.rethrowEmbedErrors,
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
