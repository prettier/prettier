import { isChainElementWrapper } from "./node-types.js";

/**
@import {
  Node,
  NodeMap,
} from "../types/estree.js";
*/

/**
@param {Node} node
@returns {Exclude<Node, NodeMap["ChainExpression"] | NodeMap["TSNonNullExpression"]>}
*/
function stripChainElementWrappers(node) {
  while (isChainElementWrapper(node)) {
    node = node.expression;
  }

  return node;
}

export { stripChainElementWrappers };
