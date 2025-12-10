export function Checkbox({ label: _label, title, checked }, { emit }) {
  const onChange = (value) => emit("change", value);
  return (
    <label title={title}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(ev) => onChange(ev.target.checked)}
      />{" "}
      {_label}
    </label>
  );
}
Checkbox.props = {
  label: { type: String, required: true },
  title: { type: String, default: "" },
  checked: { type: Boolean, required: true },
};
Checkbox.emits = ["change"];

export function Select({ label: _label, title, values, selected }, { emit }) {
  const onChange = (value) => emit("change", value);
  return (
    <label title={title}>
      {_label}{" "}
      <select value={selected} onChange={(ev) => onChange(ev.target.value)}>
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

export function NumberInput(
  { label: _label, title, value, min, max, step },
  { emit },
) {
  const onChange = (value) => emit("change", value);
  return (
    <label title={title}>
      {_label}{" "}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(ev) => onChange(Number.parseInt(ev.target.value, 10))}
      />
    </label>
  );
}
NumberInput.props = {
  label: { type: String, required: true },
  title: { type: String, required: true },
  value: { type: Number, default: undefined },
  min: { type: Number, default: undefined },
  max: { type: Number, default: undefined },
  step: { type: Number, default: undefined },
};
NumberInput.emits = ["change"];
