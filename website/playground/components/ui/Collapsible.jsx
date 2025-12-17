import { nextTick, onMounted, reactive, useTemplateRef } from "vue";
import { ChevronIcon } from "../Icons.jsx";

function setup(props, { slots }) {
  const state = reactive({
    isOpen: props.defaultOpen ?? true,
    panelHeight: "auto",
    isTransitioning: false,
  });

  const contentRef = useTemplateRef("collapsibleContent");

  const toggleOpen = () => {
    if (state.isTransitioning) {
      return;
    }

    if (state.isOpen) {
      const content = contentRef.value;
      if (!content) {
        return;
      }

      const startHeight = content.scrollHeight;
      state.panelHeight = `${startHeight}px`;
      state.isTransitioning = true;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          state.panelHeight = "0px";
        });
      });
    } else {
      state.panelHeight = "0px";
      state.isOpen = true;
      state.isTransitioning = true;

      nextTick(() => {
        const content = contentRef.value;
        if (!content) {
          return;
        }

        const targetHeight = content.scrollHeight;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            state.panelHeight = `${targetHeight}px`;
          });
        });
      });
    }
  };

  const handleTransitionEnd = () => {
    state.isTransitioning = false;
    if (state.panelHeight === "0px") {
      state.isOpen = false;
    } else {
      state.panelHeight = "auto";
    }
  };

  const componentDidMount = () => {
    if (state.isOpen && contentRef.value) {
      state.panelHeight = "auto";
    }
  };

  const render = () => {
    const children = slots.default?.() || [];

    return (
      <div class="collapsible">
        <button
          type="button"
          class="collapsible__trigger"
          onClick={toggleOpen}
          data-state={state.isOpen ? "open" : "closed"}
          aria-expanded={state.isOpen}
        >
          <ChevronIcon class="collapsible__icon" />
          {props.title}
        </button>
        <div
          class="collapsible__panel"
          style={{
            height: state.panelHeight,
            display: !state.isOpen && !state.isTransitioning ? "none" : "block",
          }}
          onTransitionend={handleTransitionEnd}
        >
          <div ref="collapsibleContent" class="collapsible__content">
            {children}
          </div>
        </div>
      </div>
    );
  };

  onMounted(componentDidMount);
  return render;
}

export default {
  name: "Collapsible",
  props: {
    title: { type: String, required: true },
    defaultOpen: { type: Boolean, default: true },
  },
  setup,
};
