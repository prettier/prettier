import { isNonEmptyArray } from "../../cli/utils.js";
import { hardline, indent } from "../../document/builders.js";
import { ELSE_IF_PATTERN } from "../utils/else-if-pattern.js";

function normalizeBlockName(name) {
  if (ELSE_IF_PATTERN.test(name)) {
    return "else if";
  }
  return name;
}

/**
 * Print Angular's control flow syntax block
 */
function printBlock(path, options, print) {
  const { node } = path;
  return [
    "@",
    normalizeBlockName(node.name),
    isNonEmptyArray(node.parameters)
      ? [" (", ...path.map(print, "parameters"), ")"]
      : "",
    " {",
    indent([hardline, ...path.map(print, "children")]),
    hardline,
    "}",
    node.successorBlock
      ? [" ", print("successorBlock")]
      : path.isLast
      ? ""
      : hardline,
  ];
}

export { printBlock };
