export const Checkbox = {
  name: "Checkbox",
  props: {
    label: { type: String, required: true },
    title: { type: String },
    checked: { type: Boolean, required: true },
  },
  emits: ["change"],
  setup(props, { emit }) {
    return () => (
      <label title={props.title}>
        <input
          type="checkbox"
          checked={props.checked}
          onChange={(ev) => emit("change", ev.target.checked)}
        />{" "}
        {props.label}
      </label>
    );
  },
};

export const Select = {
  name: "Select",
  props: {
    label: { type: String, required: true },
    title: { type: String },
    values: { type: Array, required: true },
    selected: { type: String, required: true },
  },
  emits: ["change"],
  setup(props, { emit }) {
    return () => (
      <label title={props.title}>
        {props.label}{" "}
        <select
          value={props.selected}
          onChange={(ev) => emit("change", ev.target.value)}
        >
          {props.values.map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      </label>
    );
  },
};

export const NumberInput = {
  name: "NumberInput",
  props: {
    label: { type: String, required: true },
    title: { type: String },
    value: { type: Number, required: true },
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    step: { type: Number, required: true },
  },
  emits: ["change"],
  setup(props, { emit }) {
    return () => (
      <label title={props.title}>
        {props.label}{" "}
        <input
          type="number"
          min={props.min}
          max={props.max}
          step={props.step}
          value={props.value}
          onChange={(ev) => emit("change", Number.parseInt(ev.target.value, 10))}
        />
      </label>
    );
  },
};
