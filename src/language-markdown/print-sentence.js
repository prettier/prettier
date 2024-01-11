/**
 * @typedef {import("../common/ast-path.js").default} AstPath
 * @typedef {import("../document/builders.js").Doc} Doc
 */

import { DOC_TYPE_STRING } from "../document/constants.js";
import { getDocType } from "../document/utils.js";
import { fillBuilder } from "../document/utils/fill-builder.js";

/**
 * @param {AstPath} path
 * @param {*} print
 * @returns {Doc}
 */
function printSentence(path, print) {
  const builder = fillBuilder();

  path.each(() => {
    const { node } = path;
    const doc = print();
    switch (node.type) {
      case "whitespace":
        if (getDocType(doc) !== DOC_TYPE_STRING) {
          builder.appendLine(doc);
          break;
        }
      // fallthrough
      case "word":
        builder.append(doc);
        break;
      default:
        throw new Error(`Unexpected node type: ${node.type}`);
    }
  }, "children");

  return builder.build();
}

export { printSentence };
