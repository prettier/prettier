import { hardline } from "../document/index.js";

const markdownCodeBlock = /^ {0,3}(?:`{3,}|~{3,})/m;

function embed(path) {
  const { node, parent } = path;

  if (
    node.kind !== "StringValue" ||
    !node.block ||
    !node.value ||
    !markdownCodeBlock.test(node.value) ||
    node.value.includes('"""') ||
    parent.description !== node
  ) {
    return;
  }

  return async (textToDoc) => [
    '"""',
    hardline,
    await textToDoc(node.value, { parser: "markdown" }),
    hardline,
    '"""',
  ];
}

export default embed;
