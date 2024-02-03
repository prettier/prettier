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

  // `class` is reformatted
  if (original.type === "AttrNode" && original.name.toLowerCase() === "class") {
    delete clone.value;
  }
}

clean.ignoredProperties = new Set(["loc", "selfClosing"]);

export default clean;
