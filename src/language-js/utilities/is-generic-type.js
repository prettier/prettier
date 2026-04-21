/**
@import {
  Node,
} from "../types/estree.js";
*/

/**
@param {Node} node
@returns {boolean}
*/
function isGenericType(node) {
  switch (node.type) {
    case "FunctionTypeAnnotation":
    case "GenericTypeAnnotation":
    case "TSFunctionType":
      return Boolean(node.typeParameters);
    case "TSTypeReference":
      return Boolean(node.typeArguments);
    default:
      return false;
  }
}

export { isGenericType };
