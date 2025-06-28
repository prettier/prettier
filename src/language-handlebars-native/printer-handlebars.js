import { group, join, line, softline } from "../document/builders.js";
import getPreferredQuote from "../utils/get-preferred-quote.js";
import UnexpectedNodeError from "../utils/unexpected-node-error.js";
import clean from "./clean.js";
import embed from "./embed.js";
import getVisitorKeys from "./get-visitor-keys.js";

/**
 * @import {Doc} from "../document/builders.js"
 */

const NEWLINES_TO_PRESERVE_MAX = 2;

// Printer for native handlebars AST
function print(path, options, print) {
  const { node } = path;

  switch (node.type) {
    case "Program":
      return group(path.map(print, "body"));

    case "ContentStatement":
      return printContentStatement(node, path, options);

    case "MustacheStatement":
      return group([
        printOpeningMustache(node),
        printPathAndParams(path, print, options),
        printClosingMustache(node),
      ]);

    case "BlockStatement":
      return [
        printOpenBlock(path, print),
        group([
          printProgram(path, options, print),
          printInverse(path, options, print),
          printCloseBlock(path, options, print),
        ]),
      ];

    case "PartialStatement":
      return group([
        "{{>",
        " ",
        print("name"),
        node.params.length > 0
          ? [" ", join(" ", path.map(print, "params"))]
          : "",
        node.hash ? [" ", print("hash")] : "",
        " }}",
      ]);

    case "SubExpression":
      return group([
        "(",
        printSubExpressionPathAndParams(path, print, options),
        softline,
        ")",
      ]);

    case "Hash":
      return join(line, path.map(print, "pairs"));

    case "HashPair":
      return [node.key, "=", print("value")];

    case "PathExpression":
      return printPathExpression(node);

    case "StringLiteral":
      return printStringLiteral(path, options);

    case "NumberLiteral":
      return String(node.value);

    case "BooleanLiteral":
      return String(node.value);

    case "UndefinedLiteral":
      return "undefined";

    case "NullLiteral":
      return "null";

    case "CommentStatement":
      return printCommentStatement(node, path, options);

    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "Handlebars");
  }
}

function printContentStatement(node, path, options) {
  // Use original text to preserve exact whitespace and formatting
  let text = node.original || node.value || "";

  // Handle whitespace sensitivity
  if (options.htmlWhitespaceSensitivity === "ignore") {
    // Simple whitespace normalization
    text = text.replace(/\s+/gu, " ").trim();
  }

  return text;
}

function printCommentStatement(node, path, options) {
  const value = node.value || "";

  // Detect if this was originally a long-form comment
  let needsLongForm = value.includes("}}");

  // If we have access to the original text, check if it was long-form
  if (options.originalText && node.loc) {
    const start = node.loc.start.offset || 0;
    const end = node.loc.end.offset || 0;
    const originalText = options.originalText.slice(start, end);
    needsLongForm = originalText.includes("{{!--");
  }

  if (needsLongForm) {
    return [`{{!--${value}--}}`];
  } else {
    return [`{{!${value}}}`];
  }
}

function printOpeningMustache(node) {
  const mustache = node.escaped === false ? "{{{" : "{{";
  const strip = node.strip?.open ? "~" : "";
  return [mustache, strip];
}

function printClosingMustache(node) {
  const mustache = node.escaped === false ? "}}}" : "}}";
  const strip = node.strip?.close ? "~" : "";
  return [strip, mustache];
}

function printOpenBlock(path, print) {
  const { node } = path;

  return [
    printOpeningMustache(node),
    "#",
    printPath(path, print),
    node.params.length > 0 ? [" ", printParams(path, print)] : "",
    node.hash ? [" ", print("hash")] : "",
    printClosingMustache(node),
  ];
}

function printCloseBlock(path, options, print) {
  const { node } = path;

  return ["{{", "/", print("path"), "}}"];
}

function printProgram(path, options, print) {
  if (!path.node.program || !path.node.program.body) {
    return "";
  }

  return path.call((programPath) => programPath.map(print, "body"), "program");
}

function printInverse(path, options, print) {
  if (!path.node.inverse || !path.node.inverse.body) {
    return "";
  }

  return [
    "{{else}}",
    path.call((inversePath) => inversePath.map(print, "body"), "inverse"),
  ];
}

function printSubExpressionPathAndParams(path, print, options) {
  const parts = [print("path")];

  if (path.node.params.length > 0) {
    parts.push(line, join(line, path.map(print, "params")));
  }

  if (path.node.hash) {
    parts.push(line, print("hash"));
  }

  // No trailing space for clean, consistent formatting
  return parts;
}

function printPathAndParams(path, print, options) {
  const parts = [print("path")];

  if (path.node.params.length > 0) {
    parts.push(" ", join(" ", path.map(print, "params")));
  }

  if (path.node.hash) {
    parts.push(" ", print("hash"));
  }

  // No trailing space for clean, consistent formatting
  return parts;
}

function printPath(path, print) {
  return print("path");
}

function printParams(path, print) {
  return join(" ", path.map(print, "params"));
}

function printPathExpression(node) {
  const { original, parts, data } = node;

  if (original) {
    return data ? `@${original}` : original;
  }

  if (parts) {
    const pathString = parts.join(".");
    return data ? `@${pathString}` : pathString;
  }

  return "";
}

function printStringLiteral(path, options) {
  const { node } = path;
  const { value } = node;

  const quote = getPreferredQuote(value, options.singleQuote);

  return [quote, value, quote];
}

export default {
  print,
  embed,
  insertPragma: () => {},
  massageAstNode: clean,
  getVisitorKeys,
};
