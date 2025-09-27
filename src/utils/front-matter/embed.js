import { hardline, markAsRoot } from "../../document/builders.js";
import isFrontMatter from "./is-front-matter.js";

const SUPPORTED_EMBED_LANGUAGES = new Set(["yaml", "toml"]);

const isEmbedFrontMatter = ({ node } /* , options */) =>
  isFrontMatter(node) && SUPPORTED_EMBED_LANGUAGES.has(node.language);

async function printEmbedFrontMatter(textToDoc, print, path /* , options*/) {
  const { node } = path;

  if (!SUPPORTED_EMBED_LANGUAGES.has(node.language)) {
    return;
  }

  const value = node.value.trim();

  // TODO[@fisker]: Use inferParser instead of using `toml` directly
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

export { isEmbedFrontMatter, printEmbedFrontMatter };
