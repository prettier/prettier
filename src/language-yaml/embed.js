function embed(path, options) {
  const node = path.getValue();

  // Try to format `.prettierrc`, `.stylelintrc`, and `.lintstagedrc` as `json` first
  if (
    node.type === "root" &&
    options.filepath &&
    /(?:[/\\]|^)\.(?:prettier|stylelint|lintstaged)rc$/.test(options.filepath)
  ) {
    return (textToDoc) =>
      textToDoc(options.originalText, { ...options, parser: "json" });
  }
}

export default embed;
