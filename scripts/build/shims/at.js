/*
Note:

1. `acorn` contains `RegExpValidationState` class `.at` method (2 arguments)
2. `postcss` contains `Container` class `.at` method
*/

const at = (object, index, ...args) =>
  object.at
    ? object.at(index, ...args)
    : object[index < 0 ? object.length + index : index];

export default at;
