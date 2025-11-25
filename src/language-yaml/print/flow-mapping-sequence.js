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

  /** @type {softline | line | hardline} */
  let bracketSpacing = softline;
  if (isMapping && node.children.length > 0 && options.bracketSpacing) {
    bracketSpacing = line;
  }

  if (
    isMapping &&
    node.children.length > 0 &&
    (hasTrailingComment(node) ||
      node.children.some(
        (child) =>
          child.type === "flowMappingItem" &&
          child.key &&
          hasTrailingComment(child.key.content),
      ))
  ) {
    bracketSpacing = hardline;
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
  const { node: parentNode } = path;
  const isMapping = parentNode.type === "flowMapping";

  // Check if any child has trailing comment on key
  const hasKeyWithTrailingComment =
    isMapping &&
    parentNode.children.some(
      (child) =>
        child.type === "flowMappingItem" &&
        child.key &&
        hasTrailingComment(child.key.content),
    );

  // Use hardline separator when keys have trailing comments to allow comments on their own line
  const separator = hasKeyWithTrailingComment ? hardline : line;

  return path.map(
    ({ isLast, node, next }) => [
      print(),
      isLast
        ? ""
        : [
            ",",
            separator,
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
