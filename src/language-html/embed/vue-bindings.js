import { getUnescapedAttributeValue } from "../utils/index.js";
import isVueSfcWithTypescriptScript from "../utils/is-vue-sfc-with-typescript-script.js";
import { formatAttributeValue } from "./utils.js";

/**
 * @import {Doc} from "../../document/builders.js"
 */

/**
 * @returns {Promise<Doc>}
 */
function printVueBindings(textToDoc, print, path, options) {
  const text = getUnescapedAttributeValue(path.node);
  const parser = isVueSfcWithTypescriptScript(path, options)
    ? "babel-ts"
    : "babel";
  return formatAttributeValue(`function _(${text}) {}`, textToDoc, {
    parser,
    __isVueBindings: true,
  });
}

export { printVueBindings };
