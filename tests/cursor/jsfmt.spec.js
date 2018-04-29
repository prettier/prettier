const prettier = require("../../tests_config/require_prettier");

function insertCursor(result) {
  return (
    result.formatted.slice(0, result.cursorOffset) +
    "<|>" +
    result.formatted.slice(result.cursorOffset)
  );
}

function extractCursor(code) {
  return {
    original: code,
    code: code.replace("<|>", ""),
    cursorOffset: code.indexOf("<|>")
  };
}

function runPrettierWithInlineCursor(_code, _opts) {
  const result = extractCursor(_code);
  return {
    original: result.original,
    formatted: insertCursor(
      prettier.formatWithCursor(
        result.code,
        Object.assign({}, _opts, { cursorOffset: result.cursorOffset })
      )
    )
  };
}

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

test("works when the file starts with a comment", () => {
  expect(
    runPrettierWithInlineCursor(`
    // hi<|> lol
    haha()
`)
  ).toMatchSnapshot();

  expect(
    runPrettierWithInlineCursor(`
    // hi lol
    haha()<|>
`)
  ).toMatchSnapshot();
});

test("puts the cursor in sensible places", () => {
  expect(runPrettierWithInlineCursor(`return        <|> 15`)).toMatchSnapshot();
  expect(runPrettierWithInlineCursor(`return        <|>15`)).toMatchSnapshot();
  expect(
    runPrettierWithInlineCursor(`
foo  <|>  (bar);
`)
  ).toMatchSnapshot();

  expect(
    runPrettierWithInlineCursor(`

  <|>


  const y = 5
`)
  ).toMatchSnapshot();

  expect(
    runPrettierWithInlineCursor(`

  const y = 5



  <|>



  const z = 9
`)
  ).toMatchSnapshot();

  expect(
    runPrettierWithInlineCursor(`const y = 5
<|>



const z = 9
`)
  ).toMatchSnapshot();

  expect(
    runPrettierWithInlineCursor(`  func<|>tion banana(){}`)
  ).toMatchSnapshot();

  expect(
    runPrettierWithInlineCursor(`     thisWillBeFormatted  <|>  (2  ,3,   )`)
  ).toMatchSnapshot();
});

test("works with ranges", () => {
  expect(
    runPrettierWithInlineCursor(
      `thisWontBeFormatted  ( 1  ,3)

    thisWillBeFormatted  <|>  (2  ,3,   )

    thisWontBeFormatted  (2, 90  ,)
    `,
      { rangeStart: 31, rangeEnd: 75 }
    )
  ).toMatchSnapshot();

  expect(
    runPrettierWithInlineCursor(
      `thisWontBeFormatted  ( 1  ,3)

    thisWillBeFormatted    (2  ,3<|>,   )

    thisWontBeFormatted  (2, 90  ,)
    `,
      { rangeStart: 31, rangeEnd: 75 }
    )
  ).toMatchSnapshot();

  expect(
    runPrettierWithInlineCursor(
      `thisWontBeFormatted  ( 1  ,3)

    thisWillBeFormatted    (2  ,3,  <|> )

    thisWontBeFormatted  (2, 90  ,)
    `,
      { rangeStart: 31, rangeEnd: 75 }
    )
  ).toMatchSnapshot();

  expect(
    runPrettierWithInlineCursor(
      `thisWontBeFormatted <|> ( 1  ,3)

    thisWillBeFormatted    (2  ,3,   )

    thisWontBeFormatted  (2, 90  ,)
    `,
      { rangeStart: 31, rangeEnd: 75 }
    )
  ).toMatchSnapshot();

  expect(
    runPrettierWithInlineCursor(
      `thisWontBeFormatted  ( 1  ,3)

    thisWillBeFormatted    (2  ,3,   )

    thisWontBeFormatted  (2, 9<|>0  ,)
    `,
      { rangeStart: 31, rangeEnd: 75 }
    )
  ).toMatchSnapshot();
});
