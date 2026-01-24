import { locEnd, locStart } from "../loc.js";

function printIgnored(path, options /* , print*/) {
  const { node } = path;
  let text = options.originalText.slice(locStart(node), locEnd(node));

  if (
    options.semi &&
    (node.type === "BreakStatement" ||
      node.type === "ContinueStatement" ||
      node.type === "VariableDeclaration")
  ) {
    text += ";";
  }

  return text;
}

export { printIgnored };
