"use strict";

const NODES_KEYS = {
  attrs: true,
  children: true,
};

const NON_ENUMERABLE_PROPERTIES = new Set(["parent"]);

// TODO: typechecking is problematic for this class because of this issue:
// https://github.com/microsoft/TypeScript/issues/26811

class Node {
  constructor(nodeOrProperties = {}) {
    for (const property of new Set([
      ...NON_ENUMERABLE_PROPERTIES,
      ...Object.keys(nodeOrProperties),
    ])) {
      this.setProperty(property, nodeOrProperties[property]);
    }
  }

  setProperty(property, value) {
    if (this[property] === value) {
      return;
    }

    if (property in NODES_KEYS) {
      value = value.map((node) => this.createChild(node));
    }

    if (!NON_ENUMERABLE_PROPERTIES.has(property)) {
      this[property] = value;
      return;
    }

    Object.defineProperty(this, property, {
      value,
      enumerable: false,
      configurable: true,
    });
  }

  map(fn) {
    /** @type{any} */
    let newNode;

    for (const NODES_KEY in NODES_KEYS) {
      const nodes = this[NODES_KEY];
      if (nodes) {
        const mappedNodes = mapNodesIfChanged(nodes, (node) => node.map(fn));
        if (newNode !== nodes) {
          if (!newNode) {
            // @ts-expect-error
            newNode = new Node({ parent: this.parent });
          }
          newNode.setProperty(NODES_KEY, mappedNodes);
        }
      }
    }

    if (newNode) {
      for (const key in this) {
        if (!(key in NODES_KEYS)) {
          newNode[key] = this[key];
        }
      }
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

  createChild(nodeOrProperties) {
    const node =
      nodeOrProperties instanceof Node
        ? nodeOrProperties.clone()
        : new Node(nodeOrProperties);
    node.setProperty("parent", this);
    return node;
  }

  /**
   * @param {Node} [target]
   * @param {Object} [node]
   */
  insertChildBefore(target, node) {
    // @ts-expect-error
    this.children.splice(
      // @ts-expect-error
      this.children.indexOf(target),
      0,
      this.createChild(node)
    );
  }

  /**
   * @param {Node} [child]
   */
  removeChild(child) {
    // @ts-expect-error
    this.children.splice(this.children.indexOf(child), 1);
  }

  /**
   * @param {Node} [target]
   * @param {Object} [node]
   */
  replaceChild(target, node) {
    // @ts-expect-error
    this.children[this.children.indexOf(target)] = this.createChild(node);
  }

  clone() {
    return new Node(this);
  }

  get firstChild() {
    // @ts-expect-error
    return this.children?.[0];
  }

  get lastChild() {
    // @ts-expect-error
    return this.children?.[this.children.length - 1];
  }

  get prev() {
    // @ts-expect-error
    return this.parent?.children[this.parent.children.indexOf(this) - 1];
  }

  get next() {
    // @ts-expect-error
    return this.parent?.children[this.parent.children.indexOf(this) + 1];
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

  get attrMap() {
    return Object.fromEntries(
      // @ts-expect-error
      this.attrs.map((attr) => [attr.fullName, attr.value])
    );
  }
}

function mapNodesIfChanged(nodes, fn) {
  const newNodes = nodes.map(fn);
  return newNodes.some((newNode, index) => newNode !== nodes[index])
    ? newNodes
    : nodes;
}

module.exports = {
  Node,
};
