"use strict";

const clean = require("./clean");
const {
  builders,
  utils: { removeLines, stripTrailingHardline }
} = require("../doc");
const {
  breakParent,
  group,
  hardline,
  indent,
  join,
  line,
  literalline,
  markAsRoot,
  softline
} = builders;
const { hasNewlineInRange } = require("../common/util");
const {
  normalizeParts,
  dedentString,
  forceBreakChildren,
  forceBreakContent,
  forceNextEmptyLine,
  getCommentData,
  getLastDescendant,
  hasPrettierIgnore,
  inferScriptParser,
  isScriptLikeTag,
  preferHardlineAsLeadingSpaces,
  replaceDocNewlines,
  replaceNewlines
} = require("./utils");
const preprocess = require("./preprocess");
const assert = require("assert");

function concat(parts) {
  const newParts = normalizeParts(parts);
  return newParts.length === 0
    ? ""
    : newParts.length === 1
      ? newParts[0]
      : builders.concat(newParts);
}

function fill(parts) {
  const newParts = [];

  let hasSeparator = true;
  for (const part of normalizeParts(parts)) {
    switch (part) {
      case line:
      case hardline:
      case literalline:
      case softline:
        newParts.push(part);
        hasSeparator = true;
        break;
      default:
        if (!hasSeparator) {
          // `fill` needs a separator between each two parts
          newParts.push("");
        }
        newParts.push(part);
        hasSeparator = false;
        break;
    }
  }

  return builders.fill(newParts);
}

function embed(path, print, textToDoc /*, options */) {
  const node = path.getValue();
  switch (node.type) {
    case "text": {
      if (isScriptLikeTag(node.parent)) {
        const parser = inferScriptParser(node.parent);
        if (parser) {
          return builders.concat([
            concat([
              breakParent,
              printOpeningTagPrefix(node),
              markAsRoot(
                stripTrailingHardline(textToDoc(node.data, { parser }))
              ),
              printClosingTagSuffix(node)
            ])
          ]);
        }
      }
      break;
    }
    case "attribute": {
      /*
       * Vue binding syntax: JS expressions
       * :class="{ 'some-key': value }"
       * v-bind:id="'list-' + id"
       * v-if="foo && !bar"
       * @click="someFunction()"
       */
      if (/(^@)|(^v-)|:/.test(node.key) && !/^\w+$/.test(node.value)) {
        const doc = textToDoc(node.value, {
          parser: "__js_expression",
          // Use singleQuote since HTML attributes use double-quotes.
          // TODO(azz): We still need to do an entity escape on the attribute.
          singleQuote: true
        });
        return concat([
          node.key,
          '="',
          hasNewlineInRange(node.value, 0, node.value.length)
            ? doc
            : removeLines(doc),
          '"'
        ]);
      }
      break;
    }
    case "yaml":
      return markAsRoot(
        concat([
          "---",
          hardline,
          node.value.trim().length === 0
            ? ""
            : replaceDocNewlines(
                textToDoc(node.value, { parser: "yaml" }),
                literalline
              ),
          "---"
        ])
      );
  }
}

