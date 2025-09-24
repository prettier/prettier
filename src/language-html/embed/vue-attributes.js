import {
  getUnescapedAttributeValue,
  isVueScriptTag,
  isVueSfcBindingsAttribute,
  isVueSlotAttribute,
} from "../utils/index.js";
import isVueSfcWithTypescriptScript from "../utils/is-vue-sfc-with-typescript-script.js";
import { printVueScriptGenericAttributeValue } from "./print-vue-script-generic-attribute-value.js";
import { formatAttributeValue, shouldHugJsExpression } from "./utils.js";
import { printVueBindings } from "./vue-bindings.js";
import { printVueVForDirective } from "./vue-v-for-directive.js";

/**
 * @import {Doc} from "../../document/builders.js"
 * @import AstPath from "../../common/ast-path.js"
 */

function printVueAttribute(path, options) {
  if (options.parser !== "vue") {
    return;
  }
  const { node } = path;
  const attributeName = node.fullName;

  if (attributeName === "v-for") {
    return printVueVForDirective;
  }

  if (attributeName === "generic" && isVueScriptTag(node.parent, options)) {
    return printVueScriptGenericAttributeValue;
  }

  if (isVueSlotAttribute(node) || isVueSfcBindingsAttribute(node, options)) {
    return printVueBindings;
  }

  /**
   *     @click="jsStatement"
   *     @click="jsExpression"
   *     v-on:click="jsStatement"
   *     v-on:click="jsExpression"
   */
  if (attributeName.startsWith("@") || attributeName.startsWith("v-on:")) {
    return printVueVOnDirective;
  }

  /**
   *     :property="vueExpression"
   *     .property="vueExpression"
   *     v-bind:property="vueExpression"
   */
  if (
    attributeName.startsWith(":") ||
    attributeName.startsWith(".") ||
    attributeName.startsWith("v-bind:")
  ) {
    return printVueVBindDirective;
  }

  /**
   *     v-if="jsExpression"
   */
  if (attributeName.startsWith("v-")) {
    return printExpression;
  }
}

/**
 * @returns {Promise<Doc>}
 */
async function printVueVOnDirective(textToDoc, print, path, options) {
  try {
    return await printExpression(textToDoc, print, path, options);
  } catch (error) {
    // @ts-expect-error -- expected
    if (error.cause?.code !== "BABEL_PARSER_SYNTAX_ERROR") {
      throw error;
    }
  }

  const text = getUnescapedAttributeValue(path.node);
  const parser = isVueSfcWithTypescriptScript(path, options)
    ? "__vue_ts_event_binding"
    : "__vue_event_binding";

  return formatAttributeValue(
    text,
    textToDoc,
    { parser },
    shouldHugJsExpression,
  );
}

/**
 * @returns {Promise<Doc>}
 */
function printVueVBindDirective(textToDoc, print, path, options) {
  const text = getUnescapedAttributeValue(path.node);
  const parser = isVueSfcWithTypescriptScript(path, options)
    ? "__vue_ts_expression"
    : "__vue_expression";

  return formatAttributeValue(
    text,
    textToDoc,
    { parser },
    shouldHugJsExpression,
  );
}

/**
 * @returns {Promise<Doc>}
 */
function printExpression(textToDoc, print, path, options) {
  const text = getUnescapedAttributeValue(path.node);
  const parser = isVueSfcWithTypescriptScript(path, options)
    ? "__ts_expression"
    : "__js_expression";

  return formatAttributeValue(
    text,
    textToDoc,
    { parser },
    shouldHugJsExpression,
  );
}

export default printVueAttribute;
