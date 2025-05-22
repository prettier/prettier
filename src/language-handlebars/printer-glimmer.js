import {
  dedent,
  fill,
  group,
  hardline,
  ifBreak,
  indent,
  join,
  line,
  softline,
} from "../document/builders.js";
import { replaceEndOfLine } from "../document/utils.js";
import getPreferredQuote from "../utils/get-preferred-quote.js";
import htmlWhitespaceUtils from "../utils/html-whitespace-utils.js";
import isNonEmptyArray from "../utils/is-non-empty-array.js";
import UnexpectedNodeError from "../utils/unexpected-node-error.js";
import clean from "./clean.js";
import embed from "./embed.js";
import getVisitorKeys from "./get-visitor-keys.js";
import { locEnd, locStart } from "./loc.js";
import { hasPrettierIgnore, isVoidElement, isWhitespaceNode } from "./utils.js";

/**
 * @import {Doc} from "../document/builders.js"
 */

const NEWLINES_TO_PRESERVE_MAX = 2;

// Formatter based on @glimmerjs/syntax's built-in test formatter:
// https://github.com/glimmerjs/glimmer-vm/blob/master/packages/%40glimmer/syntax/lib/generation/print.ts

function print(path, options, print) {
  const { node } = path;

  switch (node.type) {
    case "Block":
    case "Program":
    case "Template":
      return group(path.map(print, "body"));

    case "ElementNode": {
      const startingTag = group(printStartingTag(path, print));

      const escapeNextElementNode =
        options.htmlWhitespaceSensitivity === "ignore" &&
        path.next?.type === "ElementNode"
          ? softline
          : "";

      if (isVoidElement(node)) {
        return [startingTag, escapeNextElementNode];
      }

      const endingTag = ["</", node.tag, ">"];

      if (node.children.length === 0) {
        return [startingTag, indent(endingTag), escapeNextElementNode];
      }

      if (options.htmlWhitespaceSensitivity === "ignore") {
        return [
          startingTag,
          indent(printChildren(path, options, print)),
          hardline,
          indent(endingTag),
          escapeNextElementNode,
        ];
      }

      return [
        startingTag,
        indent(group(printChildren(path, options, print))),
        indent(endingTag),
        escapeNextElementNode,
      ];
    }

    case "BlockStatement":
      if (isElseIfLike(path)) {
        return [
          printElseIfLikeBlock(path, print),
          printProgram(path, options, print),
          printInverse(path, options, print),
        ];
      }

      return [
        printOpenBlock(path, print),
        group([
          printProgram(path, options, print),
          printInverse(path, options, print),
          printCloseBlock(path, options, print),
        ]),
      ];

    case "ElementModifierStatement":
      return group(["{{", printPathAndParams(path, print), "}}"]);

    case "MustacheStatement":
      return group([
        printOpeningMustache(node),
        printPathAndParams(path, print),
        printClosingMustache(node),
      ]);

    case "SubExpression":
      return group([
        "(",
        printSubExpressionPathAndParams(path, print),
        softline,
        ")",
      ]);

    case "AttrNode": {
      const { name, value } = node;
      const isText = value.type === "TextNode";
      const isEmptyText = isText && value.chars === "";

      // If the text is empty and the value's loc start and end offsets are the
      // same, there is no value for this AttrNode and it should be printed
      // without the `=""`. Example: `<img data-test>` -> `<img data-test>`
      if (isEmptyText && locStart(value) === locEnd(value)) {
        return name;
      }

      // Let's assume quotes inside the content of text nodes are already
      // properly escaped with entities, otherwise the parse wouldn't have parsed them.
      const quote = isText
        ? getPreferredQuote(value.chars, options.singleQuote)
        : value.type === "ConcatStatement"
          ? getPreferredQuote(
              value.parts
                .map((part) => (part.type === "TextNode" ? part.chars : ""))
                .join(""),
              options.singleQuote,
            )
          : "";

      const valueDoc = print("value");

      return [
        name,
        "=",
        quote,
        name === "class" && quote ? group(indent(valueDoc)) : valueDoc,
        quote,
      ];
    }

    case "ConcatStatement":
      return path.map(print, "parts");

    case "Hash":
      return join(line, path.map(print, "pairs"));

    case "HashPair":
      return [node.key, "=", print("value")];

    case "TextNode": {
      // Don't format content:
      // 1. in `<pre>`,
      // 2. in `<style>`

      if (path.parent.tag === "pre" || path.parent.tag === "style") {
        return node.chars;
      }

      /* if `{{my-component}}` (or any text containing "{{")
       * makes it to the TextNode, it means it was escaped,
       * so let's print it escaped, ie.; `\{{my-component}}` */
      let text = node.chars.replaceAll("{{", String.raw`\{{`);

      const attrName = getCurrentAttributeName(path);

      if (attrName) {
        // TODO: format style and srcset attributes
        if (attrName === "class") {
          const formattedClasses = text.trim().split(/\s+/u).join(" ");

          let leadingSpace = false;
          let trailingSpace = false;

          if (path.parent.type === "ConcatStatement") {
            if (
              path.previous?.type === "MustacheStatement" &&
              /^\s/u.test(text)
            ) {
              leadingSpace = true;
            }
            if (
              path.next?.type === "MustacheStatement" &&
              /\s$/u.test(text) &&
              formattedClasses !== ""
            ) {
              trailingSpace = true;
            }
          }

          return [
            leadingSpace ? line : "",
            formattedClasses,
            trailingSpace ? line : "",
          ];
        }

        return replaceEndOfLine(text);
      }

      const isWhitespaceOnly = htmlWhitespaceUtils.isWhitespaceOnly(text);
      const { isFirst, isLast } = path;

      if (options.htmlWhitespaceSensitivity !== "ignore") {
        // let's remove the file's final newline
        // https://github.com/ember-cli/ember-new-output/blob/1a04c67ddd02ccb35e0ff41bb5cbce34b31173ef/.editorconfig#L16
        const shouldTrimTrailingNewlines =
          isLast && path.parent.type === "Template";
        const shouldTrimLeadingNewlines =
          isFirst && path.parent.type === "Template";

        if (isWhitespaceOnly) {
          if (shouldTrimLeadingNewlines || shouldTrimTrailingNewlines) {
            return "";
          }

          let breaks = [line];

          const newlines = countNewLines(text);
          if (newlines) {
            breaks = generateHardlines(newlines);
          }

          if (isLast) {
            breaks = breaks.map((newline) => dedent(newline));
          }

          return breaks;
        }

        const leadingWhitespace =
          htmlWhitespaceUtils.getLeadingWhitespace(text);

        let leadBreaks = [];
        if (leadingWhitespace) {
          leadBreaks = [line];

          const leadingNewlines = countNewLines(leadingWhitespace);
          if (leadingNewlines) {
            leadBreaks = generateHardlines(leadingNewlines);
          }

          text = text.slice(leadingWhitespace.length);
        }

        const tailingWhitespace =
          htmlWhitespaceUtils.getTrailingWhitespace(text);
        let trailBreaks = [];
        if (tailingWhitespace) {
          if (!shouldTrimTrailingNewlines) {
            trailBreaks = [line];

            const trailingNewlines = countNewLines(tailingWhitespace);
            if (trailingNewlines) {
              trailBreaks = generateHardlines(trailingNewlines);
            }

            if (isLast) {
              trailBreaks = trailBreaks.map((hardline) => dedent(hardline));
            }
          }

          text = text.slice(0, -tailingWhitespace.length);
        }

        return [...leadBreaks, fill(getTextValueParts(text)), ...trailBreaks];
      }

      const lineBreaksCount = countNewLines(text);

      let leadingLineBreaksCount = countLeadingNewLines(text);
      let trailingLineBreaksCount = countTrailingNewLines(text);

      if (
        (isFirst || isLast) &&
        isWhitespaceOnly &&
        (path.parent.type === "Block" ||
          path.parent.type === "ElementNode" ||
          path.parent.type === "Template")
      ) {
        return "";
      }

      if (isWhitespaceOnly && lineBreaksCount) {
        leadingLineBreaksCount = Math.min(
          lineBreaksCount,
          NEWLINES_TO_PRESERVE_MAX,
        );
        trailingLineBreaksCount = 0;
      } else {
        if (
          path.next?.type === "BlockStatement" ||
          path.next?.type === "ElementNode"
        ) {
          trailingLineBreaksCount = Math.max(trailingLineBreaksCount, 1);
        }

        if (
          path.previous?.type === "BlockStatement" ||
          path.previous?.type === "ElementNode"
        ) {
          leadingLineBreaksCount = Math.max(leadingLineBreaksCount, 1);
        }
      }

      let leadingSpace = "";
      let trailingSpace = "";

      if (
        trailingLineBreaksCount === 0 &&
        path.next?.type === "MustacheStatement"
      ) {
        trailingSpace = " ";
      }

      if (
        leadingLineBreaksCount === 0 &&
        path.previous?.type === "MustacheStatement"
      ) {
        leadingSpace = " ";
      }

      if (isFirst) {
        leadingLineBreaksCount = 0;
        leadingSpace = "";
      }

      if (isLast) {
        trailingLineBreaksCount = 0;
        trailingSpace = "";
      }

      if (htmlWhitespaceUtils.hasLeadingWhitespace(text)) {
        text = leadingSpace + htmlWhitespaceUtils.trimStart(text);
      }

      if (htmlWhitespaceUtils.hasTrailingWhitespace(text)) {
        text = htmlWhitespaceUtils.trimEnd(text) + trailingSpace;
      }

      return [
        ...generateHardlines(leadingLineBreaksCount),
        fill(getTextValueParts(text)),
        ...generateHardlines(trailingLineBreaksCount),
      ];
    }
    case "MustacheCommentStatement": {
      const start = locStart(node);
      const end = locEnd(node);
      // Starts with `{{~`
      const isLeftWhiteSpaceSensitive =
        options.originalText.charAt(start + 2) === "~";
      // Ends with `{{~`
      const isRightWhitespaceSensitive =
        options.originalText.charAt(end - 3) === "~";

      const dashes = node.value.includes("}}") ? "--" : "";
      return [
        "{{",
        isLeftWhiteSpaceSensitive ? "~" : "",
        "!",
        dashes,
        node.value,
        dashes,
        isRightWhitespaceSensitive ? "~" : "",
        "}}",
      ];
    }
    case "PathExpression":
      return printPathExpression(node);

    case "BooleanLiteral":
      return String(node.value);

    case "CommentStatement":
      return ["<!--", node.value, "-->"];

    case "StringLiteral":
      return printStringLiteral(path, options);

    case "NumberLiteral":
      return String(node.value);

    case "UndefinedLiteral":
      return "undefined";

    case "NullLiteral":
      return "null";

    case "AtHead": // Handled in `printPathExpression`
    case "VarHead": // Handled in `printPathExpression`
    case "ThisHead": // Handled in `printPathExpression`
    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "Handlebars");
  }
}

