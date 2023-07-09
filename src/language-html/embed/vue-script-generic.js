import { getUnescapedAttributeValue } from "../utils/index.js";
import { formatAttributeValue } from "./utils.js";

/**
 * @typedef {import("../../document/builders.js").Doc} Doc
 */

/**
 * @returns {Promise<Doc>}
 */
function printVueScriptGeneric(textToDoc, print, path) {
  const { node } = path;

  const value = getUnescapedAttributeValue(node);

  return formatAttributeValue(`type T<${value}> = any`, textToDoc, {
    parser: "babel-ts",
    __isVueScriptGeneric: true,
  });
}

export { printVueScriptGeneric };
