import { fill, group, hardline, join, line } from "../../src/document/index.js";
import { printDocToString } from "../../src/document/printer/printer.js";

test.each([
  [6, "aa\nbbb;"],
  [7, "aa bbb;"],
])("fill accounts for following text at width %i", (printWidth, expected) => {
  const doc = [fill(["aa", line, "bbb"]), ";"];
  expect(printDocToString(doc, { printWidth, tabWidth: 2 }).formatted).toBe(
    expected,
  );
});

test("a single fill item accounts for following text", () => {
  const doc = [fill([group(["aa", line, "bb"])]), ";"];
  expect(printDocToString(doc, { printWidth: 5, tabWidth: 2 }).formatted).toBe(
    "aa\nbb;",
  );
});

test("fill can break its trailing whitespace before following text", () => {
  const doc = [fill(["aa", line, "bbb", line]), ";"];
  expect(printDocToString(doc, { printWidth: 6, tabWidth: 2 }).formatted).toBe(
    "aa bbb\n;",
  );
});

test("fill stops measuring following text at a line break", () => {
  const doc = [
    fill(["aa", line, "bbb"]),
    ";",
    hardline,
    group(["cc", line, "dd"], { shouldBreak: true }),
  ];
  expect(printDocToString(doc, { printWidth: 7, tabWidth: 2 }).formatted).toBe(
    "aa bbb;\ncc\ndd",
  );
});

test("a following forced group does not force fill to break", () => {
  const doc = [
    fill(["aa", line, "bbb"]),
    group([";", hardline, "cc"], { shouldBreak: true }),
  ];
  expect(printDocToString(doc, { printWidth: 7, tabWidth: 2 }).formatted).toBe(
    "aa bbb;\ncc",
  );
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
