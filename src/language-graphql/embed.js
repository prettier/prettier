import { hardline, mapDoc } from "../document/index.js";

function embed({ node, parent }) {
  if (
    node.kind !== "StringValue" ||
    !node.block ||
    parent?.description !== node ||
    !node.value.trim()
  ) {
    return;
  }

  return async (textToDoc) => {
    const doc = await textToDoc(node.value, { parser: "markdown" });
    return [
      '"""',
      hardline,
      mapDoc(doc, (part) =>
        typeof part === "string"
          ? part.replaceAll('"""', String.raw`\"""`)
          : part,
      ),
      hardline,
      '"""',
    ];
  };
}

export default embed;
