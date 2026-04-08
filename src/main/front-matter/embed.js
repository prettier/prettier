import { hardline, markAsRoot } from "../../document/index.js";
import inferParser from "../../utilities/infer-parser.js";
import isFrontMatter from "./is-front-matter.js";

const SUPPORTED_EMBED_LANGUAGES = new Set(["yaml", "toml"]);

const isEmbedFrontMatter = ({ node } /* , options */) =>
  isFrontMatter(node) && SUPPORTED_EMBED_LANGUAGES.has(node.language);

async function printEmbedFrontMatter(textToDoc, print, path, options) {
  const { node } = path;
  const { language } = node;

  if (!SUPPORTED_EMBED_LANGUAGES.has(language)) {
    return;
  }

  const value = node.value.trim();

  let doc;
  if (value) {
    const parser =
      language === "yaml" ? language : inferParser(options, { language });
    if (!parser) {
      return;
    }

    doc = value ? await textToDoc(value, { parser }) : "";
  } else {
    doc = value;
  }

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
