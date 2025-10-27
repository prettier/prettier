import shimMethod from "./shim-method.js";

/*
Note:

1. `acorn` contains `RegExpValidationState` class with `.at` method (2 arguments)
2. `postcss` contains `Container` class with `.at` method
*/

const at = shimMethod(
  // "relative indexing" is not available in Node.js v14
  // `.at` method is slower than property access on Node.js v16 and v18, see #14396
  // Only checked arrays and strings, since we haven't use `TypedArray`, and the transform only works for sources
  function () {
    return Array.isArray(this) || typeof this === "string";
  },
  function (index) {
    return this[index < 0 ? this.length + index : index];
  },
);

export default at;
