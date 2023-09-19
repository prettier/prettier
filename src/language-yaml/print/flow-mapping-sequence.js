import {
  ifBreak,
  line,
  softline,
  hardline,
  join,
} from "../../document/builders.js";
import { isEmptyNode, hasEndComments } from "../utils.js";
import { printNextEmptyLine, alignWithSpaces } from "./misc.js";

function printFlowMapping(path, print, options) {
  const { node } = path;
  const isMapping = node.type === "flowMapping";
  const openMarker = isMapping ? "{" : "[";
  const closeMarker = isMapping ? "}" : "]";

  /** @type {softline | line} */
  let bracketSpacing = softline;
  if (isMapping && node.children.length > 0 && options.bracketSpacing) {
    bracketSpacing = line;
  }
  const lastItem = node.children.at(-1);
  const isLastItemEmptyMappingItem =
    lastItem?.type === "flowMappingItem" &&
    isEmptyNode(lastItem.key) &&
    isEmptyNode(lastItem.value);

  return [
    openMarker,
    alignWithSpaces(options.tabWidth, [
      bracketSpacing,
      printChildren(path, print, options),
      options.trailingComma === "none" ? "" : ifBreak(","),
      hasEndComments(node)
        ? [hardline, join(hardline, path.map(print, "endComments"))]
        : "",
    ]),
    isLastItemEmptyMappingItem ? "" : bracketSpacing,
    closeMarker,
  ];
}

function printChildren(path, print, options) {
  return path.map(
    ({ isLast, node, next }) => [
      print(),
      isLast
        ? ""
        : [
            ",",
            line,
            node.position.start.line !== next.position.start.line
              ? printNextEmptyLine(path, options.originalText)
              : "",
          ],
    ],
    "children",
  );
}

export {
  printFlowMapping,
  // Alias
  printFlowMapping as printFlowSequence,
};
