import { outdent } from "outdent";
import getPrettier from "../../../config/get-prettier.js";

runFormatTest(import.meta, ["babel", "typescript", "flow"]);

let prettier;
beforeAll(async () => {
  prettier = await getPrettier();
});

test("translates cursor correctly in basic case", async () => {
  expect(
    await prettier.formatWithCursor(" 1", { parser: "babel", cursorOffset: 2 }),
  ).toMatchObject({
    formatted: "1;\n",
    cursorOffset: 1,
  });
});

describe("cursor positions at text boundaries", () => {
  test.each([
    ["", 0, "", 0],
    [" \t\r\n", 0, "", 0],
    [" \t\r\n", 2, "", 0],
    [" \t\r\n", 4, "", 0],
    ["\uFEFF", 0, "\uFEFF", 0],
    ["\uFEFF", 1, "\uFEFF", 1],
    ["\uFEFF \t\r\n", 0, "\uFEFF", 0],
    ["\uFEFF \t\r\n", 1, "\uFEFF", 1],
    ["\uFEFF \t\r\n", 5, "\uFEFF", 1],
    ["\uFEFFconst x=1", 0, "\uFEFFconst x = 1;\n", 0],
    ["\uFEFFconst x=1", 1, "\uFEFFconst x = 1;\n", 1],
  ])(
    "translates cursor %j at offset %i",
    async (text, cursorOffset, formatted, expectedCursorOffset) => {
      expect(
        await prettier.formatWithCursor(text, {
          parser: "babel",
          cursorOffset,
        }),
      ).toMatchObject({ formatted, cursorOffset: expectedCursorOffset });
    },
  );

  test.each(["", " \t\r\n", "\uFEFF", "\uFEFFconst x=1"])(
    "keeps cursor tracking disabled for %j",
    async (text) => {
      for (const cursorOffset of [-1, text.length + 1]) {
        expect(
          await prettier.formatWithCursor(text, {
            parser: "babel",
            cursorOffset,
          }),
        ).toMatchObject({ cursorOffset: -1 });
      }
    },
  );
});

test("positions cursor relative to closest node, not SourceElement", async () => {
  const code = "return         15";
  expect(
    await prettier.formatWithCursor(code, {
      parser: "babel",
      cursorOffset: 15,
    }),
  ).toMatchObject({
    formatted: "return 15;\n",
    cursorOffset: 7,
  });
});

test("keeps cursor inside formatted node", async () => {
  const code = "return         15";
  expect(
    await prettier.formatWithCursor(code, {
      parser: "babel",
      cursorOffset: 14,
    }),
  ).toMatchObject({
    formatted: "return 15;\n",
    cursorOffset: 7,
  });
});

test("doesn't insert second placeholder for nonexistent TypeAnnotation", async () => {
  const code =
    "\n" +
    outdent`
      foo('bar', cb => {
        console.log('stuff')
      })
    `;
  expect(
    await prettier.formatWithCursor(code, {
      parser: "babel",
      cursorOffset: 24,
    }),
  ).toMatchObject({
    formatted:
      outdent`
        foo("bar", (cb) => {
          console.log("stuff");
        });
      ` + "\n",
    cursorOffset: 25,
  });
});

test("cursorOffset === rangeStart", async () => {
  const code = "1.0000\n2.0000\n3.0000";

  expect(
    await prettier.formatWithCursor(code, {
      parser: "babel",
      cursorOffset: 7,
      rangeStart: 7,
      rangeEnd: 8,
    }),
  ).toMatchObject({
    formatted: "1.0000\n2.0;\n3.0000",
    cursorOffset: 7,
  });
});
