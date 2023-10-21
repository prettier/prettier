import { isNonEmptyArray } from "../../cli/utils.js";
import { hardline, indent } from "../../document/builders.js";

function printIfBlock(path, options, print) {
  const { node } = path;
  const parts = [];
  parts.push(
    "@",
    node.name,
    isNonEmptyArray(node.test) ? [" (", ...path.map(print, "test"), ")"] : "",
    " {",
    indent([hardline, ...path.map(print, "consequent")]),
    hardline,
    "}",
  );
  if (node.alternate) {
    parts.push(" ", print("alternate"));
  } else {
    parts.push(hardline);
  }
  return parts;
}

/**
 * Print Angular's control flow syntax block
 */
function printBlock(path, options, print) {
  const { node } = path;
  if (node.type === "ifBlock") {
    return printIfBlock(path, options, print);
  }
  throw new Error(`Not implemented block type: ${node.type}`);
}

export { printBlock };
