import {
  cursor,
  fill,
  group,
  indent,
  join,
  line,
  lineSuffix,
  lineSuffixBoundary,
} from "../../src/document/index.js";
import { printDocToString } from "../../src/document/printer/printer.js";

test.each(["", [], ["", [""]], indent("")])(
  "Empty line suffix %p does not break its group",
  (contents) => {
    const doc = group([
      "a",
      lineSuffix(contents),
      lineSuffixBoundary,
      line,
      "b",
    ]);

    expect(
      printDocToString(doc, { printWidth: 80, tabWidth: 2 }).formatted,
    ).toBe("a b");
  },
);

test("An empty line suffix does not discard a pending comment", () => {
  const doc = group([
    "a",
    lineSuffix(" // comment"),
    lineSuffix(""),
    lineSuffixBoundary,
    "b",
  ]);

  expect(printDocToString(doc, { printWidth: 80, tabWidth: 2 }).formatted).toBe(
    "a // comment\nb",
  );
});

test("A line suffix containing a cursor is not discarded", () => {
  const doc = group(["a", lineSuffix(cursor), lineSuffixBoundary, "b", cursor]);

  expect(printDocToString(doc, { printWidth: 80, tabWidth: 2 })).toStrictEqual({
    formatted: "a\nb",
    cursorNodeStart: 1,
    cursorNodeText: "\nb",
  });
});

test("`printDocToString` should not manipulate docs", () => {
  const printOptions = { printWidth: 40, tabWidth: 2 };
  const doc = fill(
    join(
      line,
      Array.from({ length: 255 }, (_, index) => String(index + 1)),
    ),
  );

  expect(doc.parts.length).toBe(255 + 254);

  const { formatted: firstPrint } = printDocToString(doc, printOptions);

  expect(doc.parts.length).toBe(255 + 254);

  const { formatted: secondPrint } = printDocToString(doc, printOptions);

  expect(firstPrint).toBe(secondPrint);

  {
    // About 1000 lines, #3263
    const WORD = "word";
    const hugeParts = join(
      line,
      Array.from(
        { length: 1000 * Math.ceil(printOptions.printWidth / WORD.length) },
        () => WORD,
      ),
    );
    const orignalLength = hugeParts.length;

    const { formatted } = printDocToString(fill(hugeParts), printOptions);
    expect(hugeParts.length).toBe(orignalLength);

    const lines = formatted.split("\n");
    expect(lines.length).toBeGreaterThan(1000);
  }
});
