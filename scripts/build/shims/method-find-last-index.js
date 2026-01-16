import { createMethodShim } from "./shared.js";

const arrayFindLastIndex =
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

const findLastIndex = createMethodShim("findLastIndex", function () {
  if (Array.isArray(this)) {
    return arrayFindLastIndex;
  }
});

export default findLastIndex;
