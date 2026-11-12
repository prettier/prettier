import { hardline, indent, join } from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import { hasExplicitOperation } from "../utilities/has-explicit-operation.js";
import { printSequence } from "./sequence.js";

function printSelectionSet(path, options, print) {
  const { node } = path;

  const parts = ["{"];

  if (node.selections.length > 0) {
    parts.push(
      indent([
        hardline,
        join(hardline, printSequence(path, options, print, "selections")),
      ]),
      hardline,
    );
  } else {
    const dangling = printDanglingComments(path, options, { indent: true });
    if (dangling) {
      parts.push(dangling, hardline);
    }
  }

  parts.push("}");

  return parts;
}

function printSelectionSetField(path, options, print) {
  const { node } = path;
  const { selectionSet } = node;

  if (!selectionSet) {
    return "";
  }

  const selectionSetDoc = print("selectionSet");

  if (
    node.type === "OperationDefinition" &&
    node.name &&
    hasExplicitOperation(node, options)
  ) {
    return selectionSetDoc;
  }

  return [" ", selectionSetDoc];
}

export { printSelectionSet, printSelectionSetField };
