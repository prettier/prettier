"use strict";

const clean = require("./clean");
const {
  builders: {
    breakParent,
    concat,
    group,
    hardline,
    indent,
    join,
    line,
    literalline,
    markAsRoot,
    softline
  },
  utils: { removeLines, stripTrailingHardline }
} = require("../doc");
const { hasNewlineInRange } = require("../common/util");
const {
  dedentString,
  forceNextEmptyLine,
  getCommentData,
  hasPrettierIgnore,
  inferScriptParser,
  isScriptLikeTag,
  replaceDocNewlines,
  replaceNewlines
} = require("./utils");
const preprocess = require("./preprocess");
const assert = require("assert");

function embed(path, print, textToDoc /*, options */) {
  const node = path.getValue();
  switch (node.type) {
    case "text": {
      if (isScriptLikeTag(node.parent)) {
        const parser = inferScriptParser(node.parent);
        if (parser) {
          return concat([
            breakParent,
            printOpeningTagPrefix(node),
            markAsRoot(stripTrailingHardline(textToDoc(node.data, { parser }))),
            printClosingTagSuffix(node)
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
      return concat([
        group(
          concat([
            node.children.some(child => child.type !== "text")
              ? breakParent
              : "",
            printChildren(path, options, print)
          ])
        ),
        hardline
      ]);
    case "tag":
    case "ieConditionalComment":
      return concat([
        group(
          concat([
            node.children.some(child => child.type !== "text")
              ? breakParent
              : "",
            printOpeningTag(path, options, print),
            node.isSelfClosing
              ? /**
                 *     <br />
                 *       ^
                 *
                 *     <meta
                 *       longAttr
                 *     />
                 *     ~
                 */
                node.attributes.length === 1
                ? " "
                : line
              : node.children.length === 0
                ? node.isDanglingSpaceSensitive && node.hasDanglingSpaces
                  ? /**
                     *     <p>
                     *     </p>
                     *     ~
                     * */
                    hardline
                  : ""
                : concat([
                    indent(printChildren(path, options, print)),
                    node.next &&
                    needsToBorrowPrevClosingTagEndMarker(node.next) &&
                    needsToBorrowParentClosingTagStartMarker(node.lastChild)
                      ? /**
                         *
                         *     <div>
                         *       123</div
                         *               ~
                         *     >456
                         */
                        ""
                      : softline
                  ])
          ])
        ),
        group(printClosingTag(node))
      ]);
    case "text":
      return concat([
        printOpeningTagPrefix(node),
        node.isWhiteSpaceSensitive
          ? node.isIndentationSensitive
            ? concat(
                replaceNewlines(
                  node.data.replace(/^\s*?\n|\n\s*?$/g, ""),
                  literalline
                )
              )
            : concat(
                replaceNewlines(
                  dedentString(node.data.replace(/^\s*?\n|\n\s*?$/g, "")),
                  hardline
                )
              )
          : concat(
              replaceNewlines(node.data.replace(/\s+/g, " "), literalline)
            ),
        printClosingTagSuffix(node)
      ]);
    case "comment":
    case "directive": {
      const data = getCommentData(node);
      return concat([
        group(
          concat([
            printOpeningTagStart(node),
            data.trim().length === 0
              ? ""
              : indent(
                  node.prev && needsToBorrowNextOpeningTagStartMarker(node.prev)
                    ? /**
                       *     123<!--
                       *            ~
                       *       123
                       *     ^^
                       */
                      concat([
                        hardline,
                        concat(replaceNewlines(data, hardline))
                      ])
                    : /**
                       *     ><!-- 123
                       *          ^
                       *
                       *     ><!--
                       *          ~
                       *       123
                       *     ^^
                       *       123
                       */
                      concat([
                        node.type === "directive" ? " " : line,
                        concat(replaceNewlines(data, hardline))
                      ])
                ),
            node.type === "directive" ||
            (node.next && needsToBorrowPrevClosingTagEndMarker(node.next))
              ? /**
                 *     <!--
                 *         123
                 *            ~
                 *   -->456
                 */
                ""
              : line
          ])
        ),
        group(printClosingTagEnd(node))
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
  return concat(
    path.map((childPath, childIndex) => {
      const childNode = childPath.getValue();
      return concat([
        childNode.prev &&
        (forceNextEmptyLine(childNode.prev) ||
          childNode.prev.endLocation.line + 1 < childNode.startLocation.line)
          ? hardline
          : "",
        (childIndex === 0 && node.type === "root") ||
        (childNode.prev &&
          needsToBorrowNextOpeningTagStartMarker(childNode.prev))
          ? /**
             *     123<br />
             *            ~
             *     456
             *
             *     123<a
             *          ~
             *       longAttr
             */
            ""
          : childNode.type === "text" &&
            childNode.isWhiteSpaceSensitive &&
            childNode.isIndentationSensitive
            ? literalline
            : softline,
        print(childPath)
      ]);
    }, "children")
  );
}

function printOpeningTag(path, options, print) {
  const node = path.getValue();
  return concat([
    printOpeningTagStart(node),
    !node.attributes || node.attributes.length === 0
      ? ""
      : group(
          concat([
            indent(
              concat([
                node.prev && needsToBorrowNextOpeningTagStartMarker(node.prev)
                  ? /**
                     *     123<a
                     *          ~
                     *       longAttr
                     *     ^^
                     */
                    hardline
                  : node.attributes.length === 1
                    ? node.attributes[0].value &&
                      node.attributes[0].value.includes("\n")
                      ? /**
                         *     <a
                         *       ~
                         *       attr="
                         *     ^^
                         *         123
                         *         456
                         *       "
                         */
                        hardline
                      : /**
                         *     <a attr="123"
                         *       ^
                         */
                        " "
                    : /**
                       *     <a attr1 attr2
                       *       ^
                       *
                       *     <a
                       *       ~
                       *       longAttr1
                       *     ^^
                       *       longAttr2
                       */
                      line,
                join(line, path.map(print, "attributes"))
              ])
            ),
            node.isSelfClosing ||
            (node.firstChild &&
              needsToBorrowParentOpeningTagEndMarker(node.firstChild)) ||
            (node.attributes.length === 1 &&
              (!node.attributes[0].value ||
                !node.attributes[0].value.includes("\n")))
              ? /**
                 *     <meta
                 *       longAttr
                 *               ~
                 *     />
                 *
                 *     <p
                 *       longAttr
                 *               ~
                 *       >123
                 *
                 *     <div longAttr>
                 *                  ~
                 */
                ""
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
  return (node.next && needsToBorrowPrevClosingTagEndMarker(node.next)) ||
    (!node.next &&
      node.parent &&
      needsToBorrowLastChildClosingTagEndMarker(node.parent))
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
    node.type === "text" &&
    node.isTrailingSpaceSensitive &&
    !node.hasTrailingSpaces &&
    node.next
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
  return node.isLeadingSpaceSensitive && !node.hasLeadingSpaces && !node.prev;
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
  return node.isLeadingSpaceSensitive && !node.hasLeadingSpaces && node.prev;
}

function needsToBorrowLastChildClosingTagEndMarker(node) {
  /**
   *     <p
   *       ><a></a
   *     ></p
   *     ^
   *     >
   */
  return (
    node.lastChild &&
    node.lastChild.isTrailingSpaceSensitive &&
    !node.lastChild.hasTrailingSpaces
  );
}

function needsToBorrowParentClosingTagStartMarker(node) {
  /**
   *     <p>
   *       123</p
   *          ^^^
   *     >
   */
  return (
    node.type === "text" &&
    node.isTrailingSpaceSensitive &&
    !node.hasTrailingSpaces &&
    !node.next
  );
}

function printOpeningTagPrefix(node) {
  return concat([
    needsToBorrowParentOpeningTagEndMarker(node)
      ? printOpeningTagEndMarker(node.parent)
      : needsToBorrowPrevClosingTagEndMarker(node)
        ? printClosingTagEndMarker(node.prev)
        : ""
  ]);
}

function printClosingTagPrefix(node) {
  return concat([
    needsToBorrowLastChildClosingTagEndMarker(node)
      ? printClosingTagEndMarker(node.lastChild)
      : ""
  ]);
}

function printClosingTagSuffix(node) {
  return concat([
    needsToBorrowParentClosingTagStartMarker(node)
      ? printClosingTagStartMarker(node.parent)
      : needsToBorrowNextOpeningTagStartMarker(node)
        ? printOpeningTagStartMarker(node.next)
        : ""
  ]);
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
