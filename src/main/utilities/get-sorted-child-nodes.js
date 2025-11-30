import { getChildren } from "../../utilities/ast.js";

function getSortedChildNodes(node, ancestors, options) {
  const { cache: childNodesCache } = options;

  if (childNodesCache.has(node)) {
    return childNodesCache.get(node);
  }

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

  childNodesCache.set(node, childNodes);
  return childNodes;
}

export default getSortedChildNodes;
