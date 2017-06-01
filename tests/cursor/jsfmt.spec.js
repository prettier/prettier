const prettier = require("../..");

test("translates cursor correctly in basic case", () => {
  expect(prettier.formatWithCursor(" 1", { cursorOffset: 2 })).toEqual({
    formatted: "1;\n",
    cursorOffset: 1
  });
});
