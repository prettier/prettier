import getRaw from "./get-raw.js";
import { jsxWhitespace } from "./jsx-whitespace.js";

/**
@import {Node} from "../types/estree.js";
*/

// Meaningful if it contains non-whitespace characters,
// or it contains whitespace without a new line.
/**
 * @param {Node} node
 * @returns {boolean}
 */
function isMeaningfulJsxText(node) {
  return (
    node.type === "JSXText" &&
    (jsxWhitespace.hasNonWhitespaceCharacter(getRaw(node)) ||
      !/\n/.test(getRaw(node)))
  );
}

export { isMeaningfulJsxText };
