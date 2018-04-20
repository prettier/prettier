import React from "react";
import groupBy from "lodash.groupby";

import { SidebarCategory } from "./components";
import Option from "./options";

export default function({
  categories,
  availableOptions,
  enabledOptions,
  optionValues,
  onOptionValueChange
}) {
  const options = groupBy(availableOptions, "category");
  return categories.map(
    category =>
      options[category] ? (
        <SidebarCategory key={category} title={category}>
          {options[category].map(
            option =>
              enabledOptions.includes(option.name) ? (
                <Option
                  key={option.name}
                  option={option}
                  value={optionValues[option.name]}
                  onChange={onOptionValueChange}
                />
              ) : null
          )}
        </SidebarCategory>
      ) : null
  );
}
