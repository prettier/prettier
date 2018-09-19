"use strict";

const embed = require("./embed");
const clean = require("./clean");
const { getLast } = require("../common/util");
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
const {
  hasPrettierIgnore,
  isBooleanAttributeNode,
  isPreTagNode,
  isScriptTagNode,
  isTextAreaTagNode,
  isVoidTagNode,
  isWhitespaceOnlyText
} = require("./utils");

function genericPrint(path, options, print) {
  const n = path.getValue();

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

      if (isPreTagNode(parentNode) || isTextAreaTagNode(parentNode)) {
        return n.data;
      }

      return n.data.replace(/\s+/g, " ").trim();
    }
    case "script":
    case "style":
    case "tag": {
      const isVoid = isVoidTagNode(n);
      const openingPrinted = printOpeningTag(path, print, isVoid);

      // Print self closing tag
      if (isVoid) {
        return openingPrinted;
      }

      const closingPrinted = printClosingTag(n);

      // Print tags without children
      if (n.children.length === 0) {
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

      const containsTag = n.children.some(
        child => ["script", "style", "tag"].indexOf(child.type) !== -1
      );

      let forcedBreak =
        willBreak(openingPrinted) || containsTag || n.attributes.length > 1;

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
        (isLineNext(children[0]) || isEmpty(children[0]))
      ) {
        children.shift();
      }

      // Detect whether we will force this element to output over multiple lines.
      if (children.some(doc => willBreak(doc))) {
        forcedBreak = true;
      }

      const containsOnlyEmptyTextNodes = n.children.every(isWhitespaceOnlyText);

      const printedMultilineChildren = concat([
        !isScriptTag && !containsOnlyEmptyTextNodes ? hardline : "",
        group(concat(children), { shouldBreak: true })
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

        const originalAttributeSourceCode = options.originalText.slice(
          n.sourceCodeLocation.startOffset,
          n.sourceCodeLocation.endOffset
        );
        const hasEqualSign = originalAttributeSourceCode.indexOf("=") !== -1;

        return hasEqualSign ? concat([n.key, '=""']) : n.key;
      }

      return concat([n.key, '="', n.value.replace(/"/g, "&quot;"), '"']);
    }
    // front matter
    case "yaml":
    case "toml":
      return concat([n.raw, hardline]);
    default:
      /* istanbul ignore next */
      throw new Error("unknown htmlparser2 type: " + n.type);
  }
}

function printOpeningTag(path, print, isVoid) {
  const n = path.getValue();

  // Don't break self-closing elements with no attributes
  if (isVoid && !n.attributes.length) {
    return concat(["<", n.name, " />"]);
  }

  // Don't break up opening elements with a single long text attribute
  if (n.attributes && n.attributes.length === 1 && n.attributes[0].value) {
    return group(
      concat(["<", n.name, " ", concat(path.map(print, "attributes")), ">"])
    );
  }

  return group(
    concat([
      "<",
      n.name,
      indent(
        concat(path.map(attr => concat([line, print(attr)]), "attributes"))
      ),
      isVoid ? concat([line, "/>"]) : concat([softline, ">"])
    ])
  );
}

function printClosingTag(node) {
  return concat(["</", node.name, ">"]);
}

function printChildren(path, print, options) {
  const parts = [];

  path.map(childPath => {
    const child = childPath.getValue();

    parts.push(print(childPath));

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
  hasPrettierIgnore
};
