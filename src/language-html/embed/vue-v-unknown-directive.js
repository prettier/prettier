
import {printAttributeValue} from "./utils.js"

/**
 * @param {*} options
 * @returns {Doc}
 */
function printVueVUnknownDirective(text, textToDoc, {parseWithTs}) {


  return printAttributeValue(text, { parser:  parseWithTs?  "__ts_expression"
            : "__js_expression", }, textToDoc)
}

export {printVueVUnknownDirective}
