import shimMethod from "./shim-method.js";

const toReversed =
  Array.prototype.toReversed ??
  function () {
    return [...this].reverse();
  };

const arrayToReversed = shimMethod(function () {
  return Array.isArray(this);
}, toReversed);

export default arrayToReversed;
