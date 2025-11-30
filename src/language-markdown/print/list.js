import { align } from "../../document/index.js";
import {
  getNthListSiblingIndex,
  hasGitDiffFriendlyOrderedList,
} from "../utilities.js";
import { printChildren } from "./children.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

/**
 * @param {AstPath} path
 * @param {*} options
 * @param {() => Doc} print
 * @return {Doc}
 */
function printList(path, options, print) {
  const { node } = path;
  const nthSiblingIndex = getNthListSiblingIndex(node, path.parent);

  const isGitDiffFriendlyOrderedList = hasGitDiffFriendlyOrderedList(
    node,
    options,
  );

  return printChildren(path, options, print, {
    processor() {
      const prefix = getPrefix();
      const { node: childNode } = path;

      if (
        childNode.children.length === 2 &&
        childNode.children[1].type === "html" &&
        childNode.children[0].position.start.column !==
          childNode.children[1].position.start.column
      ) {
        return [prefix, printListItem(path, options, print, prefix)];
      }

      return [
        prefix,
        align(
          " ".repeat(prefix.length),
          printListItem(path, options, print, prefix),
        ),
      ];

      function getPrefix() {
        const rawPrefix = node.ordered
          ? (path.isFirst
              ? node.start
              : isGitDiffFriendlyOrderedList
                ? 1
                : node.start + path.index) +
            (nthSiblingIndex % 2 === 0 ? ". " : ") ")
          : nthSiblingIndex % 2 === 0
            ? "- "
            : "* ";

        return (node.isAligned ||
          /* workaround for https://github.com/remarkjs/remark/issues/315 */ node.hasIndentedCodeblock) &&
          node.ordered
          ? alignListPrefix(rawPrefix, options)
          : rawPrefix;
      }
    },
  });
}

function printListItem(path, options, print, listPrefix) {
  const { node } = path;
  const prefix = node.checked === null ? "" : node.checked ? "[x] " : "[ ] ";
  return [
    prefix,
    printChildren(path, options, print, {
      processor({ node, isFirst }) {
        if (isFirst && node.type !== "list") {
          return align(" ".repeat(prefix.length), print());
        }

        const alignment = " ".repeat(
          clamp(options.tabWidth - listPrefix.length, 0, 3), // 4+ will cause indented code block
        );
        return [alignment, align(alignment, print())];
      },
    }),
  ];
}

function alignListPrefix(prefix, options) {
  const additionalSpaces = getAdditionalSpaces();
  return (
    prefix +
    " ".repeat(
      additionalSpaces >= 4 ? 0 : additionalSpaces, // 4+ will cause indented code block
    )
  );

  function getAdditionalSpaces() {
    const restSpaces = prefix.length % options.tabWidth;
    return restSpaces === 0 ? 0 : options.tabWidth - restSpaces;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

export { printList };
