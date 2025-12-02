import { parsing, transform } from "json-test-suite";

const SKIP = new Set([
  // Prettier doesn't support other encodings than utf8
  "i_string_utf16BE_no_BOM.json",
  "i_string_utf16LE_no_BOM.json",
  "i_string_UTF-16LE_with_BOM.json",

  // RangeError: Maximum call stack size exceeded
  "i_structure_500_nested_arrays.json",
]);

const BUGS = new Set([
  "i_number_neg_int_huge_exp.json",
  "i_number_real_neg_overflow.json",
  "i_number_double_huge_neg_exp.json",
  "i_number_huge_exp.json",
  "i_number_pos_double_huge_exp.json",
  "i_number_real_pos_overflow.json",
  "i_number_real_underflow.json",
  "i_number_too_big_neg_int.json",
  "i_number_very_big_negative_int.json",
]);

const cases = [...parsing, ...transform]
  .map(({ name, input, error }) => {
    if (error || SKIP.has(name) || BUGS.has(name)) {
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
