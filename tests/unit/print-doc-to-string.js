import { cursor } from "../../src/document/builders.js";
import { printDocToString } from "../../src/document/printer.js";

test("Should reject if too many cursor in doc", () => {
  expect(() => {
    printDocToString([cursor, cursor, cursor], { printWidth: 80, tabWidth: 2 });
  }).toThrow({ message: "There are too many 'cursor' in doc." });
});
