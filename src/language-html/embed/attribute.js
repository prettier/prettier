import { group, indent, fill, softline } from "../../document/builders.js";
import { mapDoc } from "../../document/utils.js";
import { getUnescapedAttributeValue } from "../utils/index.js";
import isVueSfcWithTypescriptScript from "../utils/is-vue-sfc-with-typescript-script.js";
import printSrcset from "./srcset.js";
import printClassNames from "./class-names.js";
import { printStyleAttribute } from "./style.js";
import { printAttributeValue } from "./utils.js";
import printVueAttribute from "./vue-attributes.js";
import printAngularAttribute from "./angular-attributes.js";

function printAttribute(path, options) {
  const { node } = path;

  if (!node.value) {
    return;
  }

  if (
    // lit-html: html`<my-element obj=${obj}></my-element>`
    /^PRETTIER_HTML_PLACEHOLDER_\d+_\d+_IN_JS$/.test(
      options.originalText.slice(
        node.valueSpan.start.offset,
        node.valueSpan.end.offset
      )
    ) || // lwc: html`<my-element data-for={value}></my-element>`
    (options.parser === "lwc" &&
      node.value.startsWith("{") &&
      node.value.endsWith("}"))
  ) {
    return [node.rawName, "=", node.value];
  }

  for (const printValue of [
    printSrcset,
    printStyleAttribute,
    printClassNames,
    printVueAttribute,
    printAngularAttribute,
  ]) {
    const valuePrinter = printValue(path, options);
    if (valuePrinter) {
      return valuePrinter;
    }
  }
}

export default printAttribute;
