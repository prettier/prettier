import {
  breakParent,
  conditionalGroup,
  cursor,
  group,
  hardline,
  line,
} from "../../src/document/index.js";
import { printDocToString } from "../../src/document/printer/printer.js";

const options = { printWidth: 80, tabWidth: 2 };

test("Should reject if too many cursor in doc", () => {
  expect(() => {
    printDocToString([cursor, cursor, cursor], options);
  }).toThrow({ message: "There are too many 'cursor' in doc." });
});

test("Should trim blank first line", () => {
  expect(
    printDocToString(["   ", hardline, "Prettier", hardline], options)
      .formatted,
  ).toBe("\nPrettier\n");
});

test("Should properly trim with cursor", () => {
  expect(
    printDocToString(
      ["123", cursor, "Prettier  \t", cursor, "\t \t", hardline],
      options,
    ),
  ).toStrictEqual({
    formatted: "123Prettier\n",
    cursorNodeStart: 3,
    cursorNodeText: "Prettier",
  });
});

test("Should propagate breakParent through shared groups", () => {
  const shared = group(["a", line, "b", breakParent]);
  const doc = group(["x", line, shared, line, shared]);

  expect(printDocToString(doc, options).formatted).toBe("x\na\nb\na\nb");
});

test("Should not propagate breakParent through conditional groups", () => {
  const doc = group([
    "x",
    line,
    conditionalGroup([["flat"], ["broken", breakParent]]),
  ]);

  expect(printDocToString(doc, options).formatted).toBe("x flat");
});
