import { printAttributeValue } from "./utils.js";

/**
 * @param {*} options
 * @returns {Doc}
 */
function printVueVBindDirective(text, textToDoc, { parseWithTs }) {
  return printAttributeValue(
    text,
    { parser: parseWithTs ? "__vue_ts_expression" : "__vue_expression" },
    textToDoc
  );
}

export { printVueVBindDirective };
