import htmlVoidElements from "./html-void-elements.evaluate.js";

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

// https://github.com/glimmerjs/glimmer-vm/blob/ec5648f3895b9ab8d085523be001553746221449/packages/%40glimmer/syntax/lib/generation/printer.ts#L44-L46
function isVoidTag(tag) {
  return htmlVoidElements.has(tag.toLowerCase()) && !isUppercase(tag[0]);
}

function isVoidElement(node) {
  return (
    node.selfClosing === true ||
    isVoidTag(node.tag) ||
    (isGlimmerComponent(node) &&
      node.children.every((node) => isWhitespaceNode(node)))
  );
}

function isWhitespaceNode(node) {
  return node.type === "TextNode" && !/\S/u.test(node.chars);
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
