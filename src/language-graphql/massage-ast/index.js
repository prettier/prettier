function massageAstNode(original, cloned, parent) {
  // Markdown formatting can change documentation, but not ordinary string values.
  if (
    original.kind === "StringValue" &&
    original.block &&
    parent?.description === original
  ) {
    delete cloned.value;
    return;
  }

  // We print single line `""" string """` as multiple line string,
  // and the parser ignores space in multiple line string
  if (
    original.kind === "StringValue" &&
    original.block &&
    !original.value.includes("\n")
  ) {
    cloned.value = original.value.trim();
  }
}

massageAstNode.ignoredProperties = new Set(["loc", "comments"]);

export { massageAstNode };
