import {
  isVueSlotAttribute,
  isVueSfcBindingsAttribute,
  getUnescapedAttributeValue,
} from "../utils/index.js";
import isVueSfcWithTypescriptScript from "../utils/is-vue-sfc-with-typescript-script.js";
import { printVueVForDirective } from "./vue-v-for-directive.js";
import { printAttribute } from "./utils.js";
import { printVueBindings } from "./vue-bindings.js";

function printVueAttribute(path, options) {
  if (options.parser !== "vue") {
    return;
  }
  const { node } = path;
  const attributeName = node.fullName;

  if (attributeName === "v-for") {
    return async (...args) =>
      printAttribute(path, await printVueVForDirective(...args));
  }

  const value = getUnescapedAttributeValue(node);
  const parseWithTs = isVueSfcWithTypescriptScript(path, options);

  if (isVueSlotAttribute(node) || isVueSfcBindingsAttribute(node, options)) {
    return async (textToDoc) =>
      printAttribute(
        path,
        await printVueBindings(value, textToDoc, { parseWithTs })
      );
  }
}

export default printVueAttribute;
