import { line, replaceEndOfLine } from "../../../document/index.js";

// The selector parser stores some block comments in whitespace fields.
function printSelectorSpace(rawSpace) {
  return rawSpace
    .matchAll(/\/\*.*?\*\/|\s+/gs)
    .map(([part]) => (part.startsWith("/*") ? replaceEndOfLine(part) : line))
    .toArray();
}

export { printSelectorSpace };
