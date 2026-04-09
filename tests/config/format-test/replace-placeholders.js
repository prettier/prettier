import {
  CURSOR_PLACEHOLDER,
  RANGE_END_PLACEHOLDER,
  RANGE_START_PLACEHOLDER,
} from "./constants.js";

const indexProperties = [
  {
    property: "cursorOffset",
    placeholder: CURSOR_PLACEHOLDER,
  },
  {
    property: "rangeStart",
    placeholder: RANGE_START_PLACEHOLDER,
  },
  {
    property: "rangeEnd",
    placeholder: RANGE_END_PLACEHOLDER,
  },
];

/**
@param {string} originalText
@param {any} originalOptions
*/
function replacePlaceholders(originalText, originalOptions) {
  const indexes = indexProperties
    .map(({ property, placeholder }) => {
      const value = originalText.indexOf(placeholder);
      return value === -1 ? undefined : { property, value, placeholder };
    })
    .filter(Boolean)
    .sort((a, b) => a.value - b.value);

  const options = { ...originalOptions };
  let text = originalText;
  let offset = 0;
  for (const { property, value, placeholder } of indexes) {
    text = text.replace(placeholder, "");
    options[property] = value + offset;
    offset -= placeholder.length;
  }
  return { text, options };
}

export { replacePlaceholders };
