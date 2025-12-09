import { Checkbox, NumberInput, Select } from "./inputs.jsx";

const BooleanOption = {
  name: "BooleanOption",
  props: {
    option: { type: Object, required: true },
    value: { type: Boolean, required: true },
  },
  emits: ["change"],
  setup(props, { emit }) {
    const maybeInvert = (value) => (props.option.inverted ? !value : value);

    return () => {
      const { option, value } = props;
      return (
        <Checkbox
          label={option.cliName}
          title={getDescription(option)}
          checked={maybeInvert(value)}
          onChange={(checked) => emit("change", option, maybeInvert(checked))}
        />
      );
    };
  },
};

const ChoiceOption = {
  name: "ChoiceOption",
  props: {
    option: { type: Object, required: true },
    value: { type: String, required: true },
  },
  emits: ["change"],
  setup(props, { emit }) {
    return () => {
      const { option, value } = props;
      return (
        <Select
          label={option.cliName}
          title={getDescription(option)}
          values={option.choices.map((choice) => choice.value)}
          selected={value}
          onChange={(val) => emit("change", option, val)}
        />
      );
    };
  },
};

const NumberOption = {
  name: "NumberOption",
  props: {
    option: { type: Object, required: true },
    value: { type: Number, required: true },
  },
  emits: ["change"],
  setup(props, { emit }) {
    return () => {
      const { option, value } = props;
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
    };
  },
};

export default {
  name: "Option",
  props: {
    option: { type: Object, required: true },
    value: { type: [Boolean, String, Number], required: true },
  },
  emits: ["change"],
  setup(props, { emit }) {
    return () => {
      const { option, value } = props;
      const componentProps = {
        option,
        value,
        onChange: (option, val) => emit("change", option, val),
      };

      switch (option.type) {
        case "boolean":
          return <BooleanOption {...componentProps} />;
        case "int":
          return <NumberOption {...componentProps} />;
        case "choice":
          return <ChoiceOption {...componentProps} />;
        default:
          throw new Error("unsupported type");
      }
    };
  },
};

function getDescription(option) {
  const description = option.inverted
    ? option.oppositeDescription
    : option.description;
  return description && description.replaceAll("\n", " ");
}
