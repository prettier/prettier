/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

import { DOC_TYPE_STRING, fill, getDocType } from "../../document/index.js";
import { isSetextHeading } from "../utilities.js";

/**
 * @param {AstPath} path
 * @param {*} print
 * @param {*} options
 * @returns {Doc}
 */
function printSentence(path, print, options) {
  /** @type {Doc[]} */
  let parts = [""];
  if (needsLeadingWhitespace(path, options)) {
    parts = [" "];
  }

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

/**
 * @param {AstPath} path
 * @param {*} options
 * @returns {boolean}
 */
function needsLeadingWhitespace(path, options) {
  if (options.parser !== "mdx") {
    return false;
  }
  if (path.grandparent.type !== "root") {
    return false;
  }
  if (path.parent.type !== "paragraph" && !isSetextHeading(path.parent)) {
    return false;
  }
  if (path.previous != null) {
    return false;
  }

  const { node } = path;
  return (
    node.children[0]?.type === "word" &&
    ["import", "export"].includes(node.children[0].value) &&
    node.position?.start.column !== 1
  );
}

export { printSentence };
