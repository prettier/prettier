import editorconfigToPrettier from "../../src/config/editorconfig/editorconfig-to-prettier.js";

test("editorconfigToPrettier", () => {
  expect(
    editorconfigToPrettier({
      indent_style: "tab",
      tab_width: 8,
      indent_size: 2,
      max_line_length: 100,
    }),
  ).toStrictEqual({
    useTabs: true,
    tabWidth: 8,
    printWidth: 100,
  });

  expect(
    editorconfigToPrettier({
      indent_style: "space",
      tab_width: 8,
      indent_size: 2,
      max_line_length: 100,
    }),
  ).toStrictEqual({
    useTabs: false,
    tabWidth: 2,
    printWidth: 100,
  });

  expect(
    editorconfigToPrettier({
      indent_style: "space",
      tab_width: 8,
      indent_size: 8,
      max_line_length: 100,
    }),
  ).toStrictEqual({
    useTabs: false,
    tabWidth: 8,
    printWidth: 100,
  });

  expect(
    editorconfigToPrettier({
      tab_width: 4,
      indent_size: "tab",
    }),
  ).toStrictEqual({
    tabWidth: 4,
    useTabs: true,
  });

  expect(
    editorconfigToPrettier({
      indent_size: "tab",
    }),
  ).toStrictEqual({
    useTabs: true,
  });

  expect(
    editorconfigToPrettier({
      tab_width: 0,
      indent_size: 0,
    }),
  ).toBeUndefined();

  expect(
    editorconfigToPrettier({
      quote_type: "single",
    }),
  ).toStrictEqual({
    singleQuote: true,
  });

  expect(
    editorconfigToPrettier({
      quote_type: "double",
    }),
  ).toStrictEqual({
    singleQuote: false,
  });

  expect(
    editorconfigToPrettier({
      quote_type: "double",
      max_line_length: "off",
    }),
  ).toStrictEqual({
    printWidth: Number.POSITIVE_INFINITY,
    singleQuote: false,
  });

  expect(
    editorconfigToPrettier({
      end_of_line: "cr",
    }),
  ).toStrictEqual({
    endOfLine: "cr",
  });

  expect(
    editorconfigToPrettier({
      end_of_line: "crlf",
    }),
  ).toStrictEqual({
    endOfLine: "crlf",
  });

  expect(
    editorconfigToPrettier({
      end_of_line: "lf",
    }),
  ).toStrictEqual({
    endOfLine: "lf",
  });

  expect(
    editorconfigToPrettier({
      endOfLine: 123,
    }),
  ).toBeUndefined();

  expect(
    editorconfigToPrettier({
      indent_style: "space",
      indent_size: 2,
      max_line_length: "unset",
    }),
  ).toStrictEqual({
    useTabs: false,
    tabWidth: 2,
  });

  expect(editorconfigToPrettier({})).toBeUndefined();
  expect(editorconfigToPrettier(null)).toBeUndefined();
});
