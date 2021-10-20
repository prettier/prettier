"use strict";

const { isNonEmptyArray } = require("../common/util.js");
const getLast = require("../utils/get-last.js");

const NODES_KEYS = {
  attrs: true,
  children: true,
};

// TODO: typechecking is problematic for this class because of this issue:
// https://github.com/microsoft/TypeScript/issues/26811

class Node {
  constructor(props = {}) {
    for (const [key, value] of Object.entries(props)) {
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
          attrMap: Object.fromEntries(
            this[key].map((attr) => [attr.fullName, attr.value])
          ),
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
      // @ts-expect-error
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

  walk(fn) {
    for (const NODES_KEY in NODES_KEYS) {
      const nodes = this[NODES_KEY];
      if (nodes) {
        for (let i = 0; i < nodes.length; i++) {
          nodes[i].walk(fn);
        }
      }
    }
    fn(this);
  }

  /**
   * @param {Node} [target]
   * @param {Object} [node]
   */
  insertChildBefore(target, node) {
    const newNode = new Node(node);
    setNonEnumerableProperties(newNode, {
      // @ts-expect-error
      index: target.index,
      // @ts-expect-error
      prev: target.prev,
      next: target,
      parent: this,
    });

    let next = target;
    while (next) {
      // @ts-expect-error
      next.index++;
      // @ts-expect-error
      next = next.next;
    }

    // @ts-expect-error
    newNode.next.prev = newNode;
    // @ts-expect-error
    if (newNode.prev) {
      // @ts-expect-error
      newNode.prev.next = newNode;
    }

    // @ts-expect-error
    this.children.splice(this.children.indexOf(target), 0, newNode);
  }

  /**
   * @param {Node} [child]
   */
  removeChild(child) {
    // @ts-expect-error
    if (child.next) {
      // @ts-expect-error
      child.next.prev = child.prev;
    }

    // @ts-expect-error
    if (child.prev) {
      // @ts-expect-error
      child.prev.next = child.next;
    }

    // @ts-expect-error
    let { next } = child;
    while (next) {
      next.index--;
      next = next.next;
    }

    // @ts-expect-error
    this.children.splice(this.children.indexOf(child), 1);
  }

  /**
   * @param {Object} [overrides]
   */
  clone(overrides) {
    return new Node(overrides ? { ...this, ...overrides } : this);
  }

  /**
   * @param {Array} [children]
   */
  setChildren(children) {
    this._setNodes("children", children);
  }

  get firstChild() {
    // @ts-expect-error
    return isNonEmptyArray(this.children) ? this.children[0] : null;
  }

  get lastChild() {
    // @ts-expect-error
    return isNonEmptyArray(this.children) ? getLast(this.children) : null;
  }

  // for element and attribute
  get rawName() {
    // @ts-expect-error
    return this.hasExplicitNamespace ? this.fullName : this.name;
  }
  get fullName() {
    // @ts-expect-error
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
  const descriptors = Object.fromEntries(
    Object.entries(props).map(([key, value]) => [
      key,
      { value, enumerable: false, writable: true },
    ])
  );

  Object.defineProperties(obj, descriptors);
}

module.exports = {
  Node,
};
