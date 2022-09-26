/*
Note:

1. `acorn` contains `RegExpValidationState` class with `.at` method (2 arguments)
2. `postcss` contains `Container` class with `.at` method
*/

const at = (isOptionalObject, object, index, ...args) => {
  if (isOptionalObject && (object === undefined || object === null)) {
    return;
  }

  return object.at
    ? object.at(index, ...args)
    : object[index < 0 ? object.length + index : index];
};

export default at;
