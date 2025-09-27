import { hardline } from "../document/builders.js";
import {
  isFrontMatter,
  printEmbedFrontMatter,
} from "../utils/front-matter/index.js";

function embed(path) {
  const { node } = path;

  if (isFrontMatter(node)) {
    return async (textToDoc, print) => {
      const doc = await printEmbedFrontMatter(textToDoc, print, path);
      return doc ? [doc, hardline] : undefined;
    };
  }
}

// `front-matter` only available on `css-root`
embed.getVisitorKeys = (node) =>
  node.type === "css-root" ? ["frontMatter"] : [];

export default embed;
