"use strict";

const { isNonEmptyArray } = require("../common/util");
const NODES_KEYS = {
  attrs: true,
  children: true,
};

class Node {
  constructor({
    // eslint-disable-next-line unicorn/no-useless-undefined
    index = undefined,
    // eslint-disable-next-line unicorn/no-useless-undefined
    siblings = undefined,
    // eslint-disable-next-line unicorn/no-useless-undefined
    prev = undefined,
    // eslint-disable-next-line unicorn/no-useless-undefined
    next = undefined,
    // eslint-disable-next-line unicorn/no-useless-undefined
    parent = undefined,
    // eslint-disable-next-line unicorn/no-useless-undefined
    hasExplicitNamespace = undefined,
    // eslint-disable-next-line unicorn/no-useless-undefined
    name = undefined,
    // eslint-disable-next-line unicorn/no-useless-undefined
    namespace = undefined,
    // eslint-disable-next-line unicorn/no-useless-undefined
    children = undefined,
    ...opts
  } = {}) {
    // explicit properties needed here due to:
    // https://github.com/microsoft/TypeScript/issues/26811
    this.index = index;
    this.siblings = siblings;
    this.prev = prev;
    this.next = next;
    this.parent = parent;
    this.hasExplicitNamespace = hasExplicitNamespace;
    this.name = name;
    this.namespace = namespace;

    this.children = children && cloneAndUpdateNodes(children, this);

    for (const key of Object.keys(opts)) {
      const value = opts[key];
      if (key in NODES_KEYS) {
        this._setNodes(key, value);
      } else {
        this[key] = value;
      }
    }
  }

  _setNodes(key, nodes) {
    if (nodes !== this[key]) {
      this[key] = cloneAndUpdateNodes(nodes, this);
      if (key === "attrs") {
        setNonEnumerableProperties(this, {
          attrMap: this[key].reduce((reduced, attr) => {
            reduced[attr.fullName] = attr.value;
            return reduced;
          }, Object.create(null)),
        });
      }
    }
  }

  map(fn) {
    /** @type{any} */
    let newNode = null;

    for (const NODES_KEY in NODES_KEYS) {
      const nodes = this[NODES_KEY];
      if (nodes) {
        const mappedNodes = mapNodesIfChanged(nodes, (node) => node.map(fn));
        if (newNode !== nodes) {
          if (!newNode) {
            newNode = new Node();
          }
          newNode._setNodes(NODES_KEY, mappedNodes);
        }
      }
    }

    if (newNode) {
      for (const key in this) {
        if (!(key in NODES_KEYS)) {
          newNode[key] = this[key];
        }
      }
      const { index, siblings, prev, next, parent } = this;
      setNonEnumerableProperties(newNode, {
        index,
        siblings,
        prev,
        next,
        parent,
      });
    }

    return fn(newNode || this);
  }

  /**
   * @param {Object} [overrides]
   */
  clone(overrides) {
    return new Node(overrides ? { ...this, ...overrides } : this);
  }

  get firstChild() {
    return isNonEmptyArray(this.children) ? this.children[0] : null;
  }

  get lastChild() {
    return isNonEmptyArray(this.children)
      ? this.children[this.children.length - 1]
      : null;
  }

  // for element and attribute
  get rawName() {
    return this.hasExplicitNamespace ? this.fullName : this.name;
  }
  get fullName() {
    return this.namespace ? this.namespace + ":" + this.name : this.name;
  }
}

function mapNodesIfChanged(nodes, fn) {
  const newNodes = nodes.map(fn);
  return newNodes.some((newNode, index) => newNode !== nodes[index])
    ? newNodes
    : nodes;
}

function cloneAndUpdateNodes(nodes, parent) {
  const siblings = nodes.map((node) =>
    node instanceof Node ? node.clone() : new Node(node)
  );

  let prev = null;
  let current = siblings[0];
  let next = siblings[1] || null;

  for (let index = 0; index < siblings.length; index++) {
    setNonEnumerableProperties(current, {
      index,
      siblings,
      prev,
      next,
      parent,
    });
    prev = current;
    current = next;
    next = siblings[index + 2] || null;
  }

  return siblings;
}

function setNonEnumerableProperties(obj, props) {
  const descriptors = Object.keys(props).reduce((reduced, key) => {
    reduced[key] = { value: props[key], enumerable: false };
    return reduced;
  }, {});
  Object.defineProperties(obj, descriptors);
}

module.exports = {
  Node,
};
