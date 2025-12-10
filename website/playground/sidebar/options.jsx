import { Checkbox, NumberInput, Select } from "./inputs.jsx";

function BooleanOption({ option, value }, { emit }) {
  function maybeInvert(value) {
    return option.inverted ? !value : value;
  }
  return (
    <Checkbox
      label={option.cliName}
      title={getDescription(option)}
      checked={maybeInvert(value)}
      onChange={(checked) => emit("change", option, maybeInvert(checked))}
    />
  );
}
BooleanOption.props = {
  option: { type: Object, required: true },
  value: { type: Boolean, required: true },
};
BooleanOption.emits = ["change"];

function ChoiceOption({ option, value }, { emit }) {
  return (
    <Select
      label={option.cliName}
      title={getDescription(option)}
      values={option.choices.map((choice) => choice.value)}
      selected={value}
      onChange={(val) => emit("change", option, val)}
    />
  );
}
ChoiceOption.props = {
  option: { type: Object, required: true },
  value: { type: String, required: true },
};
ChoiceOption.emits = ["change"];

function NumberOption({ option, value }, { emit }) {
  return (
    <NumberInput
      label={option.cliName}
      title={getDescription(option)}
      min={option.range.start}
      max={option.range.end}
      step={option.range.step}
      value={value}
      onChange={(val) => emit("change", option, val)}
    />
  );
}
NumberOption.props = {
  option: { type: Object, required: true },
  value: { type: Number, required: true },
};
NumberOption.emits = ["change"];

export default function Option(props, { emit }) {
  const { option } = props;

  switch (option.type) {
    case "boolean":
      return <BooleanOption {...props} onChange={(opt, val) => emit("change", opt, val)} />;
    case "int":
      return <NumberOption {...props} onChange={(opt, val) => emit("change", opt, val)} />;
    case "choice":
      return <ChoiceOption {...props} onChange={(opt, val) => emit("change", opt, val)} />;
    default:
      throw new Error("unsupported type");
  }
}
Option.props = {
  option: { type: Object, required: true },
  value: { type: [Boolean, String, Number], required: true },
};
Option.emits = ["change"];

function getDescription(option) {
  const description = option.inverted
    ? option.oppositeDescription
    : option.description;
  return description && description.replaceAll("\n", " ");
}
