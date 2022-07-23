import { hardline } from "../document/builders.js";
import printFrontMatter from "../utils/front-matter/print.js";

async function embed(path, print, textToDoc /*, options */) {
  const node = path.getValue();

  if (node.type === "front-matter") {
    const doc = await printFrontMatter(node, textToDoc);
    return doc ? [doc, hardline] : "";
  }
}

export default embed;
