// TODO: Find a better way to test the performance
import { fill, join, line } from "../../src/document/builders.js";
import { printDocToString } from "../../src/document/printer.js";

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

    const startTime = performance.now();
    const { formatted } = printDocToString(fill(hugeParts), printOptions);
    const endTime = performance.now();
    expect(hugeParts.length).toBe(orignalLength);

    const lines = formatted.split("\n");
    expect(lines.length).toBeGreaterThan(1000);
    expect(endTime - startTime).toBeLessThan(150);
  }
});

describe("`printDocToString` has linear time complexity at most to print fill()", () => {
  const baseSize = 3_000;
  const relativeMargin = 0.7;
  const baseTime = time(makeFill(baseSize));
  test.each([20_000, 40_000, 60_000])("numWords=%d", (numWords) => {
    const doc = makeFill(numWords);
    const ellapsed = time(doc);
    const ratio = numWords / baseSize;
    expect(ellapsed).toBeLessThan(baseTime * ratio * (1 + relativeMargin));
  });

  function makeFill(numWords) {
    const WORD = "word";
    const parts = Array.from({ length: numWords }, () => WORD);
    return fill(join(line, parts));
  }

  function time(doc) {
    const printOptions = { printWidth: 40, tabWidth: 2 };
    const start = performance.now();
    printDocToString(doc, printOptions);
    return performance.now() - start;
  }
});
