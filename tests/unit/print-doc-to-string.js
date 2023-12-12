import {
  cursor,
  cursorLeft,
  cursorRight,
  hardline,
} from "../../src/document/builders.js";
import { printDocToString } from "../../src/document/printer.js";

const options = { printWidth: 80, tabWidth: 2 };

test("Should reject if too many cursor in doc", () => {
  expect(() => {
    printDocToString([cursor, cursor, cursor], options);
  }).toThrow({ message: "There are too many 'cursor' in doc." });

  expect(() => {
    printDocToString([cursorLeft, cursor, cursor], options);
  }).toThrow({ message: "There are too many 'cursor' in doc." });

  expect(() => {
    printDocToString([cursorLeft, cursorRight, cursorRight], options);
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
  ).toEqual({
    formatted: "123Prettier\n",
    cursorRegionStart: 3,
    cursorRegionText: "Prettier",
  });

  expect(
    printDocToString(
      ["123", cursorLeft, "Prettier  \t", cursorRight, "\t \t", hardline],
      options,
    ),
  ).toEqual({
    formatted: "123Prettier\n",
    cursorRegionStart: 3,
    cursorRegionText: "Prettier",
  });
});

test("Should put cursor exactly after cursorRight if it appears before cursorLeft", () => {
  expect(
    printDocToString(
      ["123", cursorRight, "Prettier  \t", cursorLeft, "\t \t", hardline],
      options,
    ),
  ).toEqual({
    formatted: "123Prettier\n",
    cursorRegionStart: 3,
    cursorRegionText: "",
  });
});
