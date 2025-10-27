const createMethodShim =
  (methodName, getImplementation) =>
  (isOptionalObject, object, ...arguments_) => {
    if (isOptionalObject && (object === undefined || object === null)) {
      return;
    }

    const implementation = getImplementation.call(object) ?? object[methodName];

    return implementation.apply(object, arguments_);
  };

export { createMethodShim };
