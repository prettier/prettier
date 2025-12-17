export default function NumberInput(
  { label: _label, title, value, min, max, step },
  { emit },
) {
  const onChange = (value) => emit("change", value);
  return (
    <label class="number-input__label" title={title}>
      {_label}{" "}
      <input
        type="number"
        class="number-input__input"
        min={min}
        max={max}
        step={step}
        value={value ?? ""}
        onChange={(ev) => {
          const numValue =
            ev.target.value === ""
              ? undefined
              : Number.parseInt(ev.target.value, 10);
          onChange(numValue);
        }}
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
