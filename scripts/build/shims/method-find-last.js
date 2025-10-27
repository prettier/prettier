import shimMethod from "./shim-method.js";

const findLast = shimMethod("findLast", [
  [
    function () {
      return Array.isArray(this);
    },
    Array.prototype.findLast ??
      function (callback) {
        for (let index = this.length - 1; index >= 0; index--) {
          const element = this[index];
          if (callback(element, index, this)) {
            return element;
          }
        }
      },
  ],
]);

export default findLast;
