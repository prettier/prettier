import { hardline, indent, join } from "../../document/index.js";
import { printSequence } from "./sequence.js";

function printSelectionSet(path, options, print) {
  const { node } = path;

  if (node.selections.length === 0) {
    return "{}";
  }

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

function printNodeSelectionSet(path, print) {
  const { node } = path;
  const { selectionSet } = node;

  if (!selectionSet) {
    return "";
  }

  const selectionSetDoc = print("selectionSet");

  if (
    node.type === "OperationDefinition" &&
    node.name &&
    options.originalText[locStart(node)] !== "{"
  ) {
    return selectionSetDoc;
  }

  return [" ", selectionSetDoc];
}

export { printNodeSelectionSet, printSelectionSet };
