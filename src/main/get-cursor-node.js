import { getChildren, getDescendants, isLeaf } from "../utils/ast-utils.js";
import createGetVisitorKeysFunction from "./create-get-visitor-keys-function.js";

/**
 * Find the location of the cursor in the AST, represented in one of the
 * following ways:
 * 
 *   { "cursorNode": <node> } - the cursor is WITHIN <node>
 
 *   { "nodeBeforeCursor": <node1> | undefined,
 *     "nodeAfterCursor": <node2> | undefined }
 *   - the cursor is BETWEEN <node1> and <node2>. `undefined` represents the
 *     beginning or end of the document.
 * 
 * This function will return whichever of the above possibilities most
 * precisely identifies the cursor's location. This means returning a
 * "cursorNode" when the cursor lies within a leaf node of the AST, and one of
 * the other possibilities otherwise.
 */
function getCursorLocation(ast, options) {
  const { cursorOffset, locStart, locEnd } = options;
  const getVisitorKeys = createGetVisitorKeysFunction(
    options.printer.getVisitorKeys,
  );

  const nodeContainsCursor = (node) =>
    locStart(node) <= cursorOffset && locEnd(node) >= cursorOffset;

  let cursorNode = ast;
  const nodesContainingCursor = [ast];

  for (const node of getDescendants(ast, {
    getVisitorKeys,
    filter: nodeContainsCursor,
  })) {
    nodesContainingCursor.push(node);
    cursorNode = node;
  }

  if (isLeaf(cursorNode, { getVisitorKeys })) {
    return { cursorNode };
  }

  // We've established that the cursor is NOT contained in a leaf node of the
  // AST. We instead need to find two nodes (which needn't necessarily be
  // leaves) of the AST that the cursor lies *between*.

  let nodeBeforeCursor;
  let nodeAfterCursor;
  let nodeBeforeCursorEndIndex = -1;
  let nodeAfterCursorStartIndex = Number.POSITIVE_INFINITY;

  while (
    nodesContainingCursor.length > 0 &&
    (nodeBeforeCursor === undefined || nodeAfterCursor === undefined)
  ) {
    cursorNode = nodesContainingCursor.pop();
    const foundBeforeNode = nodeBeforeCursor !== undefined;
    const foundAfterNode = nodeAfterCursor !== undefined;
    for (const node of getChildren(cursorNode, { getVisitorKeys })) {
      if (!foundBeforeNode) {
        const nodeEnd = locEnd(node);
        if (nodeEnd <= cursorOffset && nodeEnd > nodeBeforeCursorEndIndex) {
          nodeBeforeCursor = node;
          nodeBeforeCursorEndIndex = nodeEnd;
        }
      }
      if (!foundAfterNode) {
        const nodeStart = locStart(node);
        if (
          nodeStart >= cursorOffset &&
          nodeStart < nodeAfterCursorStartIndex
        ) {
          nodeAfterCursor = node;
          nodeAfterCursorStartIndex = nodeStart;
        }
      }
    }
  }

  return {
    nodeBeforeCursor,
    nodeAfterCursor,
  };
}

export default getCursorLocation;
