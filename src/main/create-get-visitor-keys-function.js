import {
  FRONT_MATTER_VISITOR_KEYS,
  isFrontMatter,
} from "./front-matter/index.js";

const nonTraversableKeys = new Set([
  "tokens",
  "comments",
  "parent",
  "enclosingNode",
  "precedingNode",
  "followingNode",
]);

const defaultGetVisitorKeys = (node) =>
  Object.keys(node).filter((key) => !nonTraversableKeys.has(key));

function createGetVisitorKeysFunction(printerGetVisitorKeys) {
  const getNonFrontMatterVisitorKeys = printerGetVisitorKeys
    ? (node) => printerGetVisitorKeys(node, nonTraversableKeys)
    : defaultGetVisitorKeys;
  return (node) =>
    isFrontMatter(node)
      ? FRONT_MATTER_VISITOR_KEYS
      : getNonFrontMatterVisitorKeys(node);
}

export default createGetVisitorKeysFunction;
