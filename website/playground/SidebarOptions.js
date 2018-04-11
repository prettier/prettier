import React from "react";

import Option from "./Option";

const CATEGORIES_ORDER = ["Global", "JavaScript", "Markdown", "Special"];

export default function({
  availableOptions,
  currentOptions,
  onOptionValueChange
}) {
  const optionsByCategory = availableOptions.reduce((acc, option) => {
    let options;
    acc[option.category] = options = acc[option.category] || [];
    options.push(option);
    return acc;
  }, {});

  return CATEGORIES_ORDER.map(category => (
    <details key={category} className="sub-options" open="true">
      <summary>{category}</summary>

      {(optionsByCategory[category] || []).map(option => (
        <Option
          key={option.name}
          option={option}
          value={currentOptions[option.name]}
          onChange={onOptionValueChange}
        />
      ))}
    </details>
  ));
}
