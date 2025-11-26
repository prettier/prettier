const OPTIONAL_OBJECT = 0b01;

const createMethodShim =
  (methodName, getImplementation) =>
  (flags, object, ...arguments_) => {
    if (flags | OPTIONAL_OBJECT && (object === undefined || object === null)) {
      return;
    }

    const implementation = getImplementation.call(object) ?? object[methodName];

    return implementation.apply(object, arguments_);
  };

export { createMethodShim, OPTIONAL_OBJECT };
