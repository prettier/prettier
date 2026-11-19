import { createTypeCheckFunction } from "./create-type-check-function.js";

const classPropertyTypes = /** @type {const} */ ([
  "ClassProperty",
  "PropertyDefinition",
  "ClassPrivateProperty",
  "ClassAccessorProperty",
  "AccessorProperty",
  "AbstractPropertyDefinition",
  "TSAbstractPropertyDefinition",
  "TSAbstractAccessorProperty",
]);

const isClassProperty = createTypeCheckFunction(classPropertyTypes);

export { classPropertyTypes, isClassProperty };
