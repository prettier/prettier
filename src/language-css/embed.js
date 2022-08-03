import { hardline } from "../document/builders.js";
import printFrontMatter from "../utils/front-matter/print.js";

function embed(path /*, options */) {
  const node = path.getValue();

  if (node.type === "front-matter") {
    return async (textToDoc) => {
      const doc = await printFrontMatter(node, textToDoc);
      return doc ? [doc, hardline] : "";
    };
  }
}

export default embed;
