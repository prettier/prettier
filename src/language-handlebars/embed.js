import { dedent, hardline, softline } from "../document/builders.js";
import inferParser from "../utils/infer-parser.js";

function embed(path, options) {
  const { node } = path;

  if (node.type === "TextNode" && path.parent.tag === "style") {
    const parser = getCssParser(path, options);
    if (!parser) {
      return "";
    }

    return async (textToDoc) => {
      const doc = await textToDoc(node.chars.trim(), { parser });
      if (!doc) {
        return [];
      }
      return [hardline, doc, dedent(softline)];
    };
  }

  return null;
}

function getCssParser(path, options) {
  if (path.parent.tag !== "style") {
    return;
  }

  return inferParser(options, { language: "css" });
}

export default embed;
