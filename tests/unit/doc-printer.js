import { fill, group, hardline, join, line } from "../../src/document/index.js";
import { printDocToString } from "../../src/document/printer/printer.js";

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

describe("fill trailing text", () => {
  const print = (doc, printWidth) =>
    printDocToString(doc, { printWidth, tabWidth: 2 }).formatted;

  test.each([
    [7, "aaa\nbbbb;"],
    [8, "aaa\nbbbb;"],
    [9, "aaa bbbb;"],
  ])("counts the suffix at width %i", (width, expected) => {
    expect(print([fill(["aaa", line, "bbbb"]), ";"], width)).toBe(expected);
  });

  test("counts a suffix after a nested group in the final fill item", () => {
    expect(
      print([fill(["aaa", line, group(["bb", line, "bb"])]), ";"], 9),
    ).toBe("aaa\nbb bb;");
  });

  test("does not require following groups to remain flat", () => {
    expect(print([fill(["aaa", line, "bbbb"]), group([line, "cc"])], 8)).toBe(
      "aaa bbbb\ncc",
    );
  });

  test("allows a following group to be forced to break", () => {
    expect(
      print(
        [
          fill(["aaa", line, "bbbb"]),
          group([line, "cc"], { shouldBreak: true }),
        ],
        8,
      ),
    ).toBe("aaa bbbb\ncc");
  });

  test("stops counting the suffix at a hard line", () => {
    expect(print([fill(["aaa", line, "bbbb"]), hardline, ";"], 8)).toBe(
      "aaa bbbb\n;",
    );
  });

  test("can break a trailing fill separator before the suffix", () => {
    expect(print([fill(["aaa", line]), "bbbb"], 7)).toBe("aaa\nbbbb");
  });

  test("does not break content that fits before a trailing separator", () => {
    expect(print([fill([group(["aa", line, "bb"]), line]), "cc"], 5)).toBe(
      "aa bb\ncc",
    );
  });

  test("counts a suffix when a fill contains one group", () => {
    expect(print([fill([group(["aaa", line, "bbbb"])]), ";"], 8)).toBe(
      "aaa\nbbbb;",
    );
  });
});
