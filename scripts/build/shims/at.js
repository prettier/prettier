/*
Note:

1. `acorn` contains `RegExpValidationState` class with `.at` method (2 arguments)
2. `postcss` contains `Container` class with `.at` method
*/

const at = (isOptionalObject, object, index) => {
  if (isOptionalObject && (object === undefined || object === null)) {
    return;
  }

  // "relative indexing" is not available in Node.js v14
  // `.at` method is slower than property access on Node.js v16 and v18, see #14396
  // Only checked arrays and strings, since we haven't use `TypedArray`, and the transform only works for sources
  if (Array.isArray(object) || typeof object === "string") {
    return object[index < 0 ? object.length + index : index];
  }

  return object.at(index);
};

export default at;
