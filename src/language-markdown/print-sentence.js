/**
 * @import AstPath from "../common/ast-path.js"
 * @import {Doc} from "../document/builders.js"
 */

import { fill } from "../document/builders.js";
import { DOC_TYPE_STRING } from "../document/constants.js";
import { getDocType } from "../document/utils.js";

/**
 * @param {AstPath} path
 * @param {*} print
 * @returns {Doc}
 */
function printSentence(path, print) {
  /** @type {Doc[]} */
  const parts = [""];

  path.each(() => {
    const { node } = path;
    const doc = print();
    switch (node.type) {
      case "whitespace":
        if (getDocType(doc) !== DOC_TYPE_STRING) {
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
