import { createMethodShim } from "./shared.js";

const arrayFindLast =
  Array.prototype.findLast ??
  function (callback) {
    for (let index = this.length - 1; index >= 0; index--) {
      const element = this[index];
      if (callback(element, index, this)) {
        return element;
      }
    }
  };

const findLast = createMethodShim("findLast", function () {
  if (Array.isArray(this)) {
    return arrayFindLast;
  }
});

export default findLast;
