import { isPlainTextStyleOrScriptElement } from "./utilities.js";

function getAttribute(node, name) {
  return node.attributes.find(
    (attribute) => attribute.type === "AttrNode" && attribute.name === name,
  );
}

function getTextValue(attribute) {
  return attribute.value.type === "TextNode"
    ? attribute.value.chars
    : undefined;
}

function getScriptTextToDocOptions(node) {
  if (getAttribute(node, "src")) {
    return;
  }

  const typeAttribute = getAttribute(node, "type");
  const type = typeAttribute ? getTextValue(typeAttribute) : undefined;

  if (!typeAttribute || type === "module" || type === "text/javascript") {
    return {
      parser: "babel",
      __embeddedInHtml: true,
      __babelSourceType: type === "module" ? "module" : "script",
    };
  }
}

function getStyleTextToDocOptions(node) {
  const langAttribute = getAttribute(node, "lang");
  if (!langAttribute || getTextValue(langAttribute) === "css") {
    return { parser: "css", __embeddedInHtml: true };
  }
}

function embed(path /* , options*/) {
  const { node } = path;

  if (node.type !== "TextNode") {
    return;
  }

  const { parent } = path;

  if (!(
    isPlainTextStyleOrScriptElement(parent) && parent.children[0] === node
  )) {
    return;
  }

  const textToDocOptions =
    parent.tag === "style"
      ? getStyleTextToDocOptions(parent)
      : getScriptTextToDocOptions(parent);

  if (!textToDocOptions) {
    return;
  }

  const content = node.chars;
  return async (textToDoc) => {
    if (!content.trim()) {
      return "";
    }
    return await textToDoc(content, textToDocOptions);
  };
}

export default embed;
