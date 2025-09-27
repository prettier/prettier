import { hardline } from "../document/builders.js";
import {
  isEmbedFrontMatter,
  printEmbedFrontMatter,
} from "../utils/front-matter/index.js";

const printers = [
  {
    test: isEmbedFrontMatter,
    async print(...args) {
      const doc = await printEmbedFrontMatter(...args);
      return doc ? [doc, hardline] : undefined;
    },
  },
];

function embed(path) {
  return printers.find(({ test }) => test(path))?.print;
}

// `front-matter` only available on `css-root`
embed.getVisitorKeys = (node) =>
  node.type === "css-root" ? ["frontMatter"] : [];

export default embed;
