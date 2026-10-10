import { findSiblingAncestors } from "../main/range.js";

function getRangeNodes(startNodeAndAncestors, endNodeAndAncestors, options) {
  return findSiblingAncestors(
    startNodeAndAncestors,
    endNodeAndAncestors,
    options.parser === "vue" ? (node) => node.tag !== "root" : () => true,
    options,
  );
}

export { getRangeNodes };
