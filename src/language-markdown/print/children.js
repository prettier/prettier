import { hardline } from "../../document/index.js";
import {
  INLINE_NODE_TYPES,
  INLINE_NODE_WRAPPER_TYPES,
  isPrettierIgnore,
  isSetextHeading,
} from "../utilities.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

/**
 * @param {AstPath} path
 * @param {*} options
 * @param {() => Doc} print
 * @param {*} [events]
 * @return {Doc}
 */
function printChildren(path, options, print, events = {}) {
  const { processor = print } = events;

  const parts = [];

  path.each(() => {
    const result = processor(path);
    if (result !== false) {
      if (parts.length > 0 && shouldPrePrintHardline(path)) {
        parts.push(hardline);

        if (
          shouldPrePrintDoubleHardline(path, options) ||
          shouldPrePrintTripleHardline(path)
        ) {
          parts.push(hardline);
        }

        if (shouldPrePrintTripleHardline(path)) {
          parts.push(hardline);
        }
      }

      parts.push(result);
    }
  }, "children");

  return parts;
}

function shouldPrePrintHardline({ node, parent }) {
  const isInlineNode = INLINE_NODE_TYPES.has(node.type);

  const isInlineHTML =
    node.type === "html" && INLINE_NODE_WRAPPER_TYPES.has(parent.type);

  return !isInlineNode && !isInlineHTML;
}

const SIBLING_NODE_TYPES = new Set(["listItem", "definition"]);

/**
 * @param {AstPath} path
 * @returns {boolean}
 */
function shouldPrePrintDoubleHardline(path, options) {
  const { node, previous, parent } = path;

  if (options.parser === "mdx") {
    if (
      isLooseListItemLegacy(previous, options) ||
      (node.type === "list" &&
        parent.type === "listItem" &&
        previous.type === "code")
    ) {
      return true;
    }
  } else {
    if (
      isSetextHeading(node) &&
      node.position.start.line < previous.position.end.line
    ) {
      return false;
    }

    if (
      isPreviousNodeLooseListItem(path) ||
      (node.type === "list" &&
        parent.type === "listItem" &&
        previous.type === "code")
    ) {
      return true;
    }
  }

  const isSequence = previous.type === node.type;
  const isSiblingNode = isSequence && SIBLING_NODE_TYPES.has(node.type);
  let isInTightListItem;
  if (options.parser === "mdx") {
    isInTightListItem =
      parent.type === "listItem" &&
      (node.type === "list" || !isLooseListItemLegacy(parent, options));
  } else {
    isInTightListItem =
      parent.type === "listItem" &&
      (node.type === "list" || !path.callParent(isLooseListItem));
  }
  const isPrevNodePrettierIgnore = isPrettierIgnore(previous) === "next";
  const isBlockHtmlWithoutBlankLineBetweenPrevHtml =
    node.type === "html" &&
    previous.type === "html" &&
    previous.position.end.line + 1 === node.position.start.line;
  const isBlockHtmlWithoutBlankLineBetweenPrevParagraph =
    options.parser !== "mdx" &&
    node.type === "html" &&
    previous.type === "paragraph" &&
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
    isBlockHtmlWithoutBlankLineBetweenPrevParagraph ||
    isHtmlDirectAfterListItem
  );
}

function shouldPrePrintTripleHardline({ node, previous }) {
  const isPrevNodeList = previous.type === "list";
  const isIndentedCode = node.type === "code" && node.isIndented;

  return isPrevNodeList && isIndentedCode;
}

function isLooseListItemLegacy(node, options) {
  return (
    node.type === "listItem" &&
    (node.spread ||
      // Check if `listItem` ends with `\n`
      // since it can't be empty, so we only need check the last character
      options.originalText.charAt(node.position.end.offset - 1) === "\n")
  );
}

function isLooseListItem({ node, parent, next }) {
  return (
    node.type === "listItem" &&
    (node.spread ||
      (parent.type === "list" &&
        next?.type === "listItem" &&
        node.position.end.line + 1 < next.position.start.line))
  );
}

/**
 * @param {AstPath} path
 * @returns {boolean}
 */
function isPreviousNodeLooseListItem(path) {
  if (path.index === 0) {
    return false;
  }
  return isLooseListItem({
    node: path.previous,
    parent: path.parent,
    next: path.node,
  });
}

export { printChildren };
