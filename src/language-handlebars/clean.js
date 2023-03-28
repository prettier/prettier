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

  // `class` is reformatted
  if (ast.type === "AttrNode" && ast.name.toLowerCase() === "class") {
    delete newNode.value;
  }
}

clean.ignoredProperties = new Set(["loc", "selfClosing"]);

export default clean;
