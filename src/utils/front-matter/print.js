import { hardline, markAsRoot } from "../../document/builders.js";

async function print(node, textToDoc) {
  if (node.lang === "yaml") {
    const value = node.value.trim();
    const doc = value ? await textToDoc(value, { parser: "yaml" }) : "";
    return markAsRoot([
      node.startDelimiter,
      hardline,
      doc,
      doc ? hardline : "",
      node.endDelimiter,
    ]);
  }
}

export default print;
