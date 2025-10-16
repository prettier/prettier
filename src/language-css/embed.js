import {
  isEmbedFrontMatter,
  printEmbedFrontMatter,
} from "../utils/front-matter/index.js";

function embed(path) {
  if (isEmbedFrontMatter(path)) {
    return printEmbedFrontMatter;
  }
}

// `front-matter` only available on `css-root`
embed.getVisitorKeys = (node) =>
  node.type === "css-root" ? ["frontMatter"] : [];

export default embed;
