import { createMethodShim } from "./shared.js";

/*
Note:

1. `acorn` contains `RegExpValidationState` class with `.at` method (2 arguments)
2. `postcss` contains `Container` class with `.at` method
*/

function stringOrArrayAt(index) {
  return this[index < 0 ? this.length + index : index];
}

const at = createMethodShim("at", function () {
  // "relative indexing" is not available in Node.js v14
  // `.at` method is slower than property access on Node.js v16 and v18, see #14396
  // Only checked arrays and strings, since we haven't use `TypedArray`, and the transform only works for sources
  if (Array.isArray(this) || typeof this === "string") {
    return stringOrArrayAt;
  }
});

export default at;
