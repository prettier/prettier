function isFrontMatter(node) {
  return node?.type === "front-matter";
}

function isEmbedFrontMatter(node) {
  return node.language === "yaml" || node.language === "toml";
}

export {
  isEmbedFrontMatter,
  isFrontMatter,
};
