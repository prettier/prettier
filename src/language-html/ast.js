const NODES_KEYS = {
  attrs: true,
  children: true,
  cases: true, // plural and select
  expression: true, // for expansionCase
};

const NON_ENUMERABLE_PROPERTIES = new Set(["parent"]);

// TODO: typechecking is problematic for this class because of this issue:
// https://github.com/microsoft/TypeScript/issues/26811

class Node {
  type;
  parent;

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
    const children = this.$children;
    children.splice(children.indexOf(target), 0, this.createChild(node));
  }

  /**
   * @param {Node} [child]
   */
  removeChild(child) {
    const children = this.$children;
    children.splice(children.indexOf(child), 1);
  }

  /**
   * @param {Node} [target]
   * @param {Object} [node]
   */
  replaceChild(target, node) {
    const children = this.$children;
    children[children.indexOf(target)] = this.createChild(node);
  }

  clone() {
    return new Node(this);
  }

  get #childrenProperty() {
    if (this.type === "angularIcuCase") {
      return "expression";
    }

    if (this.type === "angularIcuExpression") {
      return "cases";
    }

    return "children";
  }

  // Use `$` prefix since `children` already exits in the original AST,
  // Can't use `#children` either, since it need be public
  // There are other children in different Node, see `#childrenProperty`
  get $children() {
    return this[this.#childrenProperty];
  }

  set $children(value) {
    this[this.#childrenProperty] = value;
  }

  get firstChild() {
    return this.$children?.[0];
  }

  get lastChild() {
    return this.$children?.at(-1);
  }

  get #siblings() {
    return this.parent?.$children ?? [];
  }

  get prev() {
    const siblings = this.#siblings;
    return siblings[siblings.indexOf(this) - 1];
  }

  get next() {
    const siblings = this.#siblings;
    return siblings[siblings.indexOf(this) + 1];
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
      this.attrs.map((attr) => [attr.fullName, attr.value]),
    );
  }
}

function mapNodesIfChanged(nodes, fn) {
  const newNodes = nodes.map(fn);
  return newNodes.some((newNode, index) => newNode !== nodes[index])
    ? newNodes
    : nodes;
}

export { Node };
