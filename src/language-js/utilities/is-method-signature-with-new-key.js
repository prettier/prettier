import { isStringLiteral } from "./node-types.js";

/**
@import {Node} from "../types/estree.js"
*/

const isIdentifierNew = (node) =>
  node.type === "Identifier" && node.name === "new";
const isStringLiteralNew = (node) =>
  isStringLiteral(node) && node.value === "new";

function isFlowMethodSignatureWithNewKey(node) {
  return (
    node.type === "ObjectTypeProperty" &&
    node.method &&
    !node.computed &&
    (isStringLiteralNew(node.key) || isIdentifierNew(node.key))
  );
}

function isTsMethodSignatureWithNewKey(node) {
  return (
    node.type === "TSMethodSignature" &&
    !node.computed &&
    isStringLiteralNew(node.key)
  );
}

/**
@param {Node} node
@returns {boolean}
*/
function isMethodSignatureWithNewKey(node) {
  return (
    isTsMethodSignatureWithNewKey(node) || isFlowMethodSignatureWithNewKey(node)
  );
}

export { isFlowMethodSignatureWithNewKey, isMethodSignatureWithNewKey };
