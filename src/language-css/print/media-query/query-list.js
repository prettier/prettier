import { group, indent, join, line } from "../../../document/index.js";

function printMediaList(path, options, print) {
  const parts = [];
  path.each(({ node }) => {
    if (node.type === "media-query" && node.value === "") {
      return;
    }
    parts.push(print());
  }, "nodes");

  return group(indent(join(line, parts)));
}

export { printMediaList };
