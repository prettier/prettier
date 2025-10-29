import isFrontMatter from "./is-front-matter.js";

function printFrontMatter(path) {
  const { node } = path;
  if (isFrontMatter(node)) {
    return node.raw;
  }
}

export default printFrontMatter;
