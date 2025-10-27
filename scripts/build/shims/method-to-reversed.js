import shimMethod from "./shim-method.js";

const toReversed = shimMethod("toReversed", [
  [
    function () {
      return Array.isArray(this);
    },
    Array.prototype.toReversed ??
      function () {
        return [...this].reverse();
      },
  ],
]);

export default toReversed;
