function isFrontMatter(node) {
  return (
    node.type === "front-matter" &&
    (node.language === "yaml" || node.language === "toml")
  );
}

export default isFrontMatter;
