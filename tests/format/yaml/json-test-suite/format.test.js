import { parsing, transform } from "json-test-suite";

const SKIP = new Set([
  // Prettier doesn't support other encodings than utf8
  "i_string_utf16LE_no_BOM.json",

  // Maximum call stack size exceeded
  "i_structure_500_nested_arrays.json",
]);

const cases = [...parsing, ...transform]
  .map(({ name, input, error }) => {
    if (error || SKIP.has(name)) {
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
