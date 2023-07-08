function isFrontMatter(/** @type {any} */ node) {
  return node?.type === "front-matter";
}

export default isFrontMatter;
