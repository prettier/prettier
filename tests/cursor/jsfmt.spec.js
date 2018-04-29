const prettier = require("../../tests_config/require_prettier");

test("translates cursor correctly in basic case", () => {
  expect(prettier.formatWithCursor(" 1", { cursorOffset: 2 })).toEqual({
    formatted: "1;\n",
    cursorOffset: 1
  });
});

test("positions cursor relative to closest node, not SourceElement", () => {
  const code = "return         15";
  expect(prettier.formatWithCursor(code, { cursorOffset: 15 })).toEqual({
    formatted: "return 15;\n",
    cursorOffset: 7
  });
});

test("keeps cursor inside formatted node", () => {
  const code = "return         15";
  expect(prettier.formatWithCursor(code, { cursorOffset: 14 })).toEqual({
    formatted: "return 15;\n",
    cursorOffset: 7
  });
});

test("doesn't insert second placeholder for nonexistent TypeAnnotation", () => {
  const code = `
foo('bar', cb => {
  console.log('stuff')
})`;
  expect(prettier.formatWithCursor(code, { cursorOffset: 24 })).toEqual({
    formatted: `foo("bar", cb => {
  console.log("stuff");
});
`,
    cursorOffset: 23
  });
});
