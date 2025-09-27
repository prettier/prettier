import { hardline, markAsRoot } from "../../document/builders.js";

async function printEmbedFrontMatter(textToDoc, print, path /* , options*/) {
  const { node } = path;

  if (node.language === "yaml" || node.language === "toml") {
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
