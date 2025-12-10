import { Checkbox, NumberInput, Select } from "./inputs.jsx";

function BooleanOption({ option, value }, { emit }) {
  const onChange = (option, value) => emit("change", option, value);
  function maybeInvert(value) {
    return option.inverted ? !value : value;
  }
  return (
    <Checkbox
      label={option.cliName}
      title={getDescription(option)}
      checked={maybeInvert(value)}
      onChange={(checked) => onChange(option, maybeInvert(checked))}
    />
  );
}
BooleanOption.props = {
  option: { type: Object, required: true },
  value: { type: Boolean, required: true },
};
BooleanOption.emits = ["change"];

function ChoiceOption({ option, value }, { emit }) {
  const onChange = (option, val) => emit("change", option, val);
  return (
    <Select
      label={option.cliName}
      title={getDescription(option)}
      values={option.choices.map((choice) => choice.value)}
      selected={value}
      onChange={(val) => onChange(option, val)}
    />
  );
}
ChoiceOption.props = {
  option: { type: Object, required: true },
  value: { type: String, required: true },
};
ChoiceOption.emits = ["change"];

function NumberOption({ option, value }, { emit }) {
  const onChange = (option, val) => emit("change", option, val);
  return (
    <NumberInput
      label={option.cliName}
      title={getDescription(option)}
      min={option.range.start}
      max={option.range.end}
      step={option.range.step}
      value={value}
      onChange={(val) => onChange(option, val)}
    />
  );
}
NumberOption.props = {
  option: { type: Object, required: true },
  value: { type: Number, default: undefined },
};
NumberOption.emits = ["change"];

export default function Option(props, { emit }) {
  const onChange = (option, value) => emit("change", option, value);

  switch (props.option.type) {
    case "boolean":
      return <BooleanOption {...props} onChange={onChange} />;
    case "int":
      return <NumberOption {...props} onChange={onChange} />;
    case "choice":
      return <ChoiceOption {...props} onChange={onChange} />;
    default:
      throw new Error("unsupported type");
  }
}
Option.props = {
  option: { type: Object, required: true },
  value: { type: [Boolean, String, Number], default: undefined },
};
Option.emits = ["change"];

function getDescription(option) {
  const description = option.inverted
    ? option.oppositeDescription
    : option.description;
  return description && description.replaceAll("\n", " ");
}