function genericPrint(path, options, print) {
  const node = path.getValue();
  switch (node.type) {
    case "root":
      return concat([group(printChildren(path, options, print)), hardline]);
    case "tag":
    case "ieConditionalComment":
      return concat([
        group(
          concat([
            printOpeningTag(path, options, print),
            node.children.length === 0
              ? node.hasDanglingSpaces && node.isDanglingSpaceSensitive
                ? line
                : ""
              : concat([
                  forceBreakContent(node) ? breakParent : "",
                  indent(
                    concat([
                      node.firstChild.type === "text" &&
                      node.firstChild.isWhiteSpaceSensitive &&
                      node.firstChild.isIndentationSensitive
                        ? literalline
                        : node.firstChild.hasLeadingSpaces &&
                          node.firstChild.isLeadingSpaceSensitive
                          ? line
                          : softline,
                      printChildren(path, options, print)
                    ])
                  ),
                  (node.next
                  ? needsToBorrowPrevClosingTagEndMarker(node.next)
                  : needsToBorrowLastChildClosingTagEndMarker(node.parent))
                    ? ""
                    : node.lastChild.hasTrailingSpaces &&
                      node.lastChild.isTrailingSpaceSensitive
                      ? line
                      : softline
                ])
          ])
        ),
        printClosingTag(node)
      ]);
    case "text":
      return fill(
        [].concat(
          printOpeningTagPrefix(node),
          node.isWhiteSpaceSensitive
            ? node.isIndentationSensitive
              ? replaceNewlines(
                  node.data.replace(/^\s*?\n|\n\s*?$/g, ""),
                  literalline
                )
              : replaceNewlines(
                  dedentString(node.data.replace(/^\s*?\n|\n\s*?$/g, "")),
                  hardline
                )
            : join(line, node.data.split(/\s+/)).parts,
          printClosingTagSuffix(node)
        )
      );
    case "comment":
    case "directive": {
      const data = getCommentData(node);
      return concat([
        group(
          concat([
            printOpeningTagStart(node),
            data.trim().length === 0
              ? ""
              : concat([
                  indent(
                    concat([
                      node.prev &&
                      needsToBorrowNextOpeningTagStartMarker(node.prev)
                        ? breakParent
                        : "",
                      node.type === "directive" ? " " : line,
                      concat(replaceNewlines(data, hardline))
                    ])
                  ),
                  node.type === "directive"
                    ? ""
                    : (node.next
                      ? needsToBorrowPrevClosingTagEndMarker(node.next)
                      : needsToBorrowLastChildClosingTagEndMarker(node.parent))
                      ? " "
                      : line
                ])
          ])
        ),
        printClosingTagEnd(node)
      ]);
    }
    case "attribute":
      return concat([
        node.key,
        node.value === null
          ? ""
          : concat([
              '="',
              concat(
                replaceNewlines(node.value.replace(/"/g, "&quot;"), literalline)
              ),
              '"'
            ])
      ]);
    case "yaml":
    case "toml":
      return node.raw;
    default:
      throw new Error(`Unexpected node type ${node.type}`);
  }
}

function printChildren(path, options, print) {
  const node = path.getValue();

  if (forceBreakChildren(node)) {
    return concat([
      breakParent,
      concat(
        path.map(childPath => {
          const childNode = childPath.getValue();
          const prevBetweenLine = !childNode.prev
            ? ""
            : printBetweenLine(childNode.prev, childNode);
          return concat([
            !prevBetweenLine
              ? ""
              : concat([
                  prevBetweenLine,
                  forceNextEmptyLine(childNode.prev) ||
                  childNode.prev.endLocation.line + 1 <
                    childNode.startLocation.line
                    ? hardline
                    : ""
                ]),
            print(childPath)
          ]);
        }, "children")
      )
    ]);
  }

  const parts = [];

  path.map((childPath, childIndex) => {
    const childNode = childPath.getValue();

    if (childIndex !== 0) {
      const prevBetweenLine = printBetweenLine(childNode.prev, childNode);
      if (prevBetweenLine) {
        if (
          forceNextEmptyLine(childNode.prev) ||
          childNode.prev.endLocation.line + 1 < childNode.startLocation.line
        ) {
          parts.push(hardline, hardline);
        } else {
          parts.push(prevBetweenLine);
        }
      }
    }

    Array.prototype.push.apply(
      parts,
      childNode.type === "text" ? print(childPath).parts : [print(childPath)]
    );
  }, "children");

  return fill(parts);

  function printBetweenLine(prevNode, nextNode) {
    return (needsToBorrowNextOpeningTagStartMarker(prevNode) &&
      /**
       *     123<a
       *          ~
       *       ><b>
       */
      (nextNode.firstChild ||
        /**
         *     123<br />
         *            ~
         */
        (nextNode.type === "tag" &&
          nextNode.isSelfClosing &&
          nextNode.attributes.length === 0))) ||
      /**
       *     <img
       *       src="long"
       *                 ~
       *     />123
       */
      (prevNode.type === "tag" &&
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

function printOpeningTag(path, options, print) {
  const node = path.getValue();
  return concat([
    printOpeningTagStart(node),
    !node.attributes || node.attributes.length === 0
      ? node.isSelfClosing
        ? /**
           *     <br />
           *        ^
           */
          " "
        : ""
      : group(
          concat([
            node.prev && needsToBorrowNextOpeningTagStartMarker(node.prev)
              ? /**
                 *     123<a
                 *       attr
                 *     >
                 */
                breakParent
              : "",
            indent(concat([line, join(line, path.map(print, "attributes"))])),
            node.firstChild &&
            needsToBorrowParentOpeningTagEndMarker(node.firstChild)
              ? /**
                 *     123<a
                 *       attr
                 *           ~
                 *       >456
                 */
                ""
              : node.isSelfClosing
                ? line
                : softline
          ])
        ),
    node.isSelfClosing ? "" : printOpeningTagEnd(node)
  ]);
}

function printOpeningTagStart(node) {
  return node.prev && needsToBorrowNextOpeningTagStartMarker(node.prev)
    ? ""
    : concat([printOpeningTagPrefix(node), printOpeningTagStartMarker(node)]);
}

function printOpeningTagEnd(node) {
  return node.firstChild &&
    needsToBorrowParentOpeningTagEndMarker(node.firstChild)
    ? ""
    : printOpeningTagEndMarker(node);
}

function printClosingTag(node) {
  return concat([
    node.isSelfClosing ? "" : printClosingTagStart(node),
    printClosingTagEnd(node)
  ]);
}

function printClosingTagStart(node) {
  return node.lastChild &&
    needsToBorrowParentClosingTagStartMarker(node.lastChild)
    ? ""
    : concat([printClosingTagPrefix(node), printClosingTagStartMarker(node)]);
}

function printClosingTagEnd(node) {
  return (node.next
  ? needsToBorrowPrevClosingTagEndMarker(node.next)
  : needsToBorrowLastChildClosingTagEndMarker(node.parent))
    ? ""
    : concat([printClosingTagEndMarker(node), printClosingTagSuffix(node)]);
}

function needsToBorrowNextOpeningTagStartMarker(node) {
  /**
   *     123<p
   *        ^^
   *     >
   */
  return (
    node.next &&
    node.type === "text" &&
    node.isTrailingSpaceSensitive &&
    !node.hasTrailingSpaces
  );
}

function needsToBorrowParentOpeningTagEndMarker(node) {
  /**
   *     <p
   *       >123
   *       ^
   *
   *     <p
   *       ><a
   *       ^
   */
  return !node.prev && node.isLeadingSpaceSensitive && !node.hasLeadingSpaces;
}

function needsToBorrowPrevClosingTagEndMarker(node) {
  /**
   *     <p></p
   *     >123
   *     ^
   *
   *     <p></p
   *     ><a
   *     ^
   */
  return node.prev && node.isLeadingSpaceSensitive && !node.hasLeadingSpaces;
}

function needsToBorrowLastChildClosingTagEndMarker(node) {
  /**
   *     <p
   *       ><a></a
   *       ></p
   *       ^
   *     >
   */
  return (
    node.lastChild &&
    node.lastChild.isTrailingSpaceSensitive &&
    !node.lastChild.hasTrailingSpaces &&
    getLastDescendant(node.lastChild).type !== "text"
  );
}

function needsToBorrowParentClosingTagStartMarker(node) {
  /**
   *     <p>
   *       123</p
   *          ^^^
   *     >
   *
   *         123</b
   *       ></a
   *        ^^^
   *     >
   */
  return (
    !node.next &&
    !node.hasTrailingSpaces &&
    node.isTrailingSpaceSensitive &&
    getLastDescendant(node).type === "text"
  );
}

function printOpeningTagPrefix(node) {
  return needsToBorrowParentOpeningTagEndMarker(node)
    ? printOpeningTagEndMarker(node.parent)
    : needsToBorrowPrevClosingTagEndMarker(node)
      ? printClosingTagEndMarker(node.prev)
      : "";
}

function printClosingTagPrefix(node) {
  return needsToBorrowLastChildClosingTagEndMarker(node)
    ? printClosingTagEndMarker(node.lastChild)
    : "";
}

function printClosingTagSuffix(node) {
  return needsToBorrowParentClosingTagStartMarker(node)
    ? printClosingTagStartMarker(node.parent)
    : needsToBorrowNextOpeningTagStartMarker(node)
      ? printOpeningTagStartMarker(node.next)
      : "";
}

function printOpeningTagStartMarker(node) {
  switch (node.type) {
    case "comment":
      return "<!--";
    case "ieConditionalComment":
      return `<!--[if ${node.condition}`;
    default:
      return `<${node.name}`;
  }
}

function printOpeningTagEndMarker(node) {
  assert(!node.isSelfClosing);
  switch (node.type) {
    case "ieConditionalComment":
      return "]>";
    default:
      return `>`;
  }
}

function printClosingTagStartMarker(node) {
  assert(!node.isSelfClosing);
  switch (node.type) {
    case "ieConditionalComment":
      return "<!";
    default:
      return `</${node.name}`;
  }
}

function printClosingTagEndMarker(node) {
  switch (node.type) {
    case "comment":
      return "-->";
    case "ieConditionalComment":
      return `[endif]-->`;
    case "tag":
      if (node.isSelfClosing) {
        return "/>";
      }
    // fall through
    default:
      return ">";
  }
}

module.exports = {
  preprocess,
  print: genericPrint,
  massageAstNode: clean,
  embed,
  hasPrettierIgnore
};
