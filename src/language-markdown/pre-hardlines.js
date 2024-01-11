import {
  INLINE_NODE_TYPES,
  INLINE_NODE_WRAPPER_TYPES,
  isPrettierIgnore,
} from "./utils.js";

const SIBLING_NODE_TYPES = new Set([
  "listItem",
  "definition",
  "footnoteDefinition",
]);

/**
 * @param {*} path
 * @param {*} options
 * @returns {number}
 */
function preHardLines(path, options) {
  if (!shouldPrePrintHardline(path)) {
    return 0;
  }
  if (shouldPrePrintTripleHardline(path)) {
    return 3;
  }
  if (shouldPrePrintDoubleHardline(path, options)) {
    return 2;
  }
  return 1;
}

function shouldPrePrintHardline({ node, parent }) {
  const isInlineNode = INLINE_NODE_TYPES.has(node.type);

  const isInlineHTML =
    node.type === "html" && INLINE_NODE_WRAPPER_TYPES.has(parent.type);

  return !isInlineNode && !isInlineHTML;
}

function shouldPrePrintDoubleHardline({ node, previous, parent }, options) {
  const isPrevNodeLooseListItem = isLooseListItem(previous, options);

  if (isPrevNodeLooseListItem) {
    return true;
  }

  const isSequence = previous.type === node.type;
  const isSiblingNode = isSequence && SIBLING_NODE_TYPES.has(node.type);
  const isInTightListItem =
    parent.type === "listItem" && !isLooseListItem(parent, options);
  const isPrevNodePrettierIgnore = isPrettierIgnore(previous) === "next";
  const isBlockHtmlWithoutBlankLineBetweenPrevHtml =
    node.type === "html" &&
    previous.type === "html" &&
    previous.position.end.line + 1 === node.position.start.line;
  const isHtmlDirectAfterListItem =
    node.type === "html" &&
    parent.type === "listItem" &&
    previous.type === "paragraph" &&
    previous.position.end.line + 1 === node.position.start.line;

  return !(
    isSiblingNode ||
    isInTightListItem ||
    isPrevNodePrettierIgnore ||
    isBlockHtmlWithoutBlankLineBetweenPrevHtml ||
    isHtmlDirectAfterListItem
  );
}

function shouldPrePrintTripleHardline({ node, previous }) {
  const isPrevNodeList = previous.type === "list";
  const isIndentedCode = node.type === "code" && node.isIndented;

  return isPrevNodeList && isIndentedCode;
}

function isLooseListItem(node, options) {
  return (
    node.type === "listItem" &&
    (node.spread ||
      // Check if `listItem` ends with `\n`
      // since it can't be empty, so we only need check the last character
      options.originalText.charAt(node.position.end.offset - 1) === "\n")
  );
}

export { preHardLines };
