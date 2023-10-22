import { isNonEmptyArray } from "../../cli/utils.js";
import { hardline, indent } from "../../document/builders.js";

function printIfBlock(path, options, print) {
  const { node } = path;
  return [
    "@",
    node.name,
    isNonEmptyArray(node.test) ? [" (", ...path.map(print, "test"), ")"] : "",
    " {",
    indent([hardline, ...path.map(print, "consequent")]),
    hardline,
    "}",
    node.alternate ? [" ", print("alternate")] : hardline,
  ];
}

function printForBlock(path, options, print) {
  const { node } = path;
  return [
    "@",
    node.name,
    isNonEmptyArray(node.parameters)
      ? [" (", ...path.map(print, "parameters"), ")"]
      : "",
    " {",
    indent([hardline, ...path.map(print, "children")]),
    hardline,
    "}",
    node.empty ? [" ", print("empty")] : hardline,
  ];
}

function printBasicBlock(path, options, print) {
  const { node } = path;
  return [
    "@",
    node.name,
    isNonEmptyArray(node.parameters)
      ? [" (", ...path.map(print, "parameters"), ")"]
      : "",
    " {",
    indent([hardline, ...path.map(print, "children")]),
    hardline,
    "}",
    hardline,
  ];
}

/**
 * Print Angular's control flow syntax block
 */
function printBlock(path, options, print) {
  const { node } = path;
  if (node.type === "ifBlock") {
    return printIfBlock(path, options, print);
  }
  if (node.type === "forBlock") {
    return printForBlock(path, options, print);
  }
  return printBasicBlock(path, options, print);
}

export { printBlock };
