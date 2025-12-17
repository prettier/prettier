import { onMounted, reactive, useTemplateRef } from "vue";
import Button from "./Button";

const { ClipboardJS } = window;

function setup(props, { slots, attrs }) {
  const state = reactive({ showTooltip: false, tooltipText: "" });
  let timer = null;
  const buttonRef = useTemplateRef("button");

  const componentDidMount = () => {
    const clipboard = new ClipboardJS(buttonRef.value, {
      text() {
        const { copy } = props;
        return typeof copy === "function" ? copy() : copy;
      },
    });
    clipboard.on("success", () => showTooltip("Copied!"));
    clipboard.on("error", () => showTooltip("Press ctrl+c to copy"));
  };

  const showTooltip = (text) => {
    Object.assign(state, { showTooltip: true, tooltipText: text });

    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      Object.assign(state, { showTooltip: false });
    }, 2000);
  };

  const render = () => {
    const { showTooltip, tooltipText } = state;
    const children = slots.default();

    return (
      <Button ref="button" variant={props.variant} {...attrs}>
        <span
          class={["button__tooltip", showTooltip && "button__tooltip--visible"]}
        >
          {tooltipText}
        </span>
        {children}
      </Button>
    );
  };

  onMounted(componentDidMount);
  return render;
}

export default {
  name: "ClipboardButton",
  props: {
    copy: { type: [String, Function], required: true },
    variant: { type: String },
  },
  setup,
};
