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

function inferScriptParser(node) {
  if (getAttribute(node, "src")) {
    return;
  }

  const typeAttribute = getAttribute(node, "type");
  if (!typeAttribute) {
    return "babel";
  }

  switch (getTextValue(typeAttribute)) {
    case "module":
    case "text/javascript":
      return "babel";
  }
}

function inferStyleParser(node) {
  const langAttribute = getAttribute(node, "lang");
  if (!langAttribute || getTextValue(langAttribute) === "css") {
    return "css";
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

  const parser =
    parent.tag === "style"
      ? inferStyleParser(parent)
      : inferScriptParser(parent);

  if (!parser) {
    return;
  }

  const content = node.chars;

  const textToDocOptions = { parser, __embeddedInHtml: true };
  if (parser === "babel") {
    const typeAttribute = getAttribute(parent, "type");
    textToDocOptions.__babelSourceType =
      typeAttribute && getTextValue(typeAttribute) === "module"
        ? "module"
        : "script";
  }

  return async (textToDoc) => {
    if (!content.trim()) {
      return "";
    }
    return await textToDoc(content, textToDocOptions);
  };
}

export default embed;
