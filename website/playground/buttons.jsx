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
    const showTooltipValue = ref(false);
    const tooltipText = ref("");
    const buttonRef = ref(null);
    let timer = null;
    let clipboard = null;

    onMounted(() => {
      const showTooltip = (text) => {
        showTooltipValue.value = true;
        tooltipText.value = text;

        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          timer = null;
          showTooltipValue.value = false;
        }, 2000);
      };

      clipboard = new ClipboardJS(buttonRef.value, {
        text: () => {
          const { copy } = props;
          return typeof copy === "function" ? copy() : copy;
        },
      });
      clipboard.on("success", () => showTooltip("Copied!"));
      clipboard.on("error", () => showTooltip("Press ctrl+c to copy"));
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
        {showTooltipValue.value ? (
          <span class="tooltip">{tooltipText.value}</span>
        ) : null}
        {slots.default?.()}
      </button>
    );
  },
};
