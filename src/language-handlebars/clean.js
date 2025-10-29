import htmlWhitespaceUtils from "../utils/html-whitespace-utils.js";

function clean(original, cloned, parent) {
  // (Glimmer/HTML) ignore TextNode
  if (original.type === "TextNode") {
    const trimmed = original.chars.trim();
    if (!trimmed) {
      return null;
    }

    // CSS will be formatted
    if (
      parent.tag === "style" &&
      parent.children.length === 1 &&
      parent.children[0] === original
    ) {
      cloned.chars = "";
    } else {
      cloned.chars = htmlWhitespaceUtils.split(trimmed).join(" ");
    }
  }

  if (original.type === "ElementNode") {
    delete cloned.startTag;
    delete cloned.openTag;
    delete cloned.parts;
    delete cloned.endTag;
    delete cloned.closeTag;
    delete cloned.nameNode;
    delete cloned.body;
    delete cloned.blockParamNodes;
    delete cloned.params;
    delete cloned.path;
  }

  if (original.type === "Block") {
    delete cloned.blockParamNodes;
    delete cloned.params;
  }

  // `class` is reformatted
  if (original.type === "AttrNode" && original.name.toLowerCase() === "class") {
    delete cloned.value;
  }

  if (original.type === "PathExpression") {
    cloned.head = original.head.original;
  }
}

clean.ignoredProperties = new Set(["loc", "selfClosing"]);

export default clean;
