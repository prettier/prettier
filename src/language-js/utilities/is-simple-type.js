import isFlowKeywordType from "./is-flow-keyword-type.js";
import { isSimpleTypeAnnotation } from "./is-simple-type-annotation.js";
import isTsKeywordType from "./is-ts-keyword-type.js";

/**
@import {
  Node,
} from "../types/estree.js";
*/

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isSimpleType(node) {
  return (
    isTsKeywordType(node) ||
    isFlowKeywordType(node) ||
    isSimpleTypeAnnotation(node) ||
    (node.type === "GenericTypeAnnotation" && !node.typeParameters) ||
    (node.type === "TSTypeReference" && !node.typeArguments)
  );
}

export { isSimpleType };
