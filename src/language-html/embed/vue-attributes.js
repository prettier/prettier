import { getUnescapedAttributeValue } from "../utils/index.js";
import { printVueVForDirective } from "./vue-v-for-directive.js";
import { printAttribute } from "./utils.js";

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
}

export default printVueAttribute;
