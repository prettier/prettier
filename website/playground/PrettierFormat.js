import { onMounted, reactive, toRaw, watch } from "vue";
import { settings } from "./composables/playground-settings.js";
import { worker } from "./composables/prettier-worker.js";
import { version } from "./composables/use-version.js";

function setup(props, { slots }) {
  const state = reactive({ formatted: "", debug: {} });

  const componentDidMount = () => {
    format();
  };

  const format = async () => {
    const result = await worker.format(
      props.code,
      toRaw(props.options),
      toRaw(settings),
      version.value,
    );

    Object.assign(state, result);
  };

  const render = () => slots.default(state);

  onMounted(componentDidMount);
  watch(() => props.code, format);
  watch(() => props.options, format, { deep: true });
  watch(() => version.value, format);

  // Should not trigger format when these changes
  const ignoredKeys = new Set(["showSidebar", "showInput"]);
  for (const key of Object.keys(settings).filter(
    (key) => !ignoredKeys.has(key),
  )) {
    watch(
      () => settings[key],
      (newValue, oldValue) => {
        // Always triggers format
        if (key === "rethrowEmbedErrors" && newValue !== oldValue) {
          return format();
        }
        // Only if set to true
        if (newValue) {
          return format();
        }
      },
    );
  }

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
