import { onMounted, reactive, toRaw, watch } from "vue";

export default {
  name: "PrettierFormat",
  props: {
    worker: Object,
    code: String,
    options: Object,
    debugAst: Boolean,
    debugPreprocessedAst: Boolean,
    debugDoc: Boolean,
    debugComments: Boolean,
    reformat: Boolean,
    rethrowEmbedErrors: Boolean,
  },
  setup(props, { slots }) {
    const state = reactive({ formatted: "", debug: {} });

    const componentDidMount = () => {
      format();
    };

    const componentDidUpdate = (_, prevProps) => {
      for (const key of [
        "enabled",
        "code",
        "options",
        "debugAst",
        "debugPreprocessedAst",
        "debugDoc",
        "debugComments",
        "reformat",
        "rethrowEmbedErrors",
      ]) {
        if (prevProps[key] !== props[key]) {
          format();
          break;
        }
      }
    };

    const format = async () => {
      let {
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
      options = toRaw(options);

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

    const render = () => slots.default(state);

    onMounted(componentDidMount);
    watch(() => props, componentDidUpdate, { deep: true });
    return render;
  },
};
