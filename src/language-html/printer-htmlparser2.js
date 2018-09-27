"use strict";

const embed = require("./embed");
const clean = require("./clean");
const {
  builders: {
    breakParent,
    concat,
    dedentToRoot,
    group,
    hardline,
    ifBreak,
    indent,
    join,
    line,
    softline
  }
} = require("../doc");
const { hasPrettierIgnore, isWhitespaceSensitiveTagNode } = require("./utils");
const preprocess = require("./preprocess");

function genericPrint(path, options, print) {
  const node = path.getValue();

  switch (node.type) {
    case "root":
      return node.children.length === 0
        ? ""
        : concat([printChildren(path, print, options), hardline]);
    case "directive":
      return concat([
        "<",
        node.name === "!doctype"
          ? node.data
              .replace(/\s+/g, " ")
              .replace(
                /^(!doctype)(( html)?)/i,
                (_, doctype, doctypeHtml) =>
                  doctype.toUpperCase() + doctypeHtml.toLowerCase()
              )
          : node.data,
        ">"
      ]);
    case "text": {
      const parentNode = path.getParentNode();

      if (isWhitespaceSensitiveTagNode(parentNode)) {
        return concat(
          node.data
            .split(/(\n)/g)
            .map((x, i) => (i % 2 === 1 ? dedentToRoot(hardline) : x))
        );
      }

      return node.data.replace(/\s+/g, " ").trim();
    }
    case "script":
    case "style":
    case "tag": {
      const openingTagDoc = printOpeningTag(path, options, print);

      if (node.isSelfClosing) {
        return group(openingTagDoc);
      }

      const closingTagDoc = printClosingTag(node);

      if (node.children.length === 0) {
        return group(
          concat([
            openingTagDoc,
            node.type === "script" && node.attribs.src
              ? /**
                 * <script
                 *   src="long-long-long-long-long-long-long-long-long-long-long-long-long-long-string"
                 *   async
                 * ></script>
                 */
                ""
              : /**
                 * <div
                 *   class="long-long-long-long-long-long-long-long-long-long-long-long-long-long-string"
                 *   something="something"
                 * >
                 * </div>
                 */
                softline,
            closingTagDoc
          ])
        );
      }

      if (isWhitespaceSensitiveTagNode(node)) {
        return concat([
          group(openingTagDoc),
          printChildren(path, print, options),
          closingTagDoc
        ]);
      }

      return group(
        concat([
          group(openingTagDoc),
          node.attributes.length > 1 ||
          node.children.some(childNode => childNode.type !== "text")
            ? breakParent
            : "",
          indent(concat([softline, printChildren(path, print, options)])),
          softline,
          closingTagDoc
        ])
      );
    }
    case "comment":
      return concat(["<!--", node.data, "-->"]);
    case "attribute":
      return node.value === null
        ? node.key
        : concat([
            node.key,
            '="',
            node.value.replace(/"/g, "&quot;"),
            '"',
            node.value.includes("\n") ? breakParent : ""
          ]);
    // front matter
    case "yaml":
    case "toml":
      return node.raw;
    default:
      /* istanbul ignore next */
      throw new Error("unknown htmlparser2 type: " + node.type);
  }
}

function printOpeningTag(path, options, print) {
  const node = path.getValue();

  const forceSingeLine =
    node.attributes.length === 0 ||
    (node.attributes.length === 1 &&
      (!node.attributes[0].value || !node.attributes[0].value.includes("\n")));

  return concat([
    "<",
    node.name,
    indent(
      concat([
        forceSingeLine ? (node.attributes.length === 0 ? "" : " ") : line,
        join(line, path.map(print, "attributes"))
      ])
    ),
    forceSingeLine
      ? node.isSelfClosing
        ? " />"
        : ">"
      : concat([
          softline,
          node.isSelfClosing ? concat([ifBreak("", " "), "/>"]) : ">"
        ])
  ]);
}

function printClosingTag(node) {
  return concat(["</", node.name, ">"]);
}

function printChildren(path, print /*, options*/) {
  const parts = [];

  const node = path.getValue();

  path.map((childPath, index) => {
    const childNode = childPath.getValue();

    parts.push(print(childPath));

    if (index !== node.children.length - 1) {
      parts.push(hardline);

      if (
        childNode.type === "yaml" ||
        childNode.type === "toml" ||
        // next empty line
        (childNode.type !== "text" &&
          childNode.type !== "directive" &&
          node.children[index + 1].startLocation.line -
            childNode.endLocation.line >
            1)
      ) {
        parts.push(hardline);
      }
    }
  }, "children");

  return concat(parts);
}

module.exports = {
  preprocess,
  print: genericPrint,
  massageAstNode: clean,
  embed,
  hasPrettierIgnore
};
