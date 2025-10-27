import shimMethod from "./shim-method.js";

const findLast =
  Array.prototype.findLast ??
  function (callback) {
    for (let index = this.length - 1; index >= 0; index--) {
      const element = this[index];
      if (callback(element, index, this)) {
        return element;
      }
    }
  };

const arrayFindLast = shimMethod(function () {
  return Array.isArray(this);
}, findLast);

export default arrayFindLast;
