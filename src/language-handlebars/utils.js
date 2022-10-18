import { htmlVoidElements } from "html-void-elements";

function isUppercase(string) {
  return string.toUpperCase() === string;
}

function isGlimmerComponent(node) {
  return (
    node.type === "ElementNode" &&
    typeof node.tag === "string" &&
    !node.tag.startsWith(":") &&
    (isUppercase(node.tag[0]) || node.tag.includes("."))
  );
}

const voidTags = new Set(htmlVoidElements);
function isVoid(node) {
  return (
    voidTags.has(node.tag) ||
    (isGlimmerComponent(node) &&
      node.children.every((node) => isWhitespaceNode(node)))
  );
}

function isWhitespaceNode(node) {
  return node.type === "TextNode" && !/\S/.test(node.chars);
}

function getSiblingNode(path, offset) {
  const { node } = path;
  const parentNode = path.parent ?? {};
  const children =
    parentNode.children ?? parentNode.body ?? parentNode.parts ?? [];
  const index = children.indexOf(node);
  return index !== -1 && children[index + offset];
}

function getPreviousNode(path, lookBack = 1) {
  return getSiblingNode(path, -lookBack);
}

function getNextNode(path) {
  return getSiblingNode(path, 1);
}

function isPrettierIgnoreNode(node) {
  return (
    node?.type === "MustacheCommentStatement" &&
    typeof node.value === "string" &&
    node.value.trim() === "prettier-ignore"
  );
}

function hasPrettierIgnore(path) {
  const { node } = path;
  const previousPreviousNode = getPreviousNode(path, 2);
  return (
    isPrettierIgnoreNode(node) || isPrettierIgnoreNode(previousPreviousNode)
  );
}

export {
  getNextNode,
  getPreviousNode,
  hasPrettierIgnore,
  isVoid,
  isWhitespaceNode,
};
