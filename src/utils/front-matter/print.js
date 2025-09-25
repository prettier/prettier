import { hardline, markAsRoot } from "../../document/builders.js";
import { isEmbedFrontMatter } from "./is-front-matter.js";

async function print(node, textToDoc) {
  if (isEmbedFrontMatter(node)) {
    const value = node.value.trim();
    const doc = value ? await textToDoc(value, { parser: node.language }) : "";
    return markAsRoot([
      node.startDelimiter,
      node.explicitLanguage ?? "",
      hardline,
      doc,
      doc ? hardline : "",
      node.endDelimiter,
    ]);
  }
}

export default print;
