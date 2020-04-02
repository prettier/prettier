"use strict";

const clean = require("./clean");

const {
  concat,
  join,
  softline,
  hardline,
  line,
  group,
  indent,
  ifBreak,
} = require("../document").builders;

const {
  getNextNode,
  getPreviousNode,
  hasPrettierIgnore,
  isGlimmerComponent,
  isNextNodeOfSomeType,
  isParentOfSomeType,
  isPreviousNodeOfSomeType,
  isWhitespaceNode,
} = require("./utils");

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
  "wbr",
];

// Formatter based on @glimmerjs/syntax's built-in test formatter:
// https://github.com/glimmerjs/glimmer-vm/blob/master/packages/%40glimmer/syntax/lib/generation/print.ts

function print(path, options, print) {
  const n = path.getValue();

  /* istanbul ignore if*/
  if (!n) {
    return "";
  }

  if (hasPrettierIgnore(path)) {
    const startOffset = locationToOffset(
      options.originalText,
      n.loc.start.line - 1,
      n.loc.start.column
    );
    const endOffset = locationToOffset(
      options.originalText,
      n.loc.end.line - 1,
      n.loc.end.column
    );

    const ignoredText = options.originalText.slice(startOffset, endOffset);
    return ignoredText;
  }

  switch (n.type) {
    case "Block":
    case "Program":
    case "Template": {
      return group(concat(path.map(print, "body")));
    }
    case "ElementNode": {
      const hasChildren = n.children.length > 0;

      const hasNonWhitespaceChildren = n.children.some(
        (n) => !isWhitespaceNode(n)
      );

      const isVoid =
        (isGlimmerComponent(n) &&
          (!hasChildren || !hasNonWhitespaceChildren)) ||
        voidTags.includes(n.tag);
      const closeTagForNoBreak = isVoid ? concat([" />", softline]) : ">";
      const closeTagForBreak = isVoid ? "/>" : ">";
      const printParams = (path, print) =>
        indent(
          concat([
            n.attributes.length ? line : "",
            join(line, path.map(print, "attributes")),

            n.modifiers.length ? line : "",
            join(line, path.map(print, "modifiers")),

            n.comments.length ? line : "",
            join(line, path.map(print, "comments")),
          ])
        );

      const nextNode = getNextNode(path);

      return concat([
        group(
          concat([
            "<",
            n.tag,
            printParams(path, print),
            n.blockParams.length ? ` as |${n.blockParams.join(" ")}|` : "",
            ifBreak(softline, ""),
            ifBreak(closeTagForBreak, closeTagForNoBreak),
          ])
        ),
        !isVoid
          ? group(
              concat([
                hasNonWhitespaceChildren
                  ? indent(printChildren(path, options, print))
                  : "",
                ifBreak(hasChildren ? hardline : "", ""),
                concat(["</", n.tag, ">"]),
              ])
            )
          : "",
        nextNode && nextNode.type === "ElementNode" ? hardline : "",
      ]);
    }
    case "BlockStatement": {
      const pp = path.getParentNode(1);
      const isElseIf =
        pp &&
        pp.inverse &&
        pp.inverse.body.length === 1 &&
        pp.inverse.body[0] === n &&
        pp.inverse.body[0].path.parts[0] === "if";
      const hasElseIf =
        n.inverse &&
        n.inverse.body.length === 1 &&
        n.inverse.body[0].type === "BlockStatement" &&
        n.inverse.body[0].path.parts[0] === "if";
      const indentElse = hasElseIf ? (a) => a : indent;
      const inverseElseStatement =
        (n.inverseStrip.open ? "{{~" : "{{") +
        "else" +
        (n.inverseStrip.close ? "~}}" : "}}");
      if (n.inverse) {
        return concat([
          isElseIf
            ? concat([
                n.openStrip.open ? "{{~else " : "{{else ",
                printPathParams(path, print),
                n.openStrip.close ? "~}}" : "}}",
              ])
            : printOpenBlock(path, print, n.openStrip),
          indent(concat([hardline, path.call(print, "program")])),
          n.inverse && !hasElseIf
            ? concat([hardline, inverseElseStatement])
            : "",
          n.inverse
            ? indentElse(concat([hardline, path.call(print, "inverse")]))
            : "",
          isElseIf
            ? ""
            : concat([hardline, printCloseBlock(path, print, n.closeStrip)]),
        ]);
      } else if (isElseIf) {
        return concat([
          concat([
            n.openStrip.open ? "{{~else" : "{{else ",
            printPathParams(path, print),
            n.openStrip.close ? "~}}" : "}}",
          ]),
          indent(concat([hardline, path.call(print, "program")])),
        ]);
      }

      const hasNonWhitespaceChildren = n.program.body.some(
        (n) => !isWhitespaceNode(n)
      );

      return concat([
        printOpenBlock(path, print, n.openStrip),
        group(
          concat([
            indent(concat([softline, path.call(print, "program")])),
            hasNonWhitespaceChildren ? hardline : softline,
            printCloseBlock(path, print, n.closeStrip),
          ])
        ),
      ]);
    }
    case "ElementModifierStatement": {
      return group(
        concat(["{{", printPathParams(path, print), softline, "}}"])
      );
    }
    case "MustacheStatement": {
      const isEscaped = n.escaped === false;
      const { open: openStrip, close: closeStrip } = n.strip;
      const opening = (isEscaped ? "{{{" : "{{") + (openStrip ? "~" : "");
      const closing = (closeStrip ? "~" : "") + (isEscaped ? "}}}" : "}}");

      const leading = isParentOfSomeType(path, [
        "AttrNode",
        "ConcatStatement",
        "ElementNode",
      ])
        ? [opening, indent(softline)]
        : [opening];

      return group(
        concat([...leading, printPathParams(path, print), softline, closing])
      );
    }

    case "SubExpression": {
      const params = printParams(path, print);
      const printedParams =
        params.length > 0
          ? indent(concat([line, group(join(line, params))]))
          : "";
      return group(
        concat(["(", printPath(path, print), printedParams, softline, ")"])
      );
    }
    case "AttrNode": {
      const isText = n.value.type === "TextNode";
      const isEmptyText = isText && n.value.chars === "";

      // If the text is empty and the value's loc start and end columns are the
      // same, there is no value for this AttrNode and it should be printed
      // without the `=""`. Example: `<img data-test>` -> `<img data-test>`
      const isEmptyValue =
        isEmptyText && n.value.loc.start.column === n.value.loc.end.column;
      if (isEmptyValue) {
        return concat([n.name]);
      }
      const value = path.call(print, "value");
      const quotedValue = isText
        ? printStringLiteral(value.parts.join(), options)
        : value;
      return concat([n.name, "=", quotedValue]);
    }
    case "ConcatStatement": {
      return concat([
        '"',
        concat(
          path
            .map((partPath) => print(partPath), "parts")
            .filter((a) => a !== "")
        ),
        '"',
      ]);
    }
    case "Hash": {
      return concat([join(line, path.map(print, "pairs"))]);
    }
    case "HashPair": {
      return concat([n.key, "=", path.call(print, "value")]);
    }
    case "TextNode": {
      const maxLineBreaksToPreserve = 2;
      const isFirstElement = !getPreviousNode(path);
      const isLastElement = !getNextNode(path);
      const isWhitespaceOnly = !/\S/.test(n.chars);
      const lineBreaksCount = countNewLines(n.chars);
      const hasBlockParent = path.getParentNode(0).type === "Block";
      const hasElementParent = path.getParentNode(0).type === "ElementNode";
      const hasTemplateParent = path.getParentNode(0).type === "Template";

      let leadingLineBreaksCount = countLeadingNewLines(n.chars);
      let trailingLineBreaksCount = countTrailingNewLines(n.chars);

      if (
        (isFirstElement || isLastElement) &&
        isWhitespaceOnly &&
        (hasBlockParent || hasElementParent || hasTemplateParent)
      ) {
        return "";
      }

      if (isWhitespaceOnly && lineBreaksCount) {
        leadingLineBreaksCount = Math.min(
          lineBreaksCount,
          maxLineBreaksToPreserve
        );
        trailingLineBreaksCount = 0;
      } else {
        if (isNextNodeOfSomeType(path, ["BlockStatement", "ElementNode"])) {
          trailingLineBreaksCount = Math.max(trailingLineBreaksCount, 1);
        }

        if (
          isPreviousNodeOfSomeType(path, ["ElementNode"]) ||
          isPreviousNodeOfSomeType(path, ["BlockStatement"])
        ) {
          leadingLineBreaksCount = Math.max(leadingLineBreaksCount, 1);
        }
      }

      let leadingSpace = "";
      let trailingSpace = "";

      // preserve a space inside of an attribute node where whitespace present,
      // when next to mustache statement.
      const inAttrNode = path.stack.includes("attributes");
      if (inAttrNode) {
        const parentNode = path.getParentNode(0);
        const isConcat = parentNode.type === "ConcatStatement";
        if (isConcat) {
          const { parts } = parentNode;
          const partIndex = parts.indexOf(n);
          if (partIndex > 0) {
            const partType = parts[partIndex - 1].type;
            const isMustache = partType === "MustacheStatement";
            if (isMustache) {
              leadingSpace = " ";
            }
          }
          if (partIndex < parts.length - 1) {
            const partType = parts[partIndex + 1].type;
            const isMustache = partType === "MustacheStatement";
            if (isMustache) {
              trailingSpace = " ";
            }
          }
        }
      } else {
        if (
          trailingLineBreaksCount === 0 &&
          isNextNodeOfSomeType(path, ["MustacheStatement"])
        ) {
          trailingSpace = " ";
        }

        if (
          leadingLineBreaksCount === 0 &&
          isPreviousNodeOfSomeType(path, ["MustacheStatement"])
        ) {
          leadingSpace = " ";
        }

        if (isFirstElement) {
          leadingLineBreaksCount = 0;
          leadingSpace = "";
        }

        if (isLastElement) {
          trailingLineBreaksCount = 0;
          trailingSpace = "";
        }
      }

      return concat(
        [
          ...generateHardlines(leadingLineBreaksCount, maxLineBreaksToPreserve),
          n.chars
            .replace(/^[\s ]+/g, leadingSpace)
            .replace(/[\s ]+$/, trailingSpace),
          ...generateHardlines(
            trailingLineBreaksCount,
            maxLineBreaksToPreserve
          ),
        ].filter(Boolean)
      );
    }
    case "MustacheCommentStatement": {
      const dashes = n.value.includes("}}") ? "--" : "";
      return concat(["{{!", dashes, n.value, dashes, "}}"]);
    }
    case "PathExpression": {
      return n.original;
    }
    case "BooleanLiteral": {
      return String(n.value);
    }
    case "CommentStatement": {
      return concat(["<!--", n.value, "-->"]);
    }
    case "StringLiteral": {
      return printStringLiteral(n.value, options);
    }
    case "NumberLiteral": {
      return String(n.value);
    }
    case "UndefinedLiteral": {
      return "undefined";
    }
    case "NullLiteral": {
      return "null";
    }

    /* istanbul ignore next */
    default:
      throw new Error("unknown glimmer type: " + JSON.stringify(n.type));
  }
}

