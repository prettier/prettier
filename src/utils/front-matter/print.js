import { hardline, markAsRoot } from "../../document/builders.js";
import isFrontMatter from "./is-front-matter.js";

async function printEmbedFrontMatter(textToDoc, path /* , options*/) {
  const { node } = path;

  if (isFrontMatter(node)) {
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

export default printEmbedFrontMatter;
