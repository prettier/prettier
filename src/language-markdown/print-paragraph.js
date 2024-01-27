import { fill } from "../document/builders.js";
import { normalizeDoc } from "../document/utils.js";

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
  return normalizeDoc(fill(parts));
}

export { printParagraph };
