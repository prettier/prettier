import { hardline, indent, join } from "../document/index.js";
import { printSequence } from "./sequence.js";

function printSelectionSet(path, options, print) {
  return [
    "{",
    indent([
      hardline,
      join(hardline, printSequence(path, options, print, "selections")),
    ]),
    hardline,
    "}",
  ];
}

export { printSelectionSet };
