import { isStringLiteral } from "./node-types.js";

/**
@import {Node} from "../types/estree.js"
*/

/**
@param {Node} node
@returns {boolean}
*/
function isMethodSignatureWithNewKey(node) {
  const isFlowMethod = node.type === "ObjectTypeProperty" && node.method;

  if (
    !(node.type === "TSMethodSignature" || isFlowMethod) ||
    ("computed" in node && node.computed)
  ) {
    return false;
  }

  const { key } = node;
  return isStringLiteral(key)
    ? key.value === "new"
    : isFlowMethod && key.type === "Identifier" && key.name === "new";
}

export { isMethodSignatureWithNewKey };
