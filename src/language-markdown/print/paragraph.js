import {
  DOC_TYPE_ARRAY,
  DOC_TYPE_FILL,
  fill,
  getDocType,
} from "../../document/index.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
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
  /*
   * We assume parts always meet following conditions:
   * - parts.length is odd
   * - odd elements are line-like doc that comes from odd element off inner fill
   */
  /** @type {Doc[]} */
  const parts = [""];

  (function rec(/** @type {*} */ docArray) {
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

      parts.push([parts.pop(), head], ...rest);
    }
  })(docs);

  return fill(parts);
}

export { printParagraph };
