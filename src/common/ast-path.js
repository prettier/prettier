import getLast from "../utils/get-last.js";

function getNodeHelper(stack, count) {
  const stackIndex = getNodeStackIndexHelper(stack, count);
  return stackIndex === -1 ? null : stack[stackIndex];
}

function getNodeStackIndexHelper(stack, count) {
  for (let i = stack.length - 1; i >= 0; i -= 2) {
    const value = stack[i];
    if (value && !Array.isArray(value) && --count < 0) {
      return i;
    }
  }
  return -1;
}

const isThenable = (object) => typeof object?.then === "function";
const tryFinally = (fn, onSettled) => {
  let result;
  try {
    result = fn();
  } catch (error) {
    onSettled();
    throw error;
  }

  if (isThenable(result)) {
    return result.finally(onSettled);
  }

  onSettled();
  return result;
};

class AstPath {
  #stack = [];

  constructor(value) {
    this.#stack.push(value);
  }

  // The name of the current property is always the penultimate element of
  // this.stack, and always a String.
  getName() {
    const stack = this.#stack;
    const { length } = stack;
    if (length > 1) {
      return stack[length - 2];
    }
    // Since the name is always a string, null is a safe sentinel value to
    // return if we do not know the name of the (root) value.
    /* istanbul ignore next */
    return null;
  }

  // The value of the current property is always the final element of
  // this.stack.
  getValue() {
    return getLast(this.#stack);
  }

  getNode(count = 0) {
    return getNodeHelper(this.#stack, count);
  }

  getParentNode(count = 0) {
    return getNodeHelper(this.#stack, count + 1);
  }

  // Temporarily push properties named by string arguments given after the
  // callback function onto this.stack, then call the callback with a
  // reference to this (modified) AstPath object. Note that the stack will
  // be restored to its original state after the callback is finished, so it
  // is probably a mistake to retain a reference to the path.
  call(callback, ...names) {
    const stack = this.#stack;
    const { length } = stack;
    let value = getLast(stack);

    for (const name of names) {
      value = value[name];
      stack.push(name, value);
    }

    return tryFinally(
      () => callback(this),
      () => {
        stack.length = length;
      }
    );
  }

  callParent(callback, count = 0) {
    const stack = this.#stack;
    const stackIndex = getNodeStackIndexHelper(stack, count + 1);
    const parentValues = stack.splice(stackIndex + 1);

    return tryFinally(
      () => callback(this),
      () => {
        stack.push(...parentValues);
      }
    );
  }

  // Similar to AstPath.prototype.call, except that the value obtained by
  // accessing this.getValue()[name1][name2]... should be array. The
  // callback will be called with a reference to this path object for each
  // element of the array.
  each(callback, ...names) {
    const stack = this.#stack;
    const { length } = stack;
    let value = getLast(stack);

    for (const name of names) {
      value = value[name];
      stack.push(name, value);
    }

    const iteratee = (index) =>
      tryFinally(
        () => {
          stack.push(index, value[index]);
          return callback(this, index, value);
        },
        () => {
          stack.length -= 2;
        }
      );

    return tryFinally(
      () => {
        let promise;

        for (let index = 0; index < value.length; index++) {
          if (promise) {
            promise = promise.then(() => iteratee(index));
            continue;
          }

          const result = iteratee(index);

          if (isThenable(result)) {
            promise = result;
          }
        }

        return promise;
      },
      () => {
        stack.length = length;
      }
    );
  }

  // Similar to AstPath.prototype.each, except that the results of the
  // callback function invocations are stored in an array and returned at
  // the end of the iteration.
  map(callback, ...names) {
    const results = [];
    const maybePromise = this.each((path, index, value) => {
      const result = callback(path, index, value);
      results[index] = result;
      return result;
    }, ...names);
    return isThenable(maybePromise)
      ? maybePromise.then(() => Promise.all(results))
      : results;
  }

  /**
   * @param {() => void} callback
   * @internal Unstable API. Don't use in plugins for now.
   */
  try(callback) {
    const stack = this.#stack;
    const stackBackup = [...stack];

    return tryFinally(
      () => callback(),
      () => {
        stack.length = 0;
        stack.push(...stackBackup);
      }
    );
  }

  /**
   * @param {...(
   *   | ((node: any, name: string | null, number: number | null) => boolean)
   *   | undefined
   * )} predicates
   */
  match(...predicates) {
    const stack = this.#stack;
    let stackPointer = stack.length - 1;

    let name = null;
    let node = stack[stackPointer--];

    for (const predicate of predicates) {
      /* istanbul ignore next */
      if (node === undefined) {
        return false;
      }

      // skip index/array
      let number = null;
      if (typeof name === "number") {
        number = name;
        name = stack[stackPointer--];
        node = stack[stackPointer--];
      }

      if (predicate && !predicate(node, name, number)) {
        return false;
      }

      name = stack[stackPointer--];
      node = stack[stackPointer--];
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
    const stack = this.#stack;
    let stackPointer = stack.length - 1;

    let name = null;
    let node = stack[stackPointer--];

    while (node) {
      // skip index/array
      let number = null;
      if (typeof name === "number") {
        number = name;
        name = stack[stackPointer--];
        node = stack[stackPointer--];
      }

      if (name !== null && predicate(node, name, number)) {
        return node;
      }

      name = stack[stackPointer--];
      node = stack[stackPointer--];
    }
  }
}

export default AstPath;
