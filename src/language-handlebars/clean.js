import htmlWhitespaceUtils from "../utils/html-whitespace-utils.js";

function clean(ast, newNode /*, parent*/) {
  // (Glimmer/HTML) ignore TextNode
  if (ast.type === "TextNode") {
    const trimmed = ast.chars.trim();
    if (!trimmed) {
      return null;
    }
    newNode.chars = htmlWhitespaceUtils.split(trimmed).join(" ");
  }

  if (ast.type === "ElementNode") {
    delete newNode.startTag;
    delete newNode.parts;
    delete newNode.endTag;
    delete newNode.nameNode;
  }

  if (ast.type === "Block" || ast.type === "ElementNode") {
    delete newNode.blockParamNodes;
  }

  // `class` is reformatted
  if (ast.type === "AttrNode" && ast.name.toLowerCase() === "class") {
    delete newNode.value;
  }
}

clean.ignoredProperties = new Set(["loc", "selfClosing"]);

export default clean;
