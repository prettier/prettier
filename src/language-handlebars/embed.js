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
    case "":
    case "module":
    case "text/javascript":
    case "text/babel":
    case "text/jsx":
    case "application/javascript":
      return "babel";
  }
}

function inferStyleParser(node) {
  const langAttribute = getAttribute(node, "lang");
  if (!langAttribute) {
    return "css";
  }

  switch (getTextValue(langAttribute)) {
    case "":
    case "css":
      return "css";
  }
}

function embed(path /* , options*/) {
  const { node } = path;

  if (node.type !== "TextNode") {
    return;
  }

  const { parent } = path;
  if (
    parent.type !== "ElementNode" ||
    parent.children.length !== 1 ||
    parent.children[0] !== node
  ) {
    return;
  }

  let parser;
  if (parent.tag === "style") {
    parser = inferStyleParser(parent);
  } else if (parent.tag === "script") {
    parser = inferScriptParser(parent);
  }

  if (!parser) {
    return;
  }

  const content = node.chars;
  if (content.includes("{{")) {
    return;
  }

  return async (textToDoc) => {
    if (!content.trim()) {
      return "";
    }
    return await textToDoc(content, { parser, __embeddedInHtml: true });
  };
}

export default embed;
