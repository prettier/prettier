import {
  breakParent,
  dedentToRoot,
  group,
  ifBreak,
  indentIfBreak,
  indent,
  line,
  softline,
} from "../../document/builders.js";
import { replaceTextEndOfLine } from "../../document/utils.js";
import getNodeContent from "../get-node-content.js";
import {
  shouldPreserveContent,
  isScriptLikeTag,
  isVueCustomBlock,
  forceBreakContent,
} from "../utils/index.js";
import {
  printOpeningTagPrefix,
  printOpeningTag,
  printClosingTagSuffix,
  printClosingTag,
  needsToBorrowPrevClosingTagEndMarker,
  needsToBorrowLastChildClosingTagEndMarker,
} from "./tag.js";
import { printChildren } from "./children.js";

function printElement(path, options, print) {
  const { node } = path;

  if (shouldPreserveContent(node, options)) {
    return [
      printOpeningTagPrefix(node, options),
      group(printOpeningTag(path, options, print)),
      replaceTextEndOfLine(getNodeContent(node, options)),
      ...printClosingTag(node, options),
      printClosingTagSuffix(node, options),
    ];
  }
  /**
   * do not break:
   *
   *     <div>{{
   *         ~
   *       interpolation
   *     }}</div>
   *            ~
   *
   * exception: break if the opening tag breaks
   *
   *     <div
   *       long
   *           ~
   *       >{{
   *         interpolation
   *       }}</div
   *              ~
   *     >
   */
  const shouldHugContent =
    node.children.length === 1 &&
    node.firstChild.type === "interpolation" &&
    node.firstChild.isLeadingSpaceSensitive &&
    !node.firstChild.hasLeadingSpaces &&
    node.lastChild.isTrailingSpaceSensitive &&
    !node.lastChild.hasTrailingSpaces;

  const attrGroupId = Symbol("element-attr-group-id");

  const printTag = (doc) =>
    group([
      group(printOpeningTag(path, options, print), { id: attrGroupId }),
      doc,
      printClosingTag(node, options),
    ]);

  const printChildrenDoc = (childrenDoc) => {
    if (shouldHugContent) {
      return indentIfBreak(childrenDoc, { groupId: attrGroupId });
    }
    if (
      (isScriptLikeTag(node) || isVueCustomBlock(node, options)) &&
      node.parent.type === "root" &&
      options.parser === "vue" &&
      !options.vueIndentScriptAndStyle
    ) {
      return childrenDoc;
    }
    return indent(childrenDoc);
  };

  const printLineBeforeChildren = () => {
    if (shouldHugContent) {
      return ifBreak(softline, "", { groupId: attrGroupId });
    }
    if (
      node.firstChild.hasLeadingSpaces &&
      node.firstChild.isLeadingSpaceSensitive
    ) {
      return line;
    }
    if (
      node.firstChild.type === "text" &&
      node.isWhitespaceSensitive &&
      node.isIndentationSensitive
    ) {
      return dedentToRoot(softline);
    }
    return softline;
  };

  const printLineAfterChildren = () => {
    const needsToBorrow = node.next
      ? needsToBorrowPrevClosingTagEndMarker(node.next)
      : needsToBorrowLastChildClosingTagEndMarker(node.parent);
    if (needsToBorrow) {
      if (
        node.lastChild.hasTrailingSpaces &&
        node.lastChild.isTrailingSpaceSensitive
      ) {
        return " ";
      }
      return "";
    }
    if (shouldHugContent) {
      return ifBreak(softline, "", { groupId: attrGroupId });
    }
    if (
      node.lastChild.hasTrailingSpaces &&
      node.lastChild.isTrailingSpaceSensitive
    ) {
      return line;
    }
    if (
      (node.lastChild.type === "comment" ||
        (node.lastChild.type === "text" &&
          node.isWhitespaceSensitive &&
          node.isIndentationSensitive)) &&
      new RegExp(
        `\\n[\\t ]{${options.tabWidth * (path.ancestors.length - 1)}}$`,
      ).test(node.lastChild.value)
    ) {
      return "";
    }
    return softline;
  };

  if (node.children.length === 0) {
    return printTag(
      node.hasDanglingSpaces && node.isDanglingSpaceSensitive ? line : "",
    );
  }

  return printTag([
    forceBreakContent(node) ? breakParent : "",
    printChildrenDoc([
      printLineBeforeChildren(),
      printChildren(path, options, print),
    ]),
    printLineAfterChildren(),
  ]);
}

export { printElement };
