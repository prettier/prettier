import assert from "node:assert";
import getLast from "../utils/get-last.js";
import { getPenultimate } from "./util.js";

class AstPath {
  constructor(value) {
    this.stack = [value];
  }

  get key() {
    const { stack } = this;
    return stack[stack.length - (this.isInArray ? 4 : 2)] ?? null;
  }

  get index() {
    return this.isInArray ? getPenultimate(this.stack) : null;
  }

  get node() {
    return getLast(this.stack);
  }

  get parent() {
    return this.getNode(1);
  }

  get grandparent() {
    return this.getNode(2);
  }

  get next() {
    return this.siblings[this.index + 1];
  }

  get previous() {
    return this.siblings[this.index - 1];
  }

  get siblings() {
    assert(this.isInArray);
    const { stack } = this;
    return stack[stack.length - 3];
  }

  get isInArray() {
    const { stack } = this;
    return Array.isArray(stack[stack.length - 3]);
  }

  get isFirst() {
    assert(this.isInArray);
    return this.index === 0;
  }

  get isLast() {
    assert(this.isInArray);
    return this.index === this.siblings.length - 1;
  }

  // The name of the current property is always the penultimate element of
  // this.stack, and always a string/number/symbol.
  getName() {
    const { stack } = this;
    const { length } = stack;
    if (length > 1) {
      return stack[length - 2];
    }
    // Since the name is a string/number/symbol, null is a safe sentinel value
    // to return if we do not know the name of the (root) value.
    /* istanbul ignore next */
    return null;
  }

  // The value of the current property is always the final element of
  // this.stack.
  getValue() {
    return getLast(this.stack);
  }

  getNode(count = 0) {
    const stackIndex = this.#getNodeStackIndex(count);
    return stackIndex === -1 ? null : this.stack[stackIndex];
  }

  getParentNode(count = 0) {
    return this.getNode(count + 1);
  }

  #getNodeStackIndex(count) {
    const { stack } = this;
    for (let i = stack.length - 1; i >= 0; i -= 2) {
      if (!Array.isArray(stack[i]) && --count < 0) {
        return i;
      }
    }
    return -1;
  }

  // Temporarily push properties named by string arguments given after the
  // callback function onto this.stack, then call the callback with a
  // reference to this (modified) AstPath object. Note that the stack will
  // be restored to its original state after the callback is finished, so it
  // is probably a mistake to retain a reference to the path.
  call(callback, ...names) {
    const { stack } = this;
    const { length } = stack;
    let value = getLast(stack);

    for (const name of names) {
      value = value[name];
      stack.push(name, value);
    }
    try {
      return callback(this);
    } finally {
      stack.length = length;
    }
  }

  callParent(callback, count = 0) {
    const stackIndex = this.#getNodeStackIndex(count + 1);
    const parentValues = this.stack.splice(stackIndex + 1);
    try {
      return callback(this);
    } finally {
      this.stack.push(...parentValues);
    }
  }

  // Similar to AstPath.prototype.call, except that the value obtained by
  // accessing this.getValue()[name1][name2]... should be array. The
  // callback will be called with a reference to this path object for each
  // element of the array.
  each(callback, ...names) {
    const { stack } = this;
    const { length } = stack;
    let value = getLast(stack);

    for (const name of names) {
      value = value[name];
      stack.push(name, value);
    }

    try {
      for (let i = 0; i < value.length; ++i) {
        stack.push(i, value[i]);
        callback(this, i, value);
        stack.length -= 2;
      }
    } finally {
      stack.length = length;
    }
  }

  // Similar to AstPath.prototype.each, except that the results of the
  // callback function invocations are stored in an array and returned at
  // the end of the iteration.
  map(callback, ...names) {
    const result = [];
    this.each((path, index, value) => {
      result[index] = callback(path, index, value);
    }, ...names);
    return result;
  }

  /**
   * @param {...(
   *   | ((node: any, name: string | null, number: number | null) => boolean)
   *   | undefined
   * )} predicates
   */
  match(...predicates) {
    let stackPointer = this.stack.length - 1;

    let name = null;
    let node = this.stack[stackPointer--];

    for (const predicate of predicates) {
      /* istanbul ignore next */
      if (node === undefined) {
        return false;
      }

      // skip index/array
      let number = null;
      if (typeof name === "number") {
        number = name;
        name = this.stack[stackPointer--];
        node = this.stack[stackPointer--];
      }

      if (predicate && !predicate(node, name, number)) {
        return false;
      }

      name = this.stack[stackPointer--];
      node = this.stack[stackPointer--];
    }

    return true;
  }

  /**
   * Traverses the ancestors of the current node heading toward the tree root
   * until it finds a node that matches the provided predicate function. Will
   * return the first matching ancestor. If no such node exists, returns undefined.
   * @param {(node: any, name: string, number: number | null) => boolean} predicate
   * @internal Unstable API. Don't use in plugins for now.
   */
  findAncestor(predicate) {
    let stackPointer = this.stack.length - 1;

    let name = null;
    let node = this.stack[stackPointer--];

    while (node) {
      // skip index/array
      let number = null;
      if (typeof name === "number") {
        number = name;
        name = this.stack[stackPointer--];
        node = this.stack[stackPointer--];
      }

      if (name !== null && predicate(node, name, number)) {
        return node;
      }

      name = this.stack[stackPointer--];
      node = this.stack[stackPointer--];
    }
  }
}

export default AstPath;
