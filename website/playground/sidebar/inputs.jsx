export function Checkbox(props, { emit }) {
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
}
Checkbox.props = {
  label: { type: String, required: true },
  title: { type: String, required: true },
  checked: { type: Boolean, required: true },
};
Checkbox.emits = ["change"];

export function Select(props, { emit }) {
  const { label, title, values, selected } = props;
  return (
    <label title={title}>
      {label}{" "}
      <select value={selected} onChange={(ev) => emit("change", ev.target.value)}>
        {values.map((val) => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </select>
    </label>
  );
}
Select.props = {
  label: { type: String, required: true },
  title: { type: String, required: true },
  values: { type: Array, required: true },
  selected: { type: String, required: true },
};
Select.emits = ["change"];

export function NumberInput(props, { emit }) {
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
}
NumberInput.props = {
  label: { type: String, required: true },
  title: { type: String, required: true },
  value: { type: Number, required: true },
  min: { type: Number, default: undefined },
  max: { type: Number, default: undefined },
  step: { type: Number, default: undefined },
};
NumberInput.emits = ["change"];
