"use strict";

const embed = require("./embed");
const clean = require("./clean");
const { getLast, hasIgnoreComment } = require("../common/util");
const {
  builders: {
    concat,
    join,
    line,
    hardline,
    softline,
    literalline,
    group,
    indent,
    align,
    conditionalGroup,
    fill,
    ifBreak,
    breakParent,
    lineSuffixBoundary,
    addAlignmentToDoc,
    dedent
  },
  utils: { willBreak, isLineNext, isEmpty, removeLines },
  printer: { printDocToString }
} = require("../doc");

// http://w3c.github.io/html/single-page.html#void-elements
const voidTags = [
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
];

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
      return concat(printChildren(path, print));
    }
    case "directive": {
      return concat(["<", n.data, ">", hardline]);
    }
    case "text": {
      return n.data.replace(/\s+/g, " ").trim();
    }
    case "script":
    case "style":
    case "tag": {
      const isVoid = voidTags.indexOf(n.name) !== -1;
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

      const isScriptTag =
        ["script", "style"].indexOf(n.name.toLowerCase()) !== -1;
      const containsTag =
        n.children.filter(
          node => ["script", "style", "tag"].indexOf(node.type) !== -1
        ).length > 0;
      const containsMultipleAttributes = n.attributes.length > 1;

      let forcedBreak =
        willBreak(openingPrinted) || containsTag || containsMultipleAttributes;

      const children = printChildren(path, print);

      // Trim trailing lines (or empty strings)
      if (!isScriptTag) {
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
      }

      // Detect whether we will force this element to output over multiple lines.
      const multilineChildren = [];

      children.forEach(child => {
        multilineChildren.push(child);

        if (willBreak(child)) {
          forcedBreak = true;
        }
      });

      const printedMultilineChildren = concat([
        ["script", "style"].indexOf(n.name.toLowerCase()) === -1
          ? hardline
          : "",
        group(concat(multilineChildren), { shouldBreak: true })
      ]);

      const multiLineElem = group(
        concat([
          openingPrinted,
          n.name.toLowerCase() === "html"
            ? printedMultilineChildren
            : indent(printedMultilineChildren),
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
      return concat(["<!-- ", n.data.trim(), " -->"]);
    }
    case "attribute": {
      if (!n.value) {
        return n.key;
      }

      return concat([n.key, '="', n.value, '"']);
    }

    default:
      /* istanbul ignore next */
      throw new Error("unknown htmlparser2 type: " + n.type);
  }
}

function printOpeningPart(path, print) {
  const n = path.getValue();
  const isVoid = voidTags.indexOf(n.name) !== -1;

  // Don't break self-closing elements with no attributes
  if (isVoid && !n.attributes.length) {
    return concat(["<", n.name, " />"]);
  }

  // don't break up opening elements with a single long text attribute
  if (n.attributes && n.attributes.length === 1 && n.attributes[0].value) {
    return group(
      concat([
        "<",
        path.call(print, "name"),
        " ",
        concat(path.map(print, "attributes")),
        n.selfClosing ? " />" : ">"
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
        isVoid ? line : softline
      ]),
      isVoid ? "/>" : ">"
    ])
  );
}

function printClosingPart(path, print) {
  return concat(["</", path.call(print, "name"), ">"]);
}

function printChildren(path, print) {
  const children = [];

  path.map(childPath => {
    const child = childPath.getValue();
    const printedChild = print(childPath);

    children.push(printedChild);

    if (child.type !== "text") {
      children.push(hardline);
    }
  }, "children");

  return children;
}

module.exports = {
  print: genericPrint,
  massageAstNode: clean,
  embed,
  hasPrettierIgnore: hasIgnoreComment
};
