import shimMethod from "./shim-method.js";

const findLastIndex =
  Array.prototype.findLastIndex ??
  function (callback) {
    for (let index = this.length - 1; index >= 0; index--) {
      const element = this[index];
      if (callback(element, index, this)) {
        return index;
      }
    }

    return -1;
  };

const arrayFindLastIndex = shimMethod(function () {
  return Array.isArray(this);
}, findLastIndex);

export default arrayFindLastIndex;
