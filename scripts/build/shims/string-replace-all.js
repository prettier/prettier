import shimMethod from "./shim-method.js";

const replaceAll =
  String.prototype.replaceAll ??
  function (pattern, replacement) {
    // Simple detection to check if pattern is a `RegExp`
    if (pattern.global) {
      return this.replace(pattern, replacement);
    }

    // Doesn't work for substitutes, eg `.replaceAll("*", "\\$&")`
    return this.split(pattern).join(replacement);
  };

const stringReplaceAll = shimMethod(function () {
  return typeof this === "string";
}, replaceAll);

export default stringReplaceAll;
