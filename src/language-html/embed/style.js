function printStyleAttribute(value, attributeTextToDoc) {
  return attributeTextToDoc(value, {
    parser: "css",
    __isHTMLStyleAttribute: true,
  });
}

export { printStyleAttribute };