/* ElementNode print helpers */

function sortByLoc(a, b) {
  return locStart(a) - locStart(b);
}

function printStartingTag(path, print) {
  const { node } = path;

  const types = ["attributes", "modifiers", "comments"].filter((property) =>
    isNonEmptyArray(node[property]),
  );
  const attributes = types.flatMap((type) => node[type]).sort(sortByLoc);

  for (const attributeType of types) {
    path.each(({ node }) => {
      const index = attributes.indexOf(node);
      attributes.splice(index, 1, [line, print()]);
    }, attributeType);
  }

  if (isNonEmptyArray(node.blockParams)) {
    attributes.push(line, printBlockParams(node));
  }

  return ["<", node.tag, indent(attributes), printStartingTagEndMarker(node)];
}

function printChildren(path, options, print) {
  const { node } = path;
  const isEmpty = node.children.every((node) => isWhitespaceNode(node));
  if (options.htmlWhitespaceSensitivity === "ignore" && isEmpty) {
    return "";
  }

  return path.map(({ isFirst }) => {
    const printedChild = print();

    if (isFirst && options.htmlWhitespaceSensitivity === "ignore") {
      return [softline, printedChild];
    }

    return printedChild;
  }, "children");
}

function printStartingTagEndMarker(node) {
  if (isVoidElement(node)) {
    return ifBreak([softline, "/>"], [" />", softline]);
  }

  return ifBreak([softline, ">"], ">");
}

