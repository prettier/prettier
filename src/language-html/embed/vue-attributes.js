import {
  isVueSlotAttribute,
  isVueSfcBindingsAttribute,
  getUnescapedAttributeValue,
} from "../utils/index.js";
import isVueSfcWithTypescriptScript from "../utils/is-vue-sfc-with-typescript-script.js";
import { printVueVForDirective } from "./vue-v-for-directive.js";
import { formatJsAttribute } from "./utils.js";
import {
  printVueBindings,
  isVueEventBindingExpression,
} from "./vue-bindings.js";

function printVueAttribute(path, options) {
  if (options.parser !== "vue") {
    return;
  }
  const { node } = path;
  const attributeName = node.fullName;

  if (attributeName === "v-for") {
    return printVueVForDirective;
  }

  const value = getUnescapedAttributeValue(node);
  const parseWithTs = isVueSfcWithTypescriptScript(path, options);

  if (isVueSlotAttribute(node) || isVueSfcBindingsAttribute(node, options)) {
    return (textToDoc) => printVueBindings(value, textToDoc, { parseWithTs });
  }

  /**
   *     @click="jsStatement"
   *     @click="jsExpression"
   *     v-on:click="jsStatement"
   *     v-on:click="jsExpression"
   */
  if (attributeName.startsWith("@") || attributeName.startsWith("v-on:")) {
    return (textToDoc) =>
      printVueVOnDirective(value, textToDoc, { parseWithTs });
  }

  /**
   *     :class="vueExpression"
   *     v-bind:id="vueExpression"
   */
  if (attributeName.startsWith(":") || attributeName.startsWith("v-bind:")) {
    return (textToDoc) =>
      printVueVBindDirective(value, textToDoc, { parseWithTs });
  }

  /**
   *     v-if="jsExpression"
   */
  if (attributeName.startsWith("v-")) {
    return (textToDoc) => printExpression(value, textToDoc, { parseWithTs });
  }
}

/**
 * @param {*} options
 * @returns {Doc}
 */
function printVueVOnDirective(text, textToDoc, { parseWithTs }) {
  const parser = isVueEventBindingExpression(text)
    ? parseWithTs
      ? "__ts_expression"
      : "__js_expression"
    : parseWithTs
    ? "__vue_ts_event_binding"
    : "__vue_event_binding";

  return formatJsAttribute(text, { parser }, textToDoc);
}

/**
 * @param {*} options
 * @returns {Doc}
 */
function printVueVBindDirective(text, textToDoc, { parseWithTs }) {
  return formatJsAttribute(
    text,
    { parser: parseWithTs ? "__vue_ts_expression" : "__vue_expression" },
    textToDoc
  );
}

/**
 * @param {*} options
 * @returns {Doc}
 */
function printExpression(text, textToDoc, { parseWithTs }) {
  return formatJsAttribute(
    text,
    { parser: parseWithTs ? "__ts_expression" : "__js_expression" },
    textToDoc
  );
}

export default printVueAttribute;
