import { Checkbox, NumberInput, Select } from "./inputs.jsx";

const BooleanOption = {
  name: "BooleanOption",
  props: {
    option: { type: Object, required: true },
    value: { type: Boolean, required: true },
  },
  emits: ["change"],
  setup(props, { emit }) {
    const maybeInvert = (value) =>
      props.option.inverted ? !value : value;

    return () => (
      <Checkbox
        label={props.option.cliName}
        title={getDescription(props.option)}
        checked={maybeInvert(props.value)}
        onChange={(checked) => emit("change", props.option, maybeInvert(checked))}
      />
    );
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
    return () => (
      <Select
        label={props.option.cliName}
        title={getDescription(props.option)}
        values={props.option.choices.map((choice) => choice.value)}
        selected={props.value}
        onChange={(val) => emit("change", props.option, val)}
      />
    );
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
    return () => (
      <NumberInput
        label={props.option.cliName}
        title={getDescription(props.option)}
        min={props.option.range.start}
        max={props.option.range.end}
        step={props.option.range.step}
        value={props.value}
        onChange={(val) => emit("change", props.option, val)}
      />
    );
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
      const componentProps = {
        option: props.option,
        value: props.value,
        onChange: (option, val) => emit("change", option, val),
      };

      switch (props.option.type) {
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
