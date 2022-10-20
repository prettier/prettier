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

function isPrettierIgnoreComment(node) {
  return (
    node?.type === "MustacheCommentStatement" &&
    node.value.trim() === "prettier-ignore"
  );
}

function hasPrettierIgnore(path) {
  if (!path.isInArray || path.node.type !== "ElementNode" || path.isFirst) {
    return false;
  }

  const { previous } = path;

  /*
  ```handlebars
  {{! prettier-ignore }}<div></div>
  ```
  */
  if (isPrettierIgnoreComment(previous)) {
    return true;
  }

  /*
  ```handlebars
  {{! prettier-ignore }}
  <div></div>
  ```
  */
  if (previous.type === "TextNode" && /^\n[\t ]*$/.test(previous.chars)) {
    return isPrettierIgnoreComment(path.siblings[path.index - 2]);
  }

  return false;
}

export { hasPrettierIgnore, isVoidElement, isWhitespaceNode };