/* MustacheStatement print helpers */

function printOpeningMustache(node) {
  const mustache = node.trusting ? "{{{" : "{{";
  const strip = node.strip?.open ? "~" : "";
  return [mustache, strip];
}

function printClosingMustache(node) {
  const mustache = node.trusting ? "}}}" : "}}";
  const strip = node.strip?.close ? "~" : "";
  return [strip, mustache];
}

/* BlockStatement print helpers */

function printOpeningBlockOpeningMustache(node) {
  const opening = printOpeningMustache(node);
  const strip = node.openStrip.open ? "~" : "";
  return [opening, strip, "#"];
}

function printOpeningBlockClosingMustache(node) {
  const closing = printClosingMustache(node);
  const strip = node.openStrip.close ? "~" : "";
  return [strip, closing];
}

function printClosingBlockOpeningMustache(node) {
  const opening = printOpeningMustache(node);
  const strip = node.closeStrip.open ? "~" : "";
  return [opening, strip, "/"];
}

function printClosingBlockClosingMustache(node) {
  const closing = printClosingMustache(node);
  const strip = node.closeStrip.close ? "~" : "";
  return [strip, closing];
}

function printInverseBlockOpeningMustache(node) {
  const opening = printOpeningMustache(node);
  const strip = node.inverseStrip.open ? "~" : "";
  return [opening, strip];
}

