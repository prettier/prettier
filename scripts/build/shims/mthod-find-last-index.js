import shimMethod from "./shim-method.js";

const findLastIndex = shimMethod([
  [
    function () {
      return Array.isArray(this);
    },
    Array.prototype.findLastIndex ??
      function (callback) {
        for (let index = this.length - 1; index >= 0; index--) {
          const element = this[index];
          if (callback(element, index, this)) {
            return index;
          }
        }

        return -1;
      },
  ],
]);

export default findLastIndex;
