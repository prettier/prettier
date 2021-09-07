"use strict";

/**
 * @typedef {import("../document").Doc} Doc
 */

const {
  builders: {
    breakParent,
    dedentToRoot,
    fill,
    group,
    hardline,
    ifBreak,
    indentIfBreak,
    indent,
    line,
    literalline,
    softline,
  },
  utils: { cleanDoc, getDocParts, isConcat, replaceTextEndOfLine },
} = require("../document/index.js");
const clean = require("./clean.js");
const {
  countChars,
  countParents,
  forceBreakChildren,
  forceBreakContent,
  forceNextEmptyLine,
  hasPrettierIgnore,
  isVueCustomBlock,
  isScriptLikeTag,
  isTextLikeNode,
  preferHardlineAsLeadingSpaces,
  shouldPreserveContent,
  unescapeQuoteEntities,
  getTextValueParts,
} = require("./utils.js");
const preprocess = require("./print-preprocess.js");
const { insertPragma } = require("./pragma.js");
const { locStart, locEnd } = require("./loc.js");
const embed = require("./embed.js");
const {
  printClosingTagEndMarker,
  printClosingTagSuffix,
  printClosingTag,
  printClosingTagEnd,
  needsToBorrowPrevClosingTagEndMarker,
  needsToBorrowLastChildClosingTagEndMarker,
  needsToBorrowParentClosingTagStartMarker,
  printOpeningTagPrefix,
  printOpeningTag,
  printOpeningTagStart,
  printOpeningTagStartMarker,
  needsToBorrowNextOpeningTagStartMarker,
} = require("./print/tag.js");
const getNodeContent = require("./get-node-content.js");

