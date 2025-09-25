function isFrontMatter(node) {
  return node?.type === "front-matter";
}

function isEmbedFrontMatter(node) {
  return (
    isFrontMatter(node) &&
    (node.language === "yaml" || node.language === "toml")
  );
}

export { isEmbedFrontMatter, isFrontMatter };
