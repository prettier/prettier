import { parsing, transform } from "json-test-suite";

const SKIP = new Set([
  // Map keys must be unique
  "object_same_key_unclear_values.json",
  "object_same_key_different_values.json",
  "object_same_key_same_value.json",
  "y_object_duplicated_key_and_value.json",
  "y_object_duplicated_key.json",

  // Document contains trailing content not separated by a ... or --- line
  "i_string_utf16LE_no_BOM.json",

  // Maximum call stack size exceeded
  "i_structure_500_nested_arrays.json",
]);

const cases = [...parsing, ...transform]
  .map(({ name, input, error }) => {
    if (error) {
      return;
    }

    if (SKIP.has(name)) {
      return;
    }

    return {
      name,
      code: input,
    };
  })
  .filter(Boolean);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: cases,
  },
  ["yaml"],
);
