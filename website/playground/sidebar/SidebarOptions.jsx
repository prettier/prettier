import { SidebarCategory } from "./components.jsx";
import Option from "./options.jsx";

// Copied from `/src/cli/utilities.js`
function groupBy(array, iteratee) {
  const result = Object.create(null);

  for (const value of array) {
    const key = iteratee(value);

    if (Array.isArray(result[key])) {
      result[key].push(value);
    } else {
      result[key] = [value];
    }
  }

  return result;
}

export default function SidebarOptions(
  { categories, availableOptions, optionValues },
  { emit },
) {
  const onOptionValueChange = (option, value) =>
    emit("option-value-change", option, value);
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
    ) : null,
  );
}
SidebarOptions.props = {
  categories: { type: Array, required: true },
  availableOptions: { type: Array, required: true },
  optionValues: { type: Object, required: true },
};
SidebarOptions.emits = ["option-value-change"];
