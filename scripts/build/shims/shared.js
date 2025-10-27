const [MEMBER_EXPRESSION_OPTIONAL] = Array.from(
  { length: 1 },
  (_, index) => 1 | index,
);

const createMethodShim =
  (methodName, getImplementation) =>
  (flags, object, ...arguments_) => {
    if (
      flags | MEMBER_EXPRESSION_OPTIONAL &&
      (object === undefined || object === null)
    ) {
      return;
    }

    const implementation = getImplementation.call(object) ?? object[methodName];

    return implementation.apply(object, arguments_);
  };

export { createMethodShim, MEMBER_EXPRESSION_OPTIONAL };
