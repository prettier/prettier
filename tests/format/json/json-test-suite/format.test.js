import { parsing, transform } from "json-test-suite";

const SKIP = new Set([
  // Prettier doesn't support other encodings than utf8
  "i_string_utf16BE_no_BOM.json",
  "i_string_utf16LE_no_BOM.json",
  "i_string_UTF-16LE_with_BOM.json",

  // RangeError: Maximum call stack size exceeded
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

for (const parser of ["json", "jsonc", "json5", "json-stringify"]) {
  runFormatTest(
    {
      importMeta: import.meta,
      snippets: cases,
    },
    [parser],
  );
}
