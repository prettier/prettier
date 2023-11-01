import {
  hardline,
  indent,
  join,
  line,
  softline,
  group,
} from "../../document/builders.js";
import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import { ELSE_IF_PATTERN } from "../utils/else-if-pattern.js";

function normalizeBlockName(name) {
  if (ELSE_IF_PATTERN.test(name)) {
    return "else if";
  }
  return name;
}

function shouldPrintHardline(path) {
  const { node, isLast } = path;
  if (node.successorBlock) {
    return false;
  }
  if (path.key === "successorBlock") {
    return false;
  }
  if (isLast) {
    return false;
  }
  return true;
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
      ? [
          " (",
          group([
            indent([
              softline,
              ...join([";", line], path.map(print, "parameters")),
            ]),
            softline,
          ]),
          ")",
        ]
      : "",
    " {",
    indent([hardline, ...path.map(print, "children")]),
    hardline,
    "}",
    node.successorBlock ? [" ", print("successorBlock")] : "",
    shouldPrintHardline(path) ? hardline : "",
  ];
}

export { printBlock };
