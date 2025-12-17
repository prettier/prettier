import {
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  useTemplateRef,
} from "vue";
import { CheckIcon, ChevronUpDownIcon } from "../Icons.jsx";

function setup(props, { emit }) {
  const state = reactive({
    isOpen: false,
    highlightedIndex: -1,
    popupPosition: { top: 0, left: 0, width: 0 },
  });

  const triggerRef = useTemplateRef("selectTrigger");
  const popupRef = useTemplateRef("selectPopup");
  const listRef = useTemplateRef("selectList");

  const onChange = (value) => emit("change", value);

  let scrollContainer = null;
  let originalOverflow = "";

  const findScrollContainer = (element) => {
    if (!element) {
      return null;
    }
    const parent = element.parentElement;
    if (!parent) {
      return null;
    }

    const { overflowY } = window.getComputedStyle(parent);
    if (overflowY === "auto" || overflowY === "scroll") {
      return parent;
    }

    return findScrollContainer(parent);
  };

  const preventScroll = () => {
    if (triggerRef.value) {
      scrollContainer = findScrollContainer(triggerRef.value);
      if (scrollContainer) {
        originalOverflow = scrollContainer.style.overflow;
        scrollContainer.style.overflow = "hidden";
      }
    }
  };

  const restoreScroll = () => {
    if (scrollContainer) {
      scrollContainer.style.overflow = originalOverflow;
      scrollContainer = null;
    }
  };

  const scrollToHighlighted = () => {
    if (listRef.value && state.highlightedIndex >= 0) {
      const items = listRef.value.children;
      if (items[state.highlightedIndex]) {
        items[state.highlightedIndex].scrollIntoView({
          block: "center",
          behavior: "auto",
        });
      }
    }
  };

  const toggleOpen = () => {
    state.isOpen = !state.isOpen;
    if (state.isOpen) {
      preventScroll();
      state.highlightedIndex = props.values.indexOf(props.selected);

      nextTick(() => {
        if (triggerRef.value) {
          const rect = triggerRef.value.getBoundingClientRect();
          state.popupPosition = {
            top: rect.bottom + 8,
            left: rect.left,
            width: rect.width,
          };
        }
        scrollToHighlighted();
      });
    } else {
      restoreScroll();
    }
  };

  const close = () => {
    state.isOpen = false;
    state.highlightedIndex = -1;
    restoreScroll();
  };

  // TODO : keyboard navigation

  const selectItem = (value, ev) => {
    if (ev) {
      ev.preventDefault();
    }
    onChange(value);
    close();
  };

  const handleClickOutside = (ev) => {
    if (
      state.isOpen &&
      triggerRef.value &&
      popupRef.value &&
      !triggerRef.value.contains(ev.target) &&
      !popupRef.value.contains(ev.target)
    ) {
      ev.stopPropagation();
      close();
    }
  };

  const componentDidMount = () => {
    document.addEventListener("click", handleClickOutside);
  };

  const componentWillUnmount = () => {
    document.removeEventListener("click", handleClickOutside);
    restoreScroll();
  };

  const render = () => {
    const displayValue = props.selected || props.values[0] || "";

    return (
      <label class="select__label" title={props.title}>
        <span class="select__label-text">{props.label}</span>
        <div class="select__container">
          <button
            ref="selectTrigger"
            type="button"
            class={`select__trigger ${state.isOpen ? "select__trigger--open" : ""}`}
            onClick={toggleOpen}
            aria-expanded={state.isOpen}
            aria-haspopup="listbox"
          >
            <span class="select__value">{displayValue}</span>
            <span class="select__icon">
              <ChevronUpDownIcon />
            </span>
          </button>
          {state.isOpen && (
            <div
              ref="selectPopup"
              class="select__popup"
              style={{
                position: "fixed",
                top: `${state.popupPosition.top}px`,
                left: `${state.popupPosition.left}px`,
                minWidth: `${state.popupPosition.width}px`,
              }}
            >
              <div ref="selectList" class="select__list" role="listbox">
                {props.values.map((value, index) => {
                  const isSelected = value === props.selected;
                  const isHighlighted = index === state.highlightedIndex;

                  return (
                    <div
                      key={index}
                      class={`select__item ${isHighlighted ? "select__item--highlighted" : ""}`}
                      onClick={(ev) => selectItem(value, ev)}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span class="select__item-indicator">
                        {isSelected && (
                          <CheckIcon class="select__item-indicator-icon" />
                        )}
                      </span>
                      <span class="select__item-text">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </label>
    );
  };

  onMounted(componentDidMount);
  onUnmounted(componentWillUnmount);
  return render;
}

export default {
  name: "Select",
  props: {
    label: { type: String, required: true },
    title: { type: String, required: true },
    values: { type: Array, required: true },
    selected: { type: String, required: true },
  },
  emits: ["change"],
  setup,
};
