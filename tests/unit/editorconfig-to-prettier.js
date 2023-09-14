import assert from "node:assert/strict";
import editorconfigToPrettier from "./index.js";

assert.deepEqual(
  editorconfigToPrettier({
    indent_style: "tab",
    tab_width: 8,
    indent_size: 2,
    max_line_length: 100,
  }),
  {
    useTabs: true,
    tabWidth: 8,
    printWidth: 100,
  },
);

assert.deepEqual(
  editorconfigToPrettier({
    indent_style: "space",
    tab_width: 8,
    indent_size: 2,
    max_line_length: 100,
  }),
  {
    useTabs: false,
    tabWidth: 2,
    printWidth: 100,
  },
);

assert.deepEqual(
  editorconfigToPrettier({
    indent_style: "space",
    tab_width: 8,
    indent_size: 8,
    max_line_length: 100,
  }),
  {
    useTabs: false,
    tabWidth: 8,
    printWidth: 100,
  },
);

assert.deepEqual(
  editorconfigToPrettier({
    tab_width: 4,
    indent_size: "tab",
  }),
  {
    tabWidth: 4,
    useTabs: true,
  },
);

assert.deepEqual(
  editorconfigToPrettier({
    indent_size: "tab",
  }),
  {
    useTabs: true,
  },
);

assert.deepEqual(
  editorconfigToPrettier({
    tab_width: 0,
    indent_size: 0,
  }),
  {
    tabWidth: 0,
  },
);

assert.deepEqual(
  editorconfigToPrettier({
    quote_type: "single",
  }),
  {
    singleQuote: true,
  },
);

assert.deepEqual(
  editorconfigToPrettier({
    quote_type: "double",
  }),
  {
    singleQuote: false,
  },
);

assert.deepEqual(
  editorconfigToPrettier({
    quote_type: "double",
    max_line_length: "off",
  }),
  {
    printWidth: Number.POSITIVE_INFINITY,
    singleQuote: false,
  },
);

assert.deepEqual(
  editorconfigToPrettier({
    end_of_line: "cr",
  }),
  {
    endOfLine: "cr",
  },
);

assert.deepEqual(
  editorconfigToPrettier({
    end_of_line: "crlf",
  }),
  {
    endOfLine: "crlf",
  },
);

assert.deepEqual(
  editorconfigToPrettier({
    end_of_line: "lf",
  }),
  {
    endOfLine: "lf",
  },
);

assert.deepEqual(
  editorconfigToPrettier({
    endOfLine: 123,
  }),
  {},
);

assert.deepEqual(
  editorconfigToPrettier({
    indent_style: "space",
    indent_size: 2,
    max_line_length: "unset",
  }),
  {
    useTabs: false,
    tabWidth: 2,
  },
);

assert.deepEqual(editorconfigToPrettier({ insert_final_newline: false }), {
  insertFinalNewline: false,
});

assert.deepEqual(editorconfigToPrettier({ insert_final_newline: true }), {
  insertFinalNewline: true,
});

assert.deepEqual(editorconfigToPrettier({}), null);
assert.deepEqual(editorconfigToPrettier(null), null);