function printInverseBlockClosingMustache(node) {
  const closing = printClosingMustache(node);
  const strip = node.inverseStrip.close ? "~" : "";
  return [strip, closing];
}

function printOpenBlock(path, print) {
  const { node } = path;
  /** @type {Doc[]} */
  const parts = [];

  const paramsDoc = printParams(path, print);
  if (paramsDoc) {
    parts.push(group(paramsDoc));
  }

  if (isNonEmptyArray(node.program.blockParams)) {
    parts.push(printBlockParams(node.program));
  }

  return group([
    printOpeningBlockOpeningMustache(node),
    printPath(path, print),
    parts.length > 0 ? indent([line, join(line, parts)]) : "",
    softline,
    printOpeningBlockClosingMustache(node),
  ]);
}

function printElseBlock(node, options) {
  return [
    options.htmlWhitespaceSensitivity === "ignore" ? hardline : "",
    printInverseBlockOpeningMustache(node),
    "else",
    printInverseBlockClosingMustache(node),
  ];
}

const isPathWithSameHead = (pathA, pathB) =>
  pathA.head.type === "VarHead" &&
  pathB.head.type === "VarHead" &&
  pathA.head.name === pathB.head.name;

function isElseIfLike(path) {
  const { grandparent, node } = path;
  return (
    grandparent?.inverse?.body.length === 1 &&
    grandparent.inverse.body[0] === node &&
    isPathWithSameHead(grandparent.inverse.body[0].path, grandparent.path)
  );
}

function printElseIfLikeBlock(path, print) {
  const { node, grandparent } = path;
  return group([
    printInverseBlockOpeningMustache(grandparent),
    ["else", " ", grandparent.inverse.body[0].path.head.name],
    indent([
      line,
      group(printParams(path, print)),
      ...(isNonEmptyArray(node.program.blockParams)
        ? [line, printBlockParams(node.program)]
        : []),
    ]),
    softline,
    printInverseBlockClosingMustache(grandparent),
  ]);
}

function printCloseBlock(path, options, print) {
  const { node } = path;

  if (options.htmlWhitespaceSensitivity === "ignore") {
    const escape = blockStatementHasOnlyWhitespaceInProgram(node)
      ? softline
      : hardline;

    return [
      escape,
      printClosingBlockOpeningMustache(node),
      print("path"),
      printClosingBlockClosingMustache(node),
    ];
  }

  return [
    printClosingBlockOpeningMustache(node),
    print("path"),
    printClosingBlockClosingMustache(node),
  ];
}

function blockStatementHasOnlyWhitespaceInProgram(node) {
  return (
    node.type === "BlockStatement" &&
    node.program.body.every((node) => isWhitespaceNode(node))
  );
}

function blockStatementHasElseIfLike(node) {
  return (
    blockStatementHasElse(node) &&
    node.inverse.body.length === 1 &&
    node.inverse.body[0].type === "BlockStatement" &&
    isPathWithSameHead(node.inverse.body[0].path, node.path)
  );
}

function blockStatementHasElse(node) {
  return node.type === "BlockStatement" && node.inverse;
}

function printProgram(path, options, print) {
  const { node } = path;

  if (blockStatementHasOnlyWhitespaceInProgram(node)) {
    return "";
  }

  const program = print("program");

  if (options.htmlWhitespaceSensitivity === "ignore") {
    return indent([hardline, program]);
  }

  return indent(program);
}

function printInverse(path, options, print) {
  const { node } = path;

  const inverse = print("inverse");
  const printed =
    options.htmlWhitespaceSensitivity === "ignore"
      ? [hardline, inverse]
      : inverse;

  if (blockStatementHasElseIfLike(node)) {
    return printed;
  }

  if (blockStatementHasElse(node)) {
    return [printElseBlock(node, options), indent(printed)];
  }

  return "";
}

/* TextNode print helpers */

function getTextValueParts(value) {
  return join(line, htmlWhitespaceUtils.split(value));
}

