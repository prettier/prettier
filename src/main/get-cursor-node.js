import createGetVisitorKeysFunction from "./create-get-visitor-keys-function.js";
import { getDescendants } from "./ast-utils.js";

function getCursorNode(ast, options) {
  const { cursorOffset, locStart, locEnd } = options;
  const getVisitorKeys = createGetVisitorKeysFunction(
    options.printer.getVisitorKeys
  );
  const nodeContainsCursor = (node) =>
    locStart(node) <= cursorOffset && locEnd(node) >= cursorOffset;

  let cursorNode = ast;
  for (const node of getDescendants(ast, {
    getVisitorKeys,
    filter: nodeContainsCursor,
  })) {
    cursorNode = node;
  }

  return cursorNode;
}

export default getCursorNode;
