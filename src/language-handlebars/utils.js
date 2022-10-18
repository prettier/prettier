import { htmlVoidElements } from "html-void-elements";

function isLastNodeOfSiblings(path) {
  const { node } = path;
  const parentNode = path.parent;

  if (
    isParentOfSomeType(path, ["ElementNode"]) &&
    parentNode.children.at(-1) === node
  ) {
    return true;
  }

  if (isParentOfSomeType(path, ["Block"]) && parentNode.body.at(-1) === node) {
    return true;
  }

  return false;
}

function isUppercase(string) {
  return string.toUpperCase() === string;
}

function isGlimmerComponent(node) {
  return (
    isNodeOfSomeType(node, ["ElementNode"]) &&
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
  return isNodeOfSomeType(node, ["TextNode"]) && !/\S/.test(node.chars);
}

function isNodeOfSomeType(node, types) {
  return node && types.includes(node.type);
}

function isParentOfSomeType(path, types) {
  const parentNode = path.parent;
  return isNodeOfSomeType(parentNode, types);
}

function isPreviousNodeOfSomeType(path, types) {
  const previousNode = getPreviousNode(path);
  return isNodeOfSomeType(previousNode, types);
}

function isNextNodeOfSomeType(path, types) {
  const nextNode = getNextNode(path);
  return isNodeOfSomeType(nextNode, types);
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
    isNodeOfSomeType(node, ["MustacheCommentStatement"]) &&
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
  isLastNodeOfSiblings,
  isNextNodeOfSomeType,
  isNodeOfSomeType,
  isParentOfSomeType,
  isPreviousNodeOfSomeType,
  isVoid,
  isWhitespaceNode,
};
