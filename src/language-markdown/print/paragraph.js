import {
  DOC_TYPE_ARRAY,
  DOC_TYPE_FILL,
  DOC_TYPE_STRING,
  fill,
  getDocType,
  hardline,
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
  if (isGfmAlertBlockquoteHeader(path, options)) {
    return printGfmAlertBlockquoteHeader(path, print);
  }

  const parts = path.map(print, "children");
  return flattenFill(parts);
}

const gfmAlertMarkerRegex = /^\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]$/iu;

function isGfmAlertBlockquoteHeader(path, options) {
  if (options.proseWrap !== "always") {
    return false;
  }

  const { node, parent, index } = path;
  if (parent?.type !== "blockquote" || index !== 0) {
    return false;
  }

  const firstChild = node.children[0];
  if (firstChild?.type !== "sentence") {
    return false;
  }

  const [marker, whitespace] = firstChild.children;
  return (
    marker?.type === "word" &&
    gfmAlertMarkerRegex.test(marker.value) &&
    whitespace?.type === "whitespace" &&
    whitespace.value === "\n" &&
    (firstChild.children.length > 2 || node.children.length > 1)
  );
}

/**
 * @param {AstPath} path
 * @param {*} print
 * @returns {Doc}
 */
function printGfmAlertBlockquoteHeader(path, print) {
  const [firstChild] = path.node.children;
  const [marker] = firstChild.children;
  const parts = [];

  path.each(() => {
    const { index } = path;
    parts.push(
      index === 0 ? printSentenceWithoutGfmAlertHeader(path, print) : print(),
    );
  }, "children");

  return [marker.value, hardline, flattenFill(parts)];
}

/**
 * @param {AstPath} path
 * @param {*} print
 * @returns {Doc}
 */
function printSentenceWithoutGfmAlertHeader(path, print) {
  /** @type {Doc[]} */
  const parts = [""];

  path.each(() => {
    if (path.index < 2) {
      return;
    }

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
