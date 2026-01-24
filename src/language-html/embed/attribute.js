import { group, mapDoc } from "../../document/index.js";
import { shouldUnquoteAttributeValue } from "../utilities/index.js";
import angularAttributePrinters from "./angular-attributes.js";
import { isClassNames, printClassNames } from "./class-names.js";
import { isEventHandler, printEventHandler } from "./event-handler.js";
import {
  isPermissionsPolicy,
  printPermissionsPolicy,
} from "./permissions-policy.js";
import { isSrcset, printSrcset } from "./srcset.js";
import { isStyle, printStyle } from "./style.js";
import vueAttributePrinters from "./vue-attributes.js";

/**
@import {Doc} from "../../document/index.js"
@import AstPath from "../../common/ast-path.js"

@typedef {(path, options) => boolean} AttributeValuePredicate
@typedef {(textToDoc, print, path, options) => Promise<Doc>} AsyncAttributeValuePrint
@typedef {(textToDoc, print, path, options) => Doc} SyncAttributeValuePrint
@typedef {AsyncAttributeValuePrint | SyncAttributeValuePrint} AttributeValuePrint
@typedef {{test: AttributeValuePredicate, print: AttributeValuePrint}} AttributeValuePrinter
*/

/** @type {AttributeValuePrinter[]} */
const printers = [
  { test: isSrcset, print: printSrcset },
  { test: isStyle, print: printStyle },
  { test: isEventHandler, print: printEventHandler },
  { test: isClassNames, print: printClassNames },
  { test: isPermissionsPolicy, print: printPermissionsPolicy },
  ...vueAttributePrinters,
  ...angularAttributePrinters,
].map(({ test, print }) => ({
  test,
  print: createAttributePrinter(print),
}));

function printAttribute(path, options) {
  const { node } = path;
  const { value } = node;

  if (!value) {
    return;
  }

  if (shouldUnquoteAttributeValue(node, options)) {
    return [node.rawName, "=", value];
  }

  return printers.find(({ test }) => test(path, options))?.print;
}

/**
@param {AttributeValuePrint} printValue
@returns {AsyncAttributeValuePrint}
*/
function createAttributePrinter(printValue) {
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
