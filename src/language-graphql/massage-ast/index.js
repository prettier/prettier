function massageAstNode(original, cloned /* , parent */) {
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
