import createGetVisitorKeysFunction from "./create-get-visitor-keys-function.js";

function getCursorNode(ast, options) {
  const { cursorOffset, locStart, locEnd } = options;

  const getVisitorKeys = createGetVisitorKeysFunction(
    options.printer.getVisitorKeys
  );

  const nodes = getChildren(ast, {
    getVisitorKeys,
    comparator(nodeA, nodeB) {
      const lengthA = locEnd(nodeA) - locStart(nodeA);
      const lengthB = locEnd(nodeB) - locStart(nodeB);
      return lengthA - lengthB;
    },
    containsCursor(node) {
      return locStart(node) <= cursorOffset && locEnd(node) >= cursorOffset;
    },
  });

  return nodes[0] ?? ast;
}

function getChildren(node, options) {
  if (
    !(node !== null && typeof node === "object" && options.containsCursor(node))
  ) {
    return [];
  }

  return [
    ...options
      .getVisitorKeys(node)
      .flatMap((key) => node[key])
      .flatMap((node) => getChildren(node, options)),
    node,
  ].sort(options.comparator);
}

export default getCursorNode;
