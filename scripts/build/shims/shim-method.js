const shimMethod =
  (implementations) =>
  (isOptionalObject, object, method, ...arguments_) => {
    if (isOptionalObject && (object === undefined || object === null)) {
      return;
    }

    const [, implementation = object[method]] = implementations.find(([test]) =>
      test.call(object),
    );

    return implementation.apply(object, arguments_);
  };

export default shimMethod;
