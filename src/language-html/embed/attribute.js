import { group } from "../../document/builders.js";
import { mapDoc } from "../../document/utils.js";
import printAngularAttribute from "./angular-attributes.js";
import printClassNames from "./class-names.js";
import printSrcset from "./srcset.js";
import { printStyleAttribute } from "./style.js";
import printVueAttribute from "./vue-attributes.js";

/**
 * @typedef {import("../../document/builders.js").Doc} Doc
 * @typedef {import("../../common/ast-path.js")} AstPath
 */

function printAttribute(path, options) {
  const { node } = path;

  if (!node.value) {
    return;
  }

  if (
    // lit-html: html`<my-element obj=${obj}></my-element>`
    /^PRETTIER_HTML_PLACEHOLDER_\d+_\d+_IN_JS$/u.test(
      options.originalText.slice(
        node.valueSpan.start.offset,
        node.valueSpan.end.offset,
      ),
    ) || // lwc: html`<my-element data-for={value}></my-element>`
    (options.parser === "lwc" &&
      node.value.startsWith("{") &&
      node.value.endsWith("}"))
  ) {
    return [node.rawName, "=", node.value];
  }

  for (const getValuePrinter of [
    printSrcset,
    printStyleAttribute,
    printClassNames,
    printVueAttribute,
    printAngularAttribute,
  ]) {
    const printValue = getValuePrinter(path, options);
    if (printValue) {
      return printAttributeWithValuePrinter(printValue);
    }
  }
}

/**
 * @param {(textToDoc, print, path, options) => Promise<Doc>} printValue
 * @returns {(textToDoc, print, path, options) => Promise<Doc>}
 */
function printAttributeWithValuePrinter(printValue) {
  return async (textToDoc, print, path, options) => {
    let valueDoc = await printValue(textToDoc, print, path, options);

    if (!valueDoc) {
      return;
    }

    valueDoc = mapDoc(valueDoc, (doc) =>
      typeof doc === "string" ? doc.replaceAll('"', "&quot;") : doc,
    );

    return [path.node.rawName, '="', group(valueDoc), '"'];
  };
}

export default printAttribute;
