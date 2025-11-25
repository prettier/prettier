import {
  hardline,
  ifBreak,
  join,
  line,
  softline,
} from "../../document/index.js";
import { hasEndComments, hasTrailingComment, isEmptyNode } from "../utils.js";
import { alignWithSpaces, printNextEmptyLine } from "./misc.js";

function printFlowMapping(path, options, print) {
  const { node } = path;
  const isMapping = node.type === "flowMapping";
  const openMarker = isMapping ? "{" : "[";
  const closeMarker = isMapping ? "}" : "]";

  /** @type {softline | line} */
  let bracketSpacing = softline;
  if (isMapping && node.children.length > 0 && options.bracketSpacing) {
    bracketSpacing = line;
  }

  const mappingKeyHasTrailingComment = node.children?.some(
    (child) => child.key && hasTrailingComment(child.key.content),
  );

  const lastItem = node.children.at(-1);
  const isLastItemEmptyMappingItem =
    lastItem?.type === "flowMappingItem" &&
    isEmptyNode(lastItem.key) &&
    isEmptyNode(lastItem.value);

  return [
    openMarker,
    alignWithSpaces(options.tabWidth, [
      mappingKeyHasTrailingComment ? hardline : bracketSpacing,
      printChildren(path, options, print),
      options.trailingComma === "none" ? "" : ifBreak(","),
      hasEndComments(node)
        ? [hardline, join(hardline, path.map(print, "endComments"))]
        : "",
    ]),
    isLastItemEmptyMappingItem ? "" : bracketSpacing,
    closeMarker,
  ];
}

function printChildren(path, options, print) {
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