function genericPrint(path, options, print) {
  const node = path.getValue();

  switch (node.type) {
    case "front-matter":
      return replaceTextEndOfLine(node.raw);
    case "root":
      if (options.__onHtmlRoot) {
        options.__onHtmlRoot(node);
      }
      // use original concat to not break stripTrailingHardline
      return [group(printChildren(path, options, print)), hardline];
    case "element":
    case "ieConditionalComment": {
      return printElement(path, options, print);
    }
    case "ieConditionalStartComment":
    case "ieConditionalEndComment":
      return [printOpeningTagStart(node), printClosingTagEnd(node)];
    case "interpolation":
      return [
        printOpeningTagStart(node, options),
        ...path.map(print, "children"),
        printClosingTagEnd(node, options),
      ];
    case "text": {
      if (node.parent.type === "interpolation") {
        // replace the trailing literalline with hardline for better readability
        const trailingNewlineRegex = /\n[^\S\n]*?$/;
        const hasTrailingNewline = trailingNewlineRegex.test(node.value);
        const value = hasTrailingNewline
          ? node.value.replace(trailingNewlineRegex, "")
          : node.value;
        return [
          ...replaceTextEndOfLine(value),
          hasTrailingNewline ? hardline : "",
        ];
      }

      const printed = cleanDoc([
        printOpeningTagPrefix(node, options),
        ...getTextValueParts(node),
        printClosingTagSuffix(node, options),
      ]);
      if (isConcat(printed) || printed.type === "fill") {
        return fill(getDocParts(printed));
      }
      /* istanbul ignore next */
      return printed;
    }
    case "docType":
      return [
        group([
          printOpeningTagStart(node, options),
          " ",
          node.value.replace(/^html\b/i, "html").replace(/\s+/g, " "),
        ]),
        printClosingTagEnd(node, options),
      ];
    case "comment": {
      return [
        printOpeningTagPrefix(node, options),
        ...replaceTextEndOfLine(
          options.originalText.slice(locStart(node), locEnd(node)),
          literalline
        ),
        printClosingTagSuffix(node, options),
      ];
    }
    case "attribute": {
      if (node.value === null) {
        return node.rawName;
      }
      const value = unescapeQuoteEntities(node.value);
      const singleQuoteCount = countChars(value, "'");
      const doubleQuoteCount = countChars(value, '"');
      const quote = singleQuoteCount < doubleQuoteCount ? "'" : '"';
      return [
        node.rawName,

        "=",
        quote,

        ...replaceTextEndOfLine(
          quote === '"'
            ? value.replace(/"/g, "&quot;")
            : value.replace(/'/g, "&apos;")
        ),
        quote,
      ];
    }
    default:
      /* istanbul ignore next */
      throw new Error(`Unexpected node type ${node.type}`);
  }
}

function printElement(path, options, print) {
  const node = path.getValue();

  if (shouldPreserveContent(node, options)) {
    return [
      printOpeningTagPrefix(node, options),
      group(printOpeningTag(path, options, print)),
      ...replaceTextEndOfLine(getNodeContent(node, options)),
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
        `\\n[\\t ]{${
          options.tabWidth *
          countParents(
            path,
            (node) => node.parent && node.parent.type !== "root"
          )
        }}$`
      ).test(node.lastChild.value)
    ) {
      return "";
    }
    return softline;
  };

  if (node.children.length === 0) {
    return printTag(
      node.hasDanglingSpaces && node.isDanglingSpaceSensitive ? line : ""
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

function printChildren(path, options, print) {
  const node = path.getValue();

  if (forceBreakChildren(node)) {
    return [
      breakParent,

      ...path.map((childPath) => {
        const childNode = childPath.getValue();
        const prevBetweenLine = !childNode.prev
          ? ""
          : printBetweenLine(childNode.prev, childNode);
        return [
          !prevBetweenLine
            ? ""
            : [
                prevBetweenLine,
                forceNextEmptyLine(childNode.prev) ? hardline : "",
              ],
          printChild(childPath),
        ];
      }, "children"),
    ];
  }

  const groupIds = node.children.map(() => Symbol(""));
  return path.map((childPath, childIndex) => {
    const childNode = childPath.getValue();

    if (isTextLikeNode(childNode)) {
      if (childNode.prev && isTextLikeNode(childNode.prev)) {
        const prevBetweenLine = printBetweenLine(childNode.prev, childNode);
        if (prevBetweenLine) {
          if (forceNextEmptyLine(childNode.prev)) {
            return [hardline, hardline, printChild(childPath)];
          }
          return [prevBetweenLine, printChild(childPath)];
        }
      }
      return printChild(childPath);
    }

    const prevParts = [];
    const leadingParts = [];
    const trailingParts = [];
    const nextParts = [];

    const prevBetweenLine = childNode.prev
      ? printBetweenLine(childNode.prev, childNode)
      : "";

    const nextBetweenLine = childNode.next
      ? printBetweenLine(childNode, childNode.next)
      : "";

    if (prevBetweenLine) {
      if (forceNextEmptyLine(childNode.prev)) {
        prevParts.push(hardline, hardline);
      } else if (prevBetweenLine === hardline) {
        prevParts.push(hardline);
      } else {
        if (isTextLikeNode(childNode.prev)) {
          leadingParts.push(prevBetweenLine);
        } else {
          leadingParts.push(
            ifBreak("", softline, {
              groupId: groupIds[childIndex - 1],
            })
          );
        }
      }
    }

    if (nextBetweenLine) {
      if (forceNextEmptyLine(childNode)) {
        if (isTextLikeNode(childNode.next)) {
          nextParts.push(hardline, hardline);
        }
      } else if (nextBetweenLine === hardline) {
        if (isTextLikeNode(childNode.next)) {
          nextParts.push(hardline);
        }
      } else {
        trailingParts.push(nextBetweenLine);
      }
    }

    return [
      ...prevParts,
      group([
        ...leadingParts,
        group([printChild(childPath), ...trailingParts], {
          id: groupIds[childIndex],
        }),
      ]),
      ...nextParts,
    ];
  }, "children");

  function printChild(childPath) {
    const child = childPath.getValue();

    if (hasPrettierIgnore(child)) {
      return [
        printOpeningTagPrefix(child, options),
        ...replaceTextEndOfLine(
          options.originalText.slice(
            locStart(child) +
              (child.prev && needsToBorrowNextOpeningTagStartMarker(child.prev)
                ? printOpeningTagStartMarker(child).length
                : 0),
            locEnd(child) -
              (child.next && needsToBorrowPrevClosingTagEndMarker(child.next)
                ? printClosingTagEndMarker(child, options).length
                : 0)
          )
        ),
        printClosingTagSuffix(child, options),
      ];
    }

    return print();
  }

  function printBetweenLine(prevNode, nextNode) {
    return isTextLikeNode(prevNode) && isTextLikeNode(nextNode)
      ? prevNode.isTrailingSpaceSensitive
        ? prevNode.hasTrailingSpaces
          ? preferHardlineAsLeadingSpaces(nextNode)
            ? hardline
            : line
          : ""
        : preferHardlineAsLeadingSpaces(nextNode)
        ? hardline
        : softline
      : (needsToBorrowNextOpeningTagStartMarker(prevNode) &&
          (hasPrettierIgnore(nextNode) ||
            /**
             *     123<a
             *          ~
             *       ><b>
             */
            nextNode.firstChild ||
            /**
             *     123<!--
             *            ~
             *     -->
             */
            nextNode.isSelfClosing ||
            /**
             *     123<span
             *             ~
             *       attr
             */
            (nextNode.type === "element" && nextNode.attrs.length > 0))) ||
        /**
         *     <img
         *       src="long"
         *                 ~
         *     />123
         */
        (prevNode.type === "element" &&
          prevNode.isSelfClosing &&
          needsToBorrowPrevClosingTagEndMarker(nextNode))
      ? ""
      : !nextNode.isLeadingSpaceSensitive ||
        preferHardlineAsLeadingSpaces(nextNode) ||
        /**
         *       Want to write us a letter? Use our<a
         *         ><b><a>mailing address</a></b></a
         *                                          ~
         *       >.
         */
        (needsToBorrowPrevClosingTagEndMarker(nextNode) &&
          prevNode.lastChild &&
          needsToBorrowParentClosingTagStartMarker(prevNode.lastChild) &&
          prevNode.lastChild.lastChild &&
          needsToBorrowParentClosingTagStartMarker(
            prevNode.lastChild.lastChild
          ))
      ? hardline
      : nextNode.hasLeadingSpaces
      ? line
      : softline;
  }
}

module.exports = {
  preprocess,
  print: genericPrint,
  insertPragma,
  massageAstNode: clean,
  embed,
};
