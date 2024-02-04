import htmlWhitespaceUtils from "../utils/html-whitespace-utils.js";

function clean(original, cloned /*, parent*/) {
  // (Glimmer/HTML) ignore TextNode
  if (original.type === "TextNode") {
    const trimmed = original.chars.trim();
    if (!trimmed) {
      return null;
    }
    cloned.chars = htmlWhitespaceUtils.split(trimmed).join(" ");
  }

  if (original.type === "ElementNode") {
    delete cloned.startTag;
    delete cloned.parts;
    delete cloned.endTag;
    delete cloned.nameNode;
  }

  if (original.type === "Block" || original.type === "ElementNode") {
    delete cloned.blockParamNodes;
  }

  // `class` is reformatted
  if (original.type === "AttrNode" && original.name.toLowerCase() === "class") {
    delete cloned.value;
  }
}

clean.ignoredProperties = new Set(["loc", "selfClosing"]);

export default clean;
