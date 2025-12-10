import { onMounted, reactive, ref } from "vue";

const { ClipboardJS } = window;

export const Button = (props, { slots, attrs }) => (
  <button type="button" class="btn" {...attrs}>
    {slots.default()}
  </button>
);

function setup(props, { slots, attrs }) {
  const state = reactive({ showTooltip: false, tooltipText: "" });
  let timer = null;
  const buttonRef = ref();

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
      <Button ref={buttonRef} {...attrs}>
        {showTooltip ? <span class="tooltip">{tooltipText}</span> : null}
        {children}
      </Button>
    );
  };

  onMounted(componentDidMount);
  return render;
}

export const ClipboardButton = {
  name: "ClipboardButton",
  props: {
    copy: { type: [String, Function], required: true },
  },
  setup,
};
