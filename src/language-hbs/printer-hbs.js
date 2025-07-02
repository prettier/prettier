import { group, hardline, indent, join, line } from "../document/builders.js";
import clean from "../language-handlebars/clean.js";
import embed from "../language-handlebars/embed.js";
import printerGlimmer from "../language-handlebars/printer-glimmer.js";
import {
  hasPrettierIgnore,
  isWhitespaceNode,
} from "../language-handlebars/utils.js";
import isNonEmptyArray from "../utils/is-non-empty-array.js";
import getVisitorKeys from "./get-visitor-keys.js";

/**
 * @import {Doc} from "../document/builders.js"
 */

function print(path, options, print) {
  switch (path.node.type) {
    case "Handlebar_PartialStatement":
      return group([
        "{{>",
        " ",
        print("name"), // PartialStatement uses 'name' instead of 'path'
        printParams(path, print) ? [" ", printParams(path, print)] : "",
        " }}",
      ]);

    case "Handlebar_PartialBlockStatement":
      return [
        printOpenPartialBlock(path, print),
        group([
          printProgram(path, options, print),
          printInverse(path, options, print),
          printClosePartialBlock(path, print),
        ]),
      ];

    case "Handlebar_DecoratorBlock":
      return [
        printOpenDecoratorBlock(path, print),
        group([
          printProgram(path, options, print),
          printCloseDecoratorBlock(path, print),
        ]),
      ];

    case "Handlebar_Decorator":
      // Standalone decorators like {{* decorator}}
      return group([
        "{{*",
        printPath(path, print),
        printParams(path, print) ? [" ", printParams(path, print)] : "",
        " }}",
      ]);

    case "Handlebar_PathExpression":
      return printHandlebarPathExpression(path.node);

    case "Handlebar_SubExpression":
      return group([
        "(",
        print("path"),
        printParams(path, print) ? [" ", printParams(path, print)] : "",
        ")",
      ]);

    case "Handlebar_StringLiteral":
    case "Handlebar_NumberLiteral":
    case "Handlebar_BooleanLiteral":
    case "Handlebar_UndefinedLiteral":
    case "Handlebar_NullLiteral":
    case "Handlebar_Hash":
    case "Handlebar_HashPair":
    case "Handlebar_Program":
    case "Handlebar_ContentStatement":
      // These nodes have the same structure as Glimmer equivalents
      // (ContentStatement gets special handling in delegateToGlimmerPrinter)
      return delegateToGlimmerPrinter(path, options, print);

    case "Handlebar_CommentStatement":
      // Handlebars comments should stay as Handlebars comments, not HTML comments
      return ["{{!--", path.node.value, "--}}"];

    default:
      return printerGlimmer.print(path, options, print);
  }
}

function delegateToGlimmerPrinter(path, options, print) {
  // Temporarily modify the node type to remove the prefix
  const originalType = path.node.type;
  let unprefixedType = originalType.replace("Handlebar_", "");

  // Special case: ContentStatement in Handlebars.js maps to TextNode in Glimmer
  if (unprefixedType === "ContentStatement") {
    unprefixedType = "TextNode";
    // Also need to map the value property to chars
    const originalValue = path.node.value;
    path.node.chars = originalValue;
    path.node.type = unprefixedType;

    try {
      const result = printerGlimmer.print(path, options, print);
      return result;
    } finally {
      // Restore original properties
      path.node.type = originalType;
      delete path.node.chars;
    }
  }

  // Temporarily modify the node type
  path.node.type = unprefixedType;

  try {
    // Delegate to the Glimmer printer
    const result = printerGlimmer.print(path, options, print);
    return result;
  } finally {
    // Always restore the original type
    path.node.type = originalType;
  }
}

/* ElementNode print helpers */

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

/* PartialBlockStatement print helpers */

function printOpenPartialBlock(path, print) {
  const paramsDoc = printParams(path, print);

  return group([
    "{{#>",
    " ",
    print("name"), // PartialBlockStatement uses 'name' instead of 'path'
    paramsDoc ? [" ", paramsDoc] : "",
    " }}",
  ]);
}

function printClosePartialBlock(path, print) {
  return ["{{/", print("name"), "}}"]; // PartialBlockStatement uses 'name' instead of 'path'
}

/* DecoratorBlock print helpers */

function printOpenDecoratorBlock(path, print) {
  const paramsDoc = printParams(path, print);

  return group([
    "{{*",
    printPath(path, print),
    paramsDoc ? [" ", paramsDoc] : "",
    " }}",
  ]);
}

function printCloseDecoratorBlock(path, print) {
  return ["{{/", printPath(path, print), "}}"];
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

/* StringLiteral print helpers */

/** @import {Quote} from "../utils/get-preferred-quote.js" */

/* misc. print helpers */

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

function printHandlebarPathExpression(node) {
  // Handle Handlebars.js style PathExpression with 'parts' and 'original'
  if (isNonEmptyArray(node.parts)) {
    return node.parts.join(".");
  }

  // Fallback to original if parts are not available
  return node.original || "";
}

const printer = {
  print,
  massageAstNode: clean,
  hasPrettierIgnore,
  getVisitorKeys,
  embed,
};

export default printer;
