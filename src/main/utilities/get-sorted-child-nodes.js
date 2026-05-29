import { getChildren } from "../../utilities/ast.js";
import { getOrInsertComputed } from "../../utilities/get-or-insert.js";

function getSortedChildNodesWithoutCache(node, ancestors, options) {
  const { filter } = options;

  if (!filter) {
    return [];
  }

  let childAncestors;
  const childNodes = (
    options.getChildren?.(node, options) ?? [
      ...getChildren(node, { getVisitorKeys: options.getVisitorKeys }),
    ]
  ).flatMap((child) => {
    childAncestors ??= [node, ...ancestors];
    return filter(child, childAncestors)
      ? [child]
      : getSortedChildNodes(child, childAncestors, options);
  });

  const { locStart, locEnd } = options;

  // Sort by `start` location first, then `end` location
  childNodes.sort(
    (nodeA, nodeB) =>
      locStart(nodeA) - locStart(nodeB) || locEnd(nodeA) - locEnd(nodeB),
  );

  return childNodes;
}

function getSortedChildNodes(node, ancestors, options) {
  return getOrInsertComputed(options.cache, node, (node) =>
    getSortedChildNodesWithoutCache(node, ancestors, options),
  );
}

export default getSortedChildNodes;
