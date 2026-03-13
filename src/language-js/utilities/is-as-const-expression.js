/**
@import {
  Node,
} from "../types/estree.js";
*/

/**
 * @param {Node} node
 * @returns {boolean}
 */
const isTsAsConstExpression = (node) =>
  node?.type === "TSAsExpression" &&
  node.typeAnnotation.type === "TSTypeReference" &&
  node.typeAnnotation.typeName.type === "Identifier" &&
  node.typeAnnotation.typeName.name === "const";

const isFlowAsConstExpression = (node) => node.type === "AsConstExpression";

const isAsConstExpression = (node) =>
  isTsAsConstExpression(node) || isFlowAsConstExpression(node);

export { isAsConstExpression, isFlowAsConstExpression, isTsAsConstExpression };
