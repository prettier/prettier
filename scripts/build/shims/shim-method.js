const shimMethod =
  (test, implementation) =>
  (isOptionalObject, object, method, ...arguments_) => {
    if (isOptionalObject && (object === undefined || object === null)) {
      return;
    }

    if (test.call(object)) {
      return implementation.apply(object, arguments_);
    }

    return object[method](...arguments_);
  };

export default shimMethod;
