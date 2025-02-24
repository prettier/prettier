import { formatAttributeValue } from "./utils.js";

/**
 * @import {Doc} from "../../document/builders.js"
 */

/**
 * @returns {Promise<Doc>}
 */
function printVueBindings(text, textToDoc, { parseWithTs }) {
  return formatAttributeValue(`function _(${text}) {}`, textToDoc, {
    parser: parseWithTs ? "babel-ts" : "babel",
    __isVueBindings: true,
  });
}

export { printVueBindings };
