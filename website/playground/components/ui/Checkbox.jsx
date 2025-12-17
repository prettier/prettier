import { CheckIcon } from "../Icons.jsx";

export default function Checkbox({ label, title, checked }, { emit }) {
  const onChange = (value) => emit("change", value);
  return (
    <label class="checkbox__label" title={title}>
      <span
        class={`checkbox__root ${checked ? "checkbox--checked" : "checkbox--unchecked"}`}
      >
        <input
          type="checkbox"
          class="checkbox__input"
          checked={checked}
          onChange={(ev) => onChange(ev.target.checked)}
        />
        <span
          class={`checkbox__indicator ${!checked ? "checkbox__indicator--hidden" : ""}`}
        >
          <CheckIcon class="checkbox__icon" />
        </span>
      </span>
      {label}
    </label>
  );
}

Checkbox.props = {
  label: { type: String, required: true },
  title: { type: String, default: "" },
  checked: { type: Boolean, required: true },
};

Checkbox.emits = ["change"];
