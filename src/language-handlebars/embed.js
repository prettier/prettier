function embed(path /* , options*/) {
  const { node } = path;

  if (node.type !== "TextNode") {
    return;
  }

  const { parent } = path;

  if (
    !(
      parent.type === "ElementNode" &&
      parent.tag === "style" &&
      parent.children.length === 1 &&
      parent.children[0] === node
    )
  ) {
    return;
  }

  const languageAttribute = parent.attributes.find(
    (attribute) => attribute.type === "AttrNode" && attribute.name === "lang",
  );
  if (
    languageAttribute &&
    !(
      languageAttribute.value.type === "TextNode" &&
      (languageAttribute.value.chars === "" ||
        languageAttribute.value.chars === "css")
    )
  ) {
    return;
  }

  return async (textToDoc) => {
    const context = node.chars;
    if (!context.trim()) {
      return "";
    }
    const doc = await textToDoc(context, { parser: "css" });
    return doc;
  };
}

export default embed;
