import { fill } from "../document/builders.js";
import { DOC_TYPE_ARRAY, DOC_TYPE_FILL } from "../document/constants.js";
import { getDocType } from "../document/utils.js";

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
      const docType = getDocType(doc);
      if (docType === DOC_TYPE_ARRAY) {
        rec(doc);
        continue;
      }

      let head = doc;
      let rest = [];
      if (docType === DOC_TYPE_FILL) {
        [head, ...rest] = doc.parts;
      }

      parts[parts.length - 1] = [parts.at(-1), head];
      parts.push(...rest);
    }
  })(docs);

  return fill(parts);
}

export { printParagraph };
