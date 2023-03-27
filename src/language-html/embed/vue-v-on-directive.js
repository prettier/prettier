
import {
  isVueEventBindingExpression,
} from "./vue-bindings.js";
import {printAttributeValue} from "./utils.js"

/**
 * @param {*} options
 * @returns {Doc}
 */
function printVueVOnDirective(text, textToDoc, {parseWithTs}) {

      const parser = isVueEventBindingExpression(text)
        ? parseWithTs
          ? "__ts_expression"
          : "__js_expression"
        : parseWithTs
        ? "__vue_ts_event_binding"
        : "__vue_event_binding";

  return printAttributeValue(text, { parser }, textToDoc)
}

export {printVueVOnDirective}
