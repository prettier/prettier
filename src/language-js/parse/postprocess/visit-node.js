import isObject from "../../../utilities/is-object.js";
import getVisitorKeys from "../../traverse/get-visitor-keys.js";

function visitNode(node, options, parent, key) {
  if (!isObject(node)) {
    return node;
  }

  if (Array.isArray(node)) {
    // As of Node.js 16 using raw for loop over Array.entries provides a
    // measurable difference in performance. Array.entries returns an iterator
    // of arrays.
    for (let i = 0; i < node.length; i++) {
      node[i] = visitNode(node[i], options, node, i);
    }
    return node;
  }

  if (options.onEnter) {
    const result = options.onEnter(node, parent, key) ?? node;
    // If node is replaced, re-enter
    if (result !== node) {
      return visitNode(result, options, parent, key);
    }

    node = result;
  }

  const keys = getVisitorKeys(node);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    node[key] = visitNode(node[key], options, node, key);
  }

  if (options.onLeave) {
    node = options.onLeave(node) || node;
  }

  return node;
}

export default visitNode;
