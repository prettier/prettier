import isObject from "./is-object.js";

/**
 * @typedef {NonNullable<object>} Node
 * @typedef {(unknown) => string[]} GetVisitorKeys
 * @typedef {(unknown) => boolean} Predicate
 */

/**
 * @param {Node} node
 * @param {{getVisitorKeys: GetVisitorKeys, filter?: Predicate}} options
 */
function* getChildren(node, options) {
  const { getVisitorKeys, filter = () => true } = options;
  const isMatchedNode = (node) => isObject(node) && filter(node);

  for (const key of getVisitorKeys(node)) {
    const value = node[key];

    if (Array.isArray(value)) {
      for (const child of value) {
        if (isMatchedNode(child)) {
          yield child;
        }
      }
    } else if (isMatchedNode(value)) {
      yield value;
    }
  }
}

/**
 * @param {Node} node
 * @param {{getVisitorKeys: GetVisitorKeys, filter?: Predicate}} options
 */
function* getDescendants(node, options) {
  const queue = [node];
  for (let index = 0; index < queue.length; index++) {
    const node = queue[index];

    for (const child of getChildren(node, options)) {
      yield child;
      queue.push(child);
    }
  }
}

/**
 * @param {Node} node
 * @param {{getVisitorKeys: GetVisitorKeys}} options
 */
function isLeaf(node, options) {
  return getChildren(node, options).next().done;
}

/**
 * @param {Node} node
 * @param {{getVisitorKeys: GetVisitorKeys, predicate: Predicate}} options
 */
function hasDescendant(node, { getVisitorKeys, predicate }) {
  for (const descendant of getDescendants(node, { getVisitorKeys })) {
    if (predicate(descendant)) {
      return true;
    }
  }

  return false;
}

export { getChildren, getDescendants, hasDescendant, isLeaf };