function getCurrentAttributeName(path) {
  for (let depth = 0; depth < 2; depth++) {
    const parentNode = path.getParentNode(depth);
    if (parentNode?.type === "AttrNode") {
      return parentNode.name.toLowerCase();
    }
  }
}

function countNewLines(string) {
  /* c8 ignore next */
  string = typeof string === "string" ? string : "";
  return string.split("\n").length - 1;
}

function countLeadingNewLines(string) {
  /* c8 ignore next */
  string = typeof string === "string" ? string : "";
  const newLines = (string.match(/^([^\S\n\r]*[\n\r])+/gu) || [])[0] || "";
  return countNewLines(newLines);
}

function countTrailingNewLines(string) {
  /* c8 ignore next */
  string = typeof string === "string" ? string : "";
  const newLines = (string.match(/([\n\r][^\S\n\r]*)+$/gu) || [])[0] || "";
  return countNewLines(newLines);
}

function generateHardlines(number = 0) {
  return Array.from({
    length: Math.min(number, NEWLINES_TO_PRESERVE_MAX),
  }).fill(hardline);
}

/* StringLiteral print helpers */

/** @import {Quote} from "../utils/get-preferred-quote.js" */

/**
 * Prints a string literal with the correct surrounding quotes based on
 * `options.singleQuote` and the number of escaped quotes contained in
 * the string literal. This function is the glimmer equivalent of `printString`
 * in `common/util`, but has differences because of the way escaped characters
 * are treated in hbs string literals.
 */
function printStringLiteral(path, options) {
  const {
    node: { value },
  } = path;

  const quote = getPreferredQuote(
    value,
    needsOppositeQuote(path) ? !options.singleQuote : options.singleQuote,
  );

  return [quote, value.replaceAll(quote, `\\${quote}`), quote];
}

function needsOppositeQuote(path) {
  const { ancestors } = path;
  const level = ancestors.findIndex((node) => node.type !== "SubExpression");

  return (
    level !== -1 &&
    ancestors[level + 1].type === "ConcatStatement" &&
    ancestors[level + 2].type === "AttrNode"
  );
}

/* SubExpression print helpers */

function printSubExpressionPathAndParams(path, print) {
  const printed = printPath(path, print);
  const params = printParams(path, print);

  if (!params) {
    return printed;
  }

  return indent([printed, line, group(params)]);
}

/* misc. print helpers */

function printPathAndParams(path, print) {
  const pathDoc = printPath(path, print);
  const paramsDoc = printParams(path, print);

  if (!paramsDoc) {
    return pathDoc;
  }

  return [indent([pathDoc, line, paramsDoc]), softline];
}

function printPath(path, print) {
  return print("path");
}

function printParams(path, print) {
  const { node } = path;
  const parts = [];

  if (node.params.length > 0) {
    parts.push(...path.map(print, "params"));
  }

  if (node.hash?.pairs.length > 0) {
    parts.push(print("hash"));
  }

  if (parts.length === 0) {
    return "";
  }

  return join(line, parts);
}

function printBlockParams(node) {
  return ["as |", node.blockParams.join(" "), "|"];
}

// https://handlebarsjs.com/guide/expressions.html#literal-segments
const PATH_EXPRESSION_FORBIDDEN_CHARACTERS = new Set(
  "!\"#%&'()*+,./;<=>@[\\]^`{|}~",
);
const PATH_EXPRESSION_FORBIDDEN_IN_FIRST_PART = new Set([
  "true",
  "false",
  "null",
  "undefined",
]);
const isPathExpressionPartNeedBrackets = (part, index) => {
  if (index === 0 && part.startsWith("@")) {
    return false;
  }

  return (
    (index !== 0 && PATH_EXPRESSION_FORBIDDEN_IN_FIRST_PART.has(part)) ||
    /\s/u.test(part) ||
    /^\d/u.test(part) ||
    Array.prototype.some.call(part, (character) =>
      PATH_EXPRESSION_FORBIDDEN_CHARACTERS.has(character),
    )
  );
};
function printPathExpression(node) {
  // check if node is a legacy path expression and leave it alone
  if (node.tail.length === 0 && node.original.includes("/")) {
    return node.original;
  }

  const parts = [node.head.original, ...node.tail];

  return parts
    .map((part, index) =>
      isPathExpressionPartNeedBrackets(part, index) ? `[${part}]` : part,
    )
    .join(".");
}

const printer = {
  print,
  massageAstNode: clean,
  hasPrettierIgnore,
  getVisitorKeys,
  embed,
};

export default printer;
