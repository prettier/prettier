"use strict";

const embed = require("./embed");
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
    softline
  }
} = require("../doc");
const { hasPrettierIgnore, replaceNewlines } = require("./utils");
const preprocess = require("./preprocess");
const dedentString = require("dedent");
const assert = require("assert");

// TODO: embed
// TODO: parse ie comment
// TODO: next empty line
// TODO: ignore
// TODO: sophisticated rule (CSS: display, white-space)

function genericPrint(path, options, print) {
  const node = path.getValue();
  switch (node.type) {
    case "root":
      return concat([printChildren(path, options, print), hardline]);
    case "tag":
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
                ? node.hasDanglingSpaces
                  ? /**
                     *     <p>
                     *     </p>
                     *     ~
                     * */
                    softline
                  : ""
                : concat([
                    indent(printChildren(path, options, print)),
                    softline
                  ])
          ])
        ),
        group(printClosingTag(node))
      ]);
    case "text":
      return concat([
        printOpeningTagPrefix(node),
        node.data.replace(/\s+/g, " "),
        printClosingTagSuffix(node)
      ]);
    case "comment":
    case "directive": {
      const data = node.data.includes("\n")
        ? dedentString(node.data.trimRight())
        : node.data;
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
                        concat(replaceNewlines(data.trim(), hardline))
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
                        node.type === "directive" ? "" : softline,
                        concat(replaceNewlines(data, hardline))
                      ])
                ),
            node.type === "directive" ? "" : softline
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
        (childNode.prev.type === "yaml" || childNode.prev.type === "toml")
          ? hardline
          : "", // TODO next empty line
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
    node.attributes.length === 0
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
                    ? /**
                       *     <a attr
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
              needsToBorrowParentOpeningTagEndMarker(node.firstChild))
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
    printClosingTagEnd(node),
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

function hasSpacesBeforeOpeningTag(node) {
  return node.hasLeadingSpaces || (!node.prev && node.parent.type === "root");
}

function hasSpacesAfterClosingTag(node) {
  return node.hasTrailingSpaces || (!node.next && node.parent.type === "root");
}

function needsToBorrowNextOpeningTagStartMarker(node) {
  /**
   *     123<p
   *        ^^
   *     >
   */
  return node.type === "text" && !hasSpacesAfterClosingTag(node) && node.next;
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
  return !hasSpacesBeforeOpeningTag(node) && !node.prev;
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
  return !hasSpacesBeforeOpeningTag(node) && node.prev;
}

function needsToBorrowLastChildClosingTagEndMarker(node) {
  /**
   *     <p
   *       ><a></a
   *     ></p
   *     ^
   *     >
   */
  return node.lastChild && !hasSpacesAfterClosingTag(node.lastChild);
}

function needsToBorrowParentClosingTagStartMarker(node) {
  /**
   *     <p>
   *       123</p
   *          ^^^
   *     >
   */
  return node.type === "text" && !hasSpacesAfterClosingTag(node) && !node.next;
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
    default:
      return `<${node.name}`;
  }
}

function printOpeningTagEndMarker(node) {
  assert(!node.isSelfClosing);
  return ">";
}

function printClosingTagStartMarker(node) {
  assert(!node.isSelfClosing);
  return `</${node.name}`;
}

function printClosingTagEndMarker(node) {
  switch (node.type) {
    case "comment":
      return "-->";
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
