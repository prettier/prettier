import { printExpand } from "./utils.js";

async function printStyleAttribute(value, attributeTextToDoc) {
  return printExpand(
    await attributeTextToDoc(value, {
      parser: "css",
      __isHTMLStyleAttribute: true,
    })
  );
}

export { printStyleAttribute };
