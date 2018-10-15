"use strict";

/**
 *     v-for="... of ..."
 *     v-for="... in ..."
 *     v-for="(..., ...) in ..."
 *
 *     v-for="item in items"
 *     v-for="(item, index) in items"
 *     v-for="value in object"
 *     v-for="(value, key) in object"
 *     v-for="(value, key, index) in object"
 *     v-for="n in evenNumbers"
 *     v-for="n in even(numbers)"
 *     v-for="n in 10"
 */
function printVForValue(value, textToDoc) {
  /**
   * v-for="(..., ...) in ..."
   */
  if (/^\s*\(/.test(value)) {
    return textToDoc(value, { parser: "__js_expression" });
  }

  /**
   * v-for="... of ..."
   * v-for="... in ..."
   */
  return textToDoc(`for (${value});`, {
    parser: "babylon",
    __isVueFor: true
  });
}

module.exports = {
  printVForValue
};
