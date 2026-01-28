/**
@import {
  Node,
} from "../types/estree.js";
*/

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isFlowObjectTypePropertyAFunction(node) {
  return (
    (node.type === "ObjectTypeProperty" ||
      node.type === "ObjectTypeInternalSlot") &&
    !node.static &&
    !node.method &&
    // @ts-expect-error -- exists on `ObjectTypeProperty` but not `ObjectTypeInternalSlot`
    node.kind !== "get" &&
    // @ts-expect-error -- exists on `ObjectTypeProperty` but not `ObjectTypeInternalSlot`
    node.kind !== "set" &&
    node.value.type === "FunctionTypeAnnotation"
  );
}

export { isFlowObjectTypePropertyAFunction };
