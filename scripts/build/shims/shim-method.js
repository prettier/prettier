const shimMethod =
  (methodName, implementations) =>
  (isOptionalObject, object, ...arguments_) => {
    if (isOptionalObject && (object === undefined || object === null)) {
      return;
    }

    const [, implementation = object[methodName]] = implementations.find(
      ([test]) => test.call(object),
    );

    return implementation.apply(object, arguments_);
  };

export default shimMethod;
