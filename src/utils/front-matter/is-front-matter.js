function isFrontMatter(node) {
  return node?.type === "front-matter";
}

export default isFrontMatter;
