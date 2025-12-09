import { ref, onMounted, onUnmounted } from "vue";

const { ClipboardJS } = window;

export const Button = (props, { slots }) => (
  <button type="button" class="btn" {...props}>
    {slots.default?.()}
  </button>
);

export const ClipboardButton = {
  name: "ClipboardButton",
  props: {
    copy: [String, Function],
  },
  setup(props, { slots, attrs }) {
    const showTooltip = ref(false);
    const tooltipText = ref("");
    const buttonRef = ref(null);
    let timer = null;
    let clipboard = null;

    const showTooltipMessage = (text) => {
      showTooltip.value = true;
      tooltipText.value = text;

      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        timer = null;
        showTooltip.value = false;
      }, 2000);
    };

    onMounted(() => {
      clipboard = new ClipboardJS(buttonRef.value, {
        text: () => {
          return typeof props.copy === "function" ? props.copy() : props.copy;
        },
      });
      clipboard.on("success", () => showTooltipMessage("Copied!"));
      clipboard.on("error", () => showTooltipMessage("Press ctrl+c to copy"));
    });

    onUnmounted(() => {
      if (clipboard) {
        clipboard.destroy();
      }
      if (timer) {
        clearTimeout(timer);
      }
    });

    return () => (
      <button type="button" class="btn" ref={buttonRef} {...attrs}>
        {showTooltip.value ? (
          <span class="tooltip">{tooltipText.value}</span>
        ) : null}
        {slots.default?.()}
      </button>
    );
  },
};
