/*
Note:

1. `acorn` contains `RegExpValidationState` class with `.at` method (2 arguments)
2. `postcss` contains `Container` class with `.at` method
*/

const at = (isOptionalObject, object, index) => {
  if (isOptionalObject && (object === undefined || object === null)) {
    return;
  }

  return object.at
    ? object.at(index)
    : object[index < 0 ? object.length + index : index];
};

export default at;
