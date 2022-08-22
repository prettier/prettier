import { hardline } from "../document/builders.js";
import { printFrontMatter } from "../utils/index.js";

function embed(path) {
  const node = path.getValue();

  if (node.type === "front-matter") {
    return async (textToDoc) => {
      const doc = await printFrontMatter(node, textToDoc);
      return doc ? [doc, hardline] : undefined;
    };
  }
}

export default embed;
