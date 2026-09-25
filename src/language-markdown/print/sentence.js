/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

import { DOC_TYPE_STRING, fill, getDocType } from "../../document/index.js";

/**
 * @param {AstPath} path
 * @param {*} print
 * @param {*} options
 * @returns {Doc}
 */
function printSentence(path, print, options) {
  /** @type {Doc[]} */
  const parts = [""];

  path.each(() => {
    const { node } = path;
    const doc = print();
    switch (node.type) {
      case "whitespace":
        if (getDocType(doc) !== DOC_TYPE_STRING) {
          if (
            options.parser === "mdx" &&
            path.next?.type === "word" &&
            ["import", "export"].includes(path.next.value)
          ) {
            parts.push([parts.pop(), " "]);
            break;
          }
          parts.push(doc, "");
          break;
        }
      // fallthrough
      default:
        parts.push([parts.pop(), doc]);
    }
  }, "children");

  return fill(parts);
}

export { printSentence };
