import { hardline } from "../document/builders.js";
import {
  isEmbedFrontMatter,
  printEmbedFrontMatter,
} from "../utils/front-matter/index.js";

function embed(path) {
  const { node } = path;

  if (isEmbedFrontMatter(node)) {
    return async (textToDoc) => {
      const doc = await printEmbedFrontMatter(node, textToDoc);
      return doc ? [doc, hardline] : undefined;
    };
  }
}

// `front-matter` only available on `css-root`
embed.getVisitorKeys = (node) =>
  node.type === "css-root" ? ["frontMatter"] : [];

export default embed;
