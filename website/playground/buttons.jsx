import ClipboardJS from "clipboard";
import { onMounted, reactive, ref } from "vue";

export const Button = (props, { slots, attrs }) => (
  <button type="button" class="btn" {...attrs}>
    {slots.default()}
  </button>
);

function useTooltip() {
  const state = reactive({ showTooltip: false, tooltipText: "" });
  let timer = null;

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

  const renderTooltip = () =>
    state.showTooltip ? <span class="tooltip">{state.tooltipText}</span> : null;

  return { showTooltip, renderTooltip };
}

function setup(props, { slots, attrs }) {
  const { showTooltip, renderTooltip } = useTooltip();
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

  const render = () => (
    <Button ref={buttonRef} {...attrs}>
      {renderTooltip()}
      {slots.default()}
    </Button>
  );

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

export const PasteButton = {
  name: "PasteButton",
  props: {
    // Receives the clipboard text and returns the message to show
    paste: { type: Function, required: true },
  },
  setup(props, { slots, attrs }) {
    const { showTooltip, renderTooltip } = useTooltip();

    const onClick = async () => {
      let text;
      try {
        text = await navigator.clipboard.readText();
      } catch {
        showTooltip("Unable to read clipboard");
        return;
      }
      showTooltip(await props.paste(text));
    };

    return () => (
      <Button {...attrs} onClick={onClick}>
        {renderTooltip()}
        {slots.default()}
      </Button>
    );
  },
};
