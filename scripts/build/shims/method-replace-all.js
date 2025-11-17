import { createMethodShim } from "./shared.js";

const stringReplaceAll =
  String.prototype.replaceAll ??
  function (pattern, replacement) {
    // Simple detection to check if pattern is a `RegExp`
    if (pattern.global) {
      return this.replace(pattern, replacement);
    }

    // Doesn't work for substitutes, eg `.replaceAll("*", "\\$&")`
    return this.split(pattern).join(replacement);
  };

const replaceAll = createMethodShim("replaceAll", function () {
  if (typeof this === "string") {
    return stringReplaceAll;
  }
});

export default replaceAll;
