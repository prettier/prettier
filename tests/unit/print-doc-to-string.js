import { cursor } from "../../src/document/builder.js";
import { printDocToString } from "../../src/document/printer.js";

test("Should reject if too many cursor in doc", () => {
  expect(() => {
    printDocToString([cursor, cursor, cursor]);
  }).toThrow({ message: "There are too many 'cursor' in doc." });
});
