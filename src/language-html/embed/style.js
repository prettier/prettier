import { printExpand,  } from "./utils.js";

async function printStyleAttribute(value, textToDoc) {
  return printExpand(await textToDoc(value, {parser: "css",
        __isHTMLStyleAttribute: true,
      })
    )
}

export { printStyleAttribute };
