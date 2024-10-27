run_spec(__dirname, ["babel", "typescript", "flow"]);

const prettier = require("prettier-local");

test("translates cursor correctly in basic case", () => {
  expect(
    prettier.formatWithCursor(" 1", { parser: "babel", cursorOffset: 2 })
  ).toMatchObject({
    formatted: "1;\n",
    cursorOffset: 1,
  });
});

test("positions cursor relative to closest node, not SourceElement", () => {
  const code = "return         15";
  expect(
    prettier.formatWithCursor(code, { parser: "babel", cursorOffset: 15 })
  ).toMatchObject({
    formatted: "return 15;\n",
    cursorOffset: 7,
  });
});

test("keeps cursor inside formatted node", () => {
  const code = "return         15";
  expect(
    prettier.formatWithCursor(code, { parser: "babel", cursorOffset: 14 })
  ).toMatchObject({
    formatted: "return 15;\n",
    cursorOffset: 7,
  });
});

test("doesn't insert second placeholder for nonexistent TypeAnnotation", () => {
  const code = `
foo('bar', cb => {
  console.log('stuff')
})`;
  expect(
    prettier.formatWithCursor(code, { parser: "babel", cursorOffset: 24 })
  ).toMatchObject({
    formatted: `foo("bar", (cb) => {
  console.log("stuff");
});
`,
    cursorOffset: 25,
  });
});

test("cursorOffset === rangeStart", () => {
  const code = "1.0000\n2.0000\n3.0000";

  expect(
    prettier.formatWithCursor(code, {
      parser: "babel",
      cursorOffset: 7,
      rangeStart: 7,
      rangeEnd: 8,
    })
  ).toMatchObject({
    formatted: "1.0000\n2.0;\n3.0000",
    cursorOffset: 7,
  });
});
