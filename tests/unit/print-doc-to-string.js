import {
  cursor,
  group,
  hardline,
  line,
  trim,
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
    printDocToString([" ".repeat(3), hardline, "Prettier", hardline], options)
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

test("Should measure trimmed tabs by width", () => {
  const options = { printWidth: 5, tabWidth: 4 };
  const content = group(["aa", line, "bb"]);

  expect(
    printDocToString(["x", hardline, "\t", trim, content], options).formatted,
  ).toBe("x\naa bb");
  expect(
    printDocToString(["x", hardline, group(["\t", trim, content])], options)
      .formatted,
  ).toBe("x\naa bb");
});
