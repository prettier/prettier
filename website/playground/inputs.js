import React from "react";

export function Checkbox({ label: _label, checked, onChange }) {
  return (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={ev => onChange(ev.target.checked)}
      />{" "}
      {_label}
    </label>
  );
}
