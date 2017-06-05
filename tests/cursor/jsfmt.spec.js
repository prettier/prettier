const prettier = require("../..");

test("translates cursor correctly in basic case", () => {
  expect(prettier.formatWithCursor(" 1", { cursorOffset: 2 })).toEqual({
    formatted: "1;\n",
    cursorOffset: 1
  });
});

test("keeps cursor inside formatted node", () => {
  const code = "return         15";
  expect(prettier.formatWithCursor(code, { cursorOffset: 15 })).toEqual({
    formatted: "return 15;\n",
    cursorOffset: 15
  });
});
