import React from "react";

import { Checkbox } from "./inputs";

export function BooleanOption({ option, value, onChange }) {
  function maybeInvert(value) {
    return option.inverted ? !value : value;
  }
  return (
    <Checkbox
      label={option.cliName}
      checked={maybeInvert(value)}
      onChange={checked => onChange(option, maybeInvert(checked))}
    />
  );
}

export function ChoiceOption({ option, value, onChange }) {
  return (
    <label>
      {option.cliName}{" "}
      <select onChange={ev => onChange(option, ev.target.value)}>
        {option.choices.map(choice => (
          <option value={choice.value} selected={choice.value === value}>
            {choice.value}
          </option>
        ))}
      </select>
    </label>
  );
}

export function NumberOption({ option, value, onChange }) {
  return (
    <label>
      {option.cliName}{" "}
      <input
        type="number"
        min={option.range.start}
        max={option.range.end}
        step={option.range.step}
        value={value}
        onChange={ev => onChange(option, parseInt(ev.target.value, 10))}
      />
    </label>
  );
}

export default function(props) {
  switch (props.option.type) {
    case "boolean":
      return <BooleanOption {...props} />;
    case "int":
      return <NumberOption {...props} />;
    case "choice":
      return <ChoiceOption {...props} />;
    default:
      throw new Error("unsupported type");
  }
}
