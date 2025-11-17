import { createMethodShim } from "./shared.js";

const arrayToReversed =
  Array.prototype.toReversed ??
  function () {
    return [...this].reverse();
  };

const toReversed = createMethodShim("toReversed", function () {
  if (Array.isArray(this)) {
    return arrayToReversed;
  }
});

export default toReversed;
