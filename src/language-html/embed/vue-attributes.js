import {
  getUnescapedAttributeValue,
  isVueScriptTag,
  isVueSfcBindingsAttribute,
  isVueSlotAttribute,
} from "../utilities/index.js";
import isVueSfcWithTypescriptScript from "../utilities/is-vue-sfc-with-typescript-script.js";
import { printVueScriptGenericAttributeValue } from "./print-vue-script-generic-attribute-value.js";
import { formatAttributeValue, shouldHugJsExpression } from "./utilities.js";
import { printVueBindings } from "./vue-bindings.js";
import { printVueVForDirective } from "./vue-v-for-directive.js";

/**
@import {Doc} from "../../document/index.js"
@import AstPath from "../../common/ast-path.js"
@import {AttributeValuePrinter} from "./attribute.js"
*/

/** @type {AttributeValuePrinter[]} */
const printers = /** @type {AttributeValuePrinter[]} */ ([
  {
    test: (path) => path.node.fullName === "v-for",
    print: printVueVForDirective,
  },
  {
    test: (path, options) =>
      path.node.fullName === "generic" && isVueScriptTag(path.parent, options),
    print: printVueScriptGenericAttributeValue,
  },
  {
    test: ({ node }, options) =>
      isVueSlotAttribute(node) || isVueSfcBindingsAttribute(node, options),
    print: printVueBindings,
  },
  {
    /*
    - `@click="jsStatement"`
    - `@click="jsExpression"`
    - `v-on:click="jsStatement"`
    - `v-on:click="jsExpression"`
    */
    test(path /* , options */) {
      const name = path.node.fullName;
      return name.startsWith("@") || name.startsWith("v-on:");
    },
    print: printVueVOnDirective,
  },
  {
    /*
    - `:property="vueExpression"`
    - `.property="vueExpression"`
    - `v-bind:property="vueExpression"`
    */
    test(path /* , options */) {
      const name = path.node.fullName;
      return (
        name.startsWith(":") ||
        name.startsWith(".") ||
        name.startsWith("v-bind:")
      );
    },
    print: printVueVBindDirective,
  },
  {
    /*
    - `v-if="jsExpression"`
    */
    test: (path /* , options */) => path.node.fullName.startsWith("v-"),
    print: printExpression,
  },
]).map(({ test, print }) => ({
  test: (path, options) => options.parser === "vue" && test(path, options),
  print,
}));

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

export default printers;
