import { getUnescapedAttributeValue } from "../utils/index.js";
import { printExpand, printAttributeDoc } from "./utils.js";

async function printStyleAttribute(textToDoc, print, path /*, options*/) {
  const value = getUnescapedAttributeValue(path.node);

  return printAttributeDoc(
    path,
    printExpand(
      await textToDoc(value, {
        parser: "css",
        __isHTMLStyleAttribute: true,
      })
    )
  );
}

export { printStyleAttribute };
