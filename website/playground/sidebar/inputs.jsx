export const Checkbox = {
  name: "Checkbox",
  props: {
    label: { type: String, required: true },
    title: { type: String, required: true },
    checked: { type: Boolean, required: true },
  },
  emits: ["change"],
  setup(props, { emit }) {
    return () => {
      const { label, title, checked } = props;
      return (
        <label title={title}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(ev) => emit("change", ev.target.checked)}
          />{" "}
          {label}
        </label>
      );
    };
  },
};

export const Select = {
  name: "Select",
  props: {
    label: { type: String, required: true },
    title: { type: String, required: true },
    values: { type: Array, required: true },
    selected: { type: String, required: true },
  },
  emits: ["change"],
  setup(props, { emit }) {
    return () => {
      const { label, title, values, selected } = props;
      return (
        <label title={title}>
          {label}{" "}
          <select
            value={selected}
            onChange={(ev) => emit("change", ev.target.value)}
          >
            {values.map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        </label>
      );
    };
  },
};

export const NumberInput = {
  name: "NumberInput",
  props: {
    label: { type: String, required: true },
    title: { type: String, required: true },
    value: { type: Number, required: true },
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    step: { type: Number, required: true },
  },
  emits: ["change"],
  setup(props, { emit }) {
    return () => {
      const { label, title, value, min, max, step } = props;
      return (
        <label title={title}>
          {label}{" "}
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(ev) =>
              emit("change", Number.parseInt(ev.target.value, 10))
            }
          />
        </label>
      );
    };
  },
};
