const foo = "Bar";

/**
 * @template T
 * @param {Type} type
 * @param {T} value
 * @return {Value}
 *//**
 * @param {Type} type
 * @return {Value}
 */
function value(type, value) {
  if (arguments.length === 2) {
    return new ConcreteValue(type, value);
  } else {
    return new Value(type);
  }
}