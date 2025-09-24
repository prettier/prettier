import { hardline } from "../document/builders.js";
import {
  isFrontMatter,
  printFrontMatter,
} from "../utils/front-matter/index.js";

function embed(path) {
  const { node } = path;

  if (isFrontMatter(node) && node.language === "yaml") {
    return async (textToDoc) => {
      const doc = await printFrontMatter(node, textToDoc);
      return doc ? [doc, hardline] : undefined;
    };
  }
}

// `front-matter` only available on `css-root`
embed.getVisitorKeys = (node) =>
  node.type === "css-root" ? ["frontMatter"] : [];

export default embed;
