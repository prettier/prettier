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
        return [prefix, printListItem(path, options, print)];
      }

      return [
        prefix,
        align(" ".repeat(prefix.length), printListItem(path, options, print)),
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

        return node.isAligned ||
          /* workaround for https://github.com/remarkjs/remark/issues/315 */ node.hasIndentedCodeblock
          ? alignListPrefix(rawPrefix, options)
          : rawPrefix;
      }
    },
  });
}

function printListItem(path, options, print) {
  const { node } = path;
  const prefix = node.checked === null ? "" : node.checked ? "[x] " : "[ ] ";
  return [
    prefix,
    printChildren(path, options, print, {
      processor({ node, isFirst }) {
        // All children should align consistently with the checkbox prefix.
        // The outer align() in printList handles alignment with the list marker.
        // Following CommonMark spec, subsequent content should align with where
        // text starts after the list marker.
        if (node.type === "list" && !isFirst) {
          // Nested lists don't need extra alignment for the checkbox prefix
          return print();
        }
        return align(" ".repeat(prefix.length), print());
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

export { printList };
