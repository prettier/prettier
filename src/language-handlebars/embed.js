import { dedent, hardline, softline } from "../document/builders.js";

function embed(path /*, options*/) {
  const { node } = path;

  if (node.type !== "TextNode" || path.parent.tag !== "style") {
    return;
  }

  return async (textToDoc) => {
    const doc = await textToDoc(node.chars, { parser: "css" });
    if (!doc) {
      return [];
    }
    return [hardline, doc, dedent(softline)];
  };
}

export default embed;
