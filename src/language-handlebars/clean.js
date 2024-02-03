import htmlWhitespaceUtils from "../utils/html-whitespace-utils.js";

function clean(original, clone /*, parent*/) {
  // (Glimmer/HTML) ignore TextNode
  if (original.type === "TextNode") {
    const trimmed = original.chars.trim();
    if (!trimmed) {
      return null;
    }
    clone.chars = htmlWhitespaceUtils.split(trimmed).join(" ");
  }

  if (original.type === "ElementNode") {
    delete clone.startTag;
    delete clone.parts;
    delete clone.endTag;
    delete clone.nameNode;
  }

  if (original.type === "Block" || original.type === "ElementNode") {
    delete clone.blockParamNodes;
  }

  // `class` is reformatted
  if (original.type === "AttrNode" && original.name.toLowerCase() === "class") {
    delete clone.value;
  }
}

clean.ignoredProperties = new Set(["loc", "selfClosing"]);

export default clean;
