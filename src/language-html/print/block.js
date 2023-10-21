import { hardline, indent } from "../../document/builders.js";
import isNonEmptyArray from "../../utils/is-non-empty-array.js";

/**
 * Print Angular's control flow syntax block
 */
function printBlock(path, options, print) {
  const { node } = path;
  const parts = ["@", node.name];
  if (isNonEmptyArray(node.parameters)) {
    parts.push(" (", ...path.map(print, "parameters"), ")");
  }
  parts.push(
    " {",
    indent([hardline, path.map(print, "children")]),
    hardline,
    "}",
  );
  return parts;
}

export { printBlock };
