import { getChildren } from "../../utils/ast-utils.js";

const childNodesCache = new WeakMap();
function getSortedChildNodes(node, options, ancestors) {
  if (childNodesCache.has(node)) {
    return childNodesCache.get(node);
  }

  const {
    printer: { getCommentChildNodes, canAttachComment },
    locStart,
    locEnd,
    getVisitorKeys,
  } = options;

  if (!canAttachComment) {
    return [];
  }

  let childAncestors;
  const childNodes = (
    getCommentChildNodes?.(node, options) ?? [
      ...getChildren(node, { getVisitorKeys }),
    ]
  ).flatMap((child) => {
    childAncestors ??= [node, ...ancestors];
    return canAttachComment(child, childAncestors)
      ? [child]
      : getSortedChildNodes(child, options, childAncestors);
  });
  // Sort by `start` location first, then `end` location
  childNodes.sort(
    (nodeA, nodeB) =>
      locStart(nodeA) - locStart(nodeB) || locEnd(nodeA) - locEnd(nodeB),
  );

  childNodesCache.set(node, childNodes);
  return childNodes;
}

export default getSortedChildNodes;
