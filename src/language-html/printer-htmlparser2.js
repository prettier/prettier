"use strict";

const embed = require("./embed");
const clean = require("./clean");
const { getLast, hasIgnoreComment } = require("../common/util");
const { isNextLineEmpty } = require("../common/util-shared");
const {
  builders: {
    concat,
    line,
    hardline,
    softline,
    group,
    indent,
    conditionalGroup,
    dedentToRoot
  },
  utils: { willBreak, isLineNext, isEmpty }
} = require("../doc");

function genericPrint(path, options, print) {
  const n = path.getValue();
  if (!n) {
    return "";
  }

  if (typeof n === "string") {
    return n;
  }

  switch (n.type) {
    case "root": {
      return concat(printChildren(path, print, options));
    }
    case "directive": {
      return concat([
        "<",
        n.data.replace('!DOCTYPE html ""', "!DOCTYPE html"),
        ">",
        hardline
      ]);
    }
    case "text": {
      const parentNode = path.getParentNode();

      if (
        parentNode &&
        (isPreTagNode(parentNode) || isTextAreaTagNode(parentNode))
      ) {
        return n.data;
      }

      return n.data.replace(/\s+/g, " ").trim();
    }
    case "script":
    case "style":
    case "tag": {
      const isVoid = isVoidTagNode(n);
      const openingPrinted = printOpeningPart(path, print);

      // Print self closing tag
      if (isVoid) {
        return concat([openingPrinted]);
      }

      const closingPrinted = printClosingPart(path, print);
      const hasChildren = n.children.length > 0;

      // Print tags without children
      if (!hasChildren) {
        return concat([openingPrinted, closingPrinted]);
      }

      const children = printChildren(path, print, options);

      // NOTE: If the next token is a U+000A LINE FEED (LF) character token, then ignore that token and move
      // on to the next one. (Newlines at the start of textarea elements are ignored as an authoring convenience.)
      if (isPreTagNode(n) || isTextAreaTagNode(n)) {
        const originalTagContent = options.originalText.slice(
          n.sourceCodeLocation.startTag.endOffset,
          n.sourceCodeLocation.endTag.startOffset
        );
        const hasNewlineAfterTag = /^(\r\n|\r|\n)/.test(originalTagContent);

        return dedentToRoot(
          group(
            concat([
              openingPrinted,
              hasNewlineAfterTag ? hardline : "",
              concat(children),
              closingPrinted
            ])
          )
        );
      }

      const isScriptTag = isScriptTagNode(n);

      if (isScriptTag) {
        return group(
          concat([openingPrinted, concat(children), closingPrinted])
        );
      }

      const containsTag =
        n.children.filter(
          node => ["script", "style", "tag"].indexOf(node.type) !== -1
        ).length > 0;
      const containsMultipleAttributes = n.attributes.length > 1;

      let forcedBreak =
        willBreak(openingPrinted) || containsTag || containsMultipleAttributes;

      // Trim trailing lines (or empty strings)
      while (
        children.length &&
        (isLineNext(getLast(children)) || isEmpty(getLast(children)))
      ) {
        children.pop();
      }

      // Trim leading lines (or empty strings)
      while (
        children.length &&
        (isLineNext(children[0]) || isEmpty(children[0])) &&
        (isLineNext(children[1]) || isEmpty(children[1]))
      ) {
        children.shift();
        children.shift();
      }

      // Detect whether we will force this element to output over multiple lines.
      const multilineChildren = [];

      children.forEach(child => {
        multilineChildren.push(child);

        if (willBreak(child)) {
          forcedBreak = true;
        }
      });

      const containsOnlyEmptyTextNodes = n.children.every(node => {
        return node.type === "text" && /^\s+$/.test(node.data);
      });

      const printedMultilineChildren = concat([
        !isScriptTag && !containsOnlyEmptyTextNodes ? hardline : "",
        group(concat(multilineChildren), { shouldBreak: true })
      ]);

      const multiLineElem = group(
        concat([
          openingPrinted,
          indent(printedMultilineChildren),
          hardline,
          closingPrinted
        ])
      );

      if (forcedBreak) {
        return multiLineElem;
      }

      return conditionalGroup([
        group(concat([openingPrinted, concat(children), closingPrinted])),
        multiLineElem
      ]);
    }
    case "comment": {
      return concat(["<!--", n.data, "-->"]);
    }
    case "attribute": {
      if (!n.value) {
        if (isBooleanAttributeNode(n)) {
          return n.key;
        }

        const parentNode = path.getParentNode();

        if (!parentNode || !parentNode.sourceCodeLocation) {
          return n.key;
        }

        const attributeSourceCodeLocation =
          parentNode.sourceCodeLocation.attrs[n.key];
        const originalAttributeSourceCode = options.originalText.slice(
          attributeSourceCodeLocation.startOffset,
          attributeSourceCodeLocation.endOffset
        );
        const hasEqualSign = originalAttributeSourceCode.indexOf("=") !== -1;

        return hasEqualSign ? concat([n.key, '=""']) : n.key;
      }

      return concat([n.key, '="', n.value.replace(/"/g, "&quot;"), '"']);
    }

    default:
      /* istanbul ignore next */
      throw new Error("unknown htmlparser2 type: " + n.type);
  }
}

function isBooleanAttributeNode(node) {
  return (
    node.type === "attribute" &&
    [
      "allowfullscreen",
      "allowpaymentrequest",
      "async",
      "autofocus",
      "autoplay",
      "checked",
      "controls",
      "default",
      "defer",
      "disabled",
      "formnovalidate",
      "hidden",
      "ismap",
      "itemscope",
      "loop",
      "multiple",
      "muted",
      "nomodule",
      "novalidate",
      "open",
      "readonly",
      "required",
      "reversed",
      "selected",
      "typemustmatch"
    ].indexOf(node.key) !== -1
  );
}

// http://w3c.github.io/html/single-page.html#void-elements
function isVoidTagNode(node) {
  return (
    node.type === "tag" &&
    [
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr"
    ].indexOf(node.name) !== -1
  );
}

function isPreTagNode(node) {
  return node.type === "tag" && node.name === "pre";
}

function isTextAreaTagNode(node) {
  return node.type === "tag" && node.name === "textarea";
}

function isScriptTagNode(node) {
  return (
    (node.type === "script" || node.type === "style") &&
    ["script", "style"].indexOf(node.name) !== -1
  );
}

function printOpeningPart(path, print) {
  const n = path.getValue();
  const isVoid = isVoidTagNode(n);

  // Don't break self-closing elements with no attributes
  if (isVoid && !n.attributes.length) {
    return concat(["<", n.name, ">"]);
  }

  // Don't break up opening elements with a single long text attribute
  if (n.attributes && n.attributes.length === 1 && n.attributes[0].value) {
    return group(
      concat([
        "<",
        path.call(print, "name"),
        " ",
        concat(path.map(print, "attributes")),
        ">"
      ])
    );
  }

  return group(
    concat([
      "<",
      n.name,
      concat([
        indent(
          concat(path.map(attr => concat([line, print(attr)]), "attributes"))
        ),
        softline
      ]),
      ">"
    ])
  );
}

function printClosingPart(path, print) {
  return concat(["</", path.call(print, "name"), ">"]);
}

function printChildren(path, print, options) {
  const parts = [];

  path.map((childPath, i) => {
    const parentNode = childPath.getParentNode();
    const child = childPath.getValue();
    const printedChild = print(childPath);

    if (
      parentNode &&
      parentNode.children[i - 2] &&
      parentNode.children[i - 2].type === "comment" &&
      parentNode.children[i - 2].data.trim() === "prettier-ignore"
    ) {
      parts.push(
        options.originalText.slice(
          options.locStart(child),
          options.locEnd(child)
        )
      );
    } else {
      parts.push(printedChild);
    }

    if (child.type !== "text" && child.type !== "directive") {
      parts.push(hardline);
    }

    if (isNextLineEmpty(options.originalText, childPath.getValue(), options)) {
      parts.push(hardline);
    }
  }, "children");

  return parts;
}

module.exports = {
  print: genericPrint,
  massageAstNode: clean,
  embed,
  hasPrettierIgnore: hasIgnoreComment
};
