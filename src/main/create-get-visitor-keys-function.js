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

function createGetVisitorKeysFunction(
  printerGetVisitorKeys,
  supportFrontMatter,
) {
  const getVisitorKeys = printerGetVisitorKeys
    ? (node) => printerGetVisitorKeys(node, nonTraversableKeys)
    : defaultGetVisitorKeys;
  if (!supportFrontMatter) {
    return getVisitorKeys;
  }

  return new Proxy(getVisitorKeys, {
    apply: (target, thisArgument, argumentsList) =>
      isFrontMatter(argumentsList[0])
        ? FRONT_MATTER_VISITOR_KEYS
        : Reflect.apply(target, thisArgument, argumentsList),
  });
}

export default createGetVisitorKeysFunction;
