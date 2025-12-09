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

export default {
  name: "SidebarOptions",
  props: {
    categories: { type: Array, required: true },
    availableOptions: { type: Array, required: true },
    optionValues: { type: Object, required: true },
  },
  emits: ["option-value-change"],
  setup(props, { emit }) {
    return () => {
      const { categories, availableOptions, optionValues } = props;
      const options = groupBy(availableOptions, (option) => option.category);
      return categories.map((category) =>
        options[category] ? (
          <SidebarCategory key={category} title={category}>
            {options[category].map((option) => (
              <Option
                key={option.name}
                option={option}
                value={optionValues[option.name]}
                onChange={(option, val) =>
                  emit("option-value-change", option, val)
                }
              />
            ))}
          </SidebarCategory>
        ) : null,
      );
    };
  },
};
