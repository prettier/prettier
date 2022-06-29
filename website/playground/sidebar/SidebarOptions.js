import * as React from "react";
import { groupBy } from "../util.js";

import { SidebarCategory } from "./components.js";
import Option from "./options.js";

export default function SidebarOptions({
  categories,
  availableOptions,
  optionValues,
  onOptionValueChange,
}) {
  const options = groupBy(availableOptions, (option) => option.category);
  return categories.map((category) =>
    options[category] ? (
      <SidebarCategory key={category} title={category}>
        {options[category].map((option) => (
          <Option
            key={option.name}
            option={option}
            value={optionValues[option.name]}
            onChange={onOptionValueChange}
          />
        ))}
      </SidebarCategory>
    ) : null
  );
}
