import { isFrontMatter, VISITOR_KEYS } from "./front-matter/index.js";

const nonTraversableKeys = new Set([
  "tokens",
  "comments",
  "parent",
  "enclosingNode",
  "precedingNode",
  "followingNode",
]);

const defaultGetVisitorKeys = (node) =>
  isFrontMatter(node)
    ? VISITOR_KEYS
    : Object.keys(node).filter((key) => !nonTraversableKeys.has(key));

function createGetVisitorKeysFunction(printerGetVisitorKeys) {
  return printerGetVisitorKeys
    ? (node) =>
        isFrontMatter(node)
          ? VISITOR_KEYS
          : printerGetVisitorKeys(node, nonTraversableKeys)
    : defaultGetVisitorKeys;
}

export default createGetVisitorKeysFunction;
