import visitorKeys from "./visitor-keys.evaluate.js"

const nonTraversableKeys = new Set([
  "range",
  "raw",
  "comments",
  "leadingComments",
  "trailingComments",
  "innerComments",
  "extra",
  "start",
  "end",
  "loc",
  "flags",
  "errors",
  "tokens",
  "parent",
  "type",
]);

function getVisitorKeys(node) {
  const {type} =node;

  return visitorKeys[type] || Object.keys(node).filter(key => !nonTraversableKeys.has(key))
}

export default getVisitorKeys