function printChildren(path, options, print) {
  return concat(
    path.map((childPath, childIndex) => {
      const childNode = path.getValue();
      const isFirstNode = childIndex === 0;
      const isLastNode =
        childIndex === path.getParentNode(0).children.length - 1;
      const isLastNodeInMultiNodeList = isLastNode && !isFirstNode;
      const isWhitespace = isWhitespaceNode(childNode);

      if (isWhitespace && isLastNodeInMultiNodeList) {
        return print(childPath, options, print);
      } else if (isFirstNode) {
        return concat([softline, print(childPath, options, print)]);
      }
      return print(childPath, options, print);
    }, "children")
  );
}

/**
 * Prints a string literal with the correct surrounding quotes based on
 * `options.singleQuote` and the number of escaped quotes contained in
 * the string literal. This function is the glimmer equivalent of `printString`
 * in `common/util`, but has differences because of the way escaped characters
 * are treated in hbs string literals.
 * @param {string} stringLiteral - the string literal value
 * @param {object} options - the prettier options object
 */
function printStringLiteral(stringLiteral, options) {
  const double = { quote: '"', regex: /"/g };
  const single = { quote: "'", regex: /'/g };

  const preferred = options.singleQuote ? single : double;
  const alternate = preferred === single ? double : single;

  let shouldUseAlternateQuote = false;

  // If `stringLiteral` contains at least one of the quote preferred for
  // enclosing the string, we might want to enclose with the alternate quote
  // instead, to minimize the number of escaped quotes.
  if (
    stringLiteral.includes(preferred.quote) ||
    stringLiteral.includes(alternate.quote)
  ) {
    const numPreferredQuotes = (stringLiteral.match(preferred.regex) || [])
      .length;
    const numAlternateQuotes = (stringLiteral.match(alternate.regex) || [])
      .length;

    shouldUseAlternateQuote = numPreferredQuotes > numAlternateQuotes;
  }

  const enclosingQuote = shouldUseAlternateQuote ? alternate : preferred;
  const escapedStringLiteral = stringLiteral.replace(
    enclosingQuote.regex,
    `\\${enclosingQuote.quote}`
  );

  return concat([
    enclosingQuote.quote,
    escapedStringLiteral,
    enclosingQuote.quote,
  ]);
}

function printPath(path, print) {
  return path.call(print, "path");
}

function printParams(path, print) {
  const node = path.getValue();
  let parts = [];

  if (node.params.length > 0) {
    parts = parts.concat(path.map(print, "params"));
  }

  if (node.hash && node.hash.pairs.length > 0) {
    parts.push(path.call(print, "hash"));
  }
  return parts;
}

function printPathParams(path, print) {
  const printedPath = printPath(path, print);
  const printedParams = printParams(path, print);

  const parts = [printedPath, ...printedParams];

  return indent(group(join(line, parts)));
}

function printBlockParams(path) {
  const block = path.getValue();
  if (!block.program || !block.program.blockParams.length) {
    return "";
  }
  return concat([" as |", block.program.blockParams.join(" "), "|"]);
}

function printOpenBlock(
  path,
  print,
  { open: isOpenStrip = false, close: isCloseStrip = false } = {}
) {
  return group(
    concat([
      isOpenStrip ? "{{~#" : "{{#",
      printPathParams(path, print),
      printBlockParams(path),
      softline,
      isCloseStrip ? "~}}" : "}}",
    ])
  );
}

function printCloseBlock(
  path,
  print,
  { open: isOpenStrip = false, close: isCloseStrip = false } = {}
) {
  return concat([
    isOpenStrip ? "{{~/" : "{{/",
    path.call(print, "path"),
    isCloseStrip ? "~}}" : "}}",
  ]);
}

function countNewLines(string) {
  /* istanbul ignore next */
  string = typeof string === "string" ? string : "";
  return string.split("\n").length - 1;
}

function countLeadingNewLines(string) {
  /* istanbul ignore next */
  string = typeof string === "string" ? string : "";
  const newLines = (string.match(/^([^\S\r\n]*[\r\n])+/g) || [])[0] || "";
  return countNewLines(newLines);
}

function countTrailingNewLines(string) {
  /* istanbul ignore next */
  string = typeof string === "string" ? string : "";
  const newLines = (string.match(/([\r\n][^\S\r\n]*)+$/g) || [])[0] || "";
  return countNewLines(newLines);
}

function generateHardlines(number = 0, max = 0) {
  return new Array(Math.min(number, max)).fill(hardline);
}

/* istanbul ignore next
   https://github.com/glimmerjs/glimmer-vm/blob/master/packages/%40glimmer/compiler/lib/location.ts#L5-L29
*/
function locationToOffset(source, line, column) {
  let seenLines = 0;
  let seenChars = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (seenChars === source.length) {
      return null;
    }

    let nextLine = source.indexOf("\n", seenChars);
    if (nextLine === -1) {
      nextLine = source.length;
    }

    if (seenLines === line) {
      if (seenChars + column > nextLine) {
        return null;
      }
      return seenChars + column;
    } else if (nextLine === -1) {
      return null;
    }
    seenLines += 1;
    seenChars = nextLine + 1;
  }
}

module.exports = {
  print,
  massageAstNode: clean,
};
