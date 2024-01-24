import { fill } from "../document/builders.js";
import { DOC_TYPE_ARRAY, DOC_TYPE_FILL } from "../document/constants.js";
import { getDocParts, getDocType } from "../document/utils.js";

/**
 * @typedef {import("../common/ast-path.js").default} AstPath
 * @typedef {import("../document/builders.js").Doc} Doc
 */

/**
 * @param {AstPath} path
 * @param {*} options
 * @param {*} print
 * @returns {Doc}
 */
function printParagraph(path, options, print) {
  const parts = path.map(print, "children");
  return flattenFill(parts);
}

/**
 * @param {Doc[]} docs
 * @returns {Doc}
 */
function flattenFill(docs) {
  /** @type {Doc[][]} */
  const parts = [[]];

  /**
   * @param {Doc[]} docArray
   */
  (function rec(docArray) {
    for (const doc of docArray) {
      switch (getDocType(doc)) {
        case DOC_TYPE_FILL: {
          const [head, ...rest] = getDocParts(doc);
          parts.at(-1).push(head);
          parts.push(...rest.map((doc) => [doc]));
          if (rest.length % 2 === 1) {
            parts.push([]);
          }
          break;
        }
        case DOC_TYPE_ARRAY:
          rec(getDocParts(doc));
          break;
        default:
          parts.at(-1).push(doc);
          break;
      }
    }
  })(docs);

  return fill(parts);
}

export { printParagraph };
