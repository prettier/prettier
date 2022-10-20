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
function isVoidElement(node) {
  return (
    voidTags.has(node.tag) ||
    (isGlimmerComponent(node) &&
      node.children.every((node) => isWhitespaceNode(node)))
  );
}

function isWhitespaceNode(node) {
  return node.type === "TextNode" && !/\S/.test(node.chars);
}

function isPrettierIgnoreNode(node) {
  return (
    node?.type === "MustacheCommentStatement" &&
    typeof node.value === "string" &&
    node.value.trim() === "prettier-ignore"
  );
}

function hasPrettierIgnore(path) {
  return (
    isPrettierIgnoreNode(path.node) ||
    (path.isInArray &&
      (path.key === "children" ||
        path.key === "body" ||
        path.key === "parts") &&
      isPrettierIgnoreNode(path.siblings[path.index - 2]))
  );
}

export { hasPrettierIgnore, isVoidElement, isWhitespaceNode };
