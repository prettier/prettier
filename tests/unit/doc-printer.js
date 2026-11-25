import {
  conditionalGroup,
  fill,
  group,
  indent,
  join,
  line,
  mapDoc,
  markIgnorePreservedBreakGroup,
  markPreservedBreakGroup,
  willBreakIgnoringPreservedBreaks,
} from "../../src/document/index.js";
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

test("`ignorePreservedBreak` checks flat fit while keeping preserved breaks on output", () => {
  const printOptions = { printWidth: 20, tabWidth: 2 };
  const makeDoc = (items) => {
    const inner = markPreservedBreakGroup(
      group(["{", indent([line, join([",", line], items)]), line, "}"], {
        shouldBreak: true,
      }),
    );
    const wrapped = group(["fn(", inner, ")"]);
    return markIgnorePreservedBreakGroup(
      conditionalGroup([
        ["prefix", ".", wrapped],
        ["prefix", indent([line, ".", wrapped])],
      ]),
    );
  };

  const shortDoc = makeDoc(["a", "b"]);
  expect(willBreakIgnoringPreservedBreaks(shortDoc)).toBe(false);
  expect(printDocToString(shortDoc, printOptions).formatted).toBe(
    "prefix.fn({\n  a,\n  b\n})",
  );

  const longDoc = makeDoc(["longItem1", "longItem2"]);
  const mappedLongDoc = mapDoc(longDoc, (doc) => doc);
  expect(printDocToString(mappedLongDoc, printOptions).formatted).toBe(
    "prefix\n  .fn({\n    longItem1,\n    longItem2\n  })",
  );
});
