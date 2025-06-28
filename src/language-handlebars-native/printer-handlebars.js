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
import { isVoidElement } from "../language-handlebars/utils.js";
import getPreferredQuote from "../utils/get-preferred-quote.js";
import htmlWhitespaceUtils from "../utils/html-whitespace-utils.js";
import isNonEmptyArray from "../utils/is-non-empty-array.js";
import UnexpectedNodeError from "../utils/unexpected-node-error.js";
import clean from "./clean.js";
import embed from "./embed.js";
import getVisitorKeys from "./get-visitor-keys.js";
import { locEnd, locStart } from "./loc.js";

/**
 * @import {Doc} from "../document/builders.js"
 */

const NEWLINES_TO_PRESERVE_MAX = 2;

const MAP = {
  AttrNode: "attribute",
  ElementNode: "element",
  TextNode: "text",
  ConcatStatement: "ConcatStatement",
  MustacheStatement: "mustache",
  BlockStatement: "block",
  PartialStatement: "partial",
  SubExpression: "subexpression",
};

function log(...args) {
  console.log(...args);
}

// Printer for native handlebars AST
function print(path, options, print) {
  const { node } = path;

  log("node", node.type, node.tag, node.name);

  // TextNode are just string
  if (typeof node === "string") {
    // HTML text nodes should use the same logic as TextNode
    const textNode = { chars: node || "", type: "TextNode" };
    return printTextNode(textNode, path, options);
  }

  switch (node.type) {
    case "Program":
    case "Template":
    case "root": {
      const body =
        node.type === "root"
          ? path.map(print, "children")
          : path.map(print, "body");

      if (body.length === 0) {
        return "";
      }

      const result = join("", body);

      // For documents, we need to trim trailing whitespace manually
      // by checking the last element and trimming it if it's a string
      if (isNonEmptyArray(result)) {
        const lastElement = result.at(-1);
        if (typeof lastElement === "string") {
          const trimmed = lastElement.replace(/\s+$/u, "");
          if (trimmed === "") {
            // If the last element becomes empty after trimming, remove it
            return result.slice(0, -1);
          }
          // Replace the last element with the trimmed version
          return [...result.slice(0, -1), trimmed];
        }
      }

      // Always trim trailing whitespace/newlines to match glimmer behavior
      if (typeof result === "string") {
        return result.replace(/\s+$/u, "");
      }

      return result;
    }

    case "element": {
      // HTML element from Prettier's parser - use same logic as glimmer ElementNode
      const startingTag = group(printStartingTag(path, print));

      // log("path.next", path.next);

      const escapeNextElementNode =
        options.htmlWhitespaceSensitivity === "ignore" &&
        path.next?.type === "element"
          ? softline
          : "";

      // Create a normalized node for isVoidElement that always has .tag property
      const normalizedNode = {
        ...node,
        tag: node.name,
        selfClosing: node.selfClosing,
      };

      if (isVoidElement(normalizedNode)) {
        return [startingTag, escapeNextElementNode];
      }

      const endingTag = ["</", node.name, ">"];

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

    case "text": {
      // HTML text nodes should use the same logic as TextNode
      const textNode = { chars: node.value || "", type: "TextNode" };
      return printTextNode(textNode, path, options);
    }

    case MAP.AttrNode: {
      // HTML attribute from HTML parser
      const { name } = node;
      log("value.chars", `"${node.value}"`, node.type);
      const isText = typeof node.value === "string"; // TODO: Figure if this is ok
      const isEmptyText = isText && !node.value;

      // If the text is empty and the value's loc start and end offsets are the
      // same, there is no value for this AttrNode and it should be printed
      // without the `=""`. Example: `<img data-test>` -> `<img data-test>`
      if (isEmptyText && locStart(node) === locEnd(node)) {
        return name;
      }

      log("value", node.value);

      // TODO: Figure if this is ok
      // Let's assume quotes inside the content of text nodes are already
      // properly escaped with entities, otherwise the parse wouldn't have parsed them.
      const quote = isText
        ? getPreferredQuote(node.value, options.singleQuote)
        : node.value.type === MAP.ConcatStatement
          ? getPreferredQuote(
              node.value.parts
                .map((part) => (part.type === MAP.TextNode ? part.value : ""))
                .join(""),
              options.singleQuote,
            )
          : "";

      const vava = isText
        ? null
        : node.value.parts
            .map((part) => (part.type === MAP.TextNode ? part.value : ""))
            .join("");

      log(
        "quote",

        { "node?.type": node?.type, isText, quote, vava },
        JSON.stringify(node.value, null, 2),
      );

      const valueDoc = print("value");

      return [
        name,
        "=",
        quote,
        name === "class" && quote ? group(indent(valueDoc)) : valueDoc,
        quote,
      ];
    }

    case "comment":
      return `<!--${node.value || ""}-->`;

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
        printSubExpressionPathAndParams(path, print),
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

    case "ConcatStatement":
      return path.map(print, "parts");

    case "ElementNode": {
      const startingTag = group(printStartingTag(path, print));

      if (isVoidElement(node)) {
        return [startingTag];
      }

      const endingTag = ["</", node.tag, ">"];

      if (node.children.length === 0) {
        return [startingTag, endingTag];
      }

      return [
        startingTag,
        indent(printChildren(path, options, print)),
        endingTag,
      ];
    }

    default:
      /* c8 ignore next */
      if (node && node.type) {
        throw new UnexpectedNodeError(node, "Handlebars");
      }
      // Handle cases where node might be undefined, null, or a primitive
      return String(node || "");
  }
}

function printContentStatement(node, path, options) {
  // Use original text to preserve exact whitespace and formatting
  let text = node.original || node.value || "";

  // Handle whitespace sensitivity
  if (options.htmlWhitespaceSensitivity === "ignore") {
    // Simple whitespace normalization
    text = text.replaceAll(/\s+/gu, " ").trim();
  }

  // Check if this is the final node in the document by walking up the tree
  let currentPath = path;
  let isAtDocumentEnd = false;

  while (currentPath && currentPath.parent) {
    const { parent } = currentPath;
    const isLastInParent =
      (parent.body && parent.body.at(-1) === currentPath.node) ||
      (parent.children && parent.children.at(-1) === currentPath.node);

    if (!isLastInParent) {
      break; // Not the last child, so not at document end
    }

    // If we reached Program/Template/root, we're at document end
    if (
      parent.type === "Program" ||
      parent.type === "Template" ||
      parent.type === "root"
    ) {
      isAtDocumentEnd = true;
      break;
    }

    currentPath = currentPath.parent;
  }

  // If this is at the document end and contains only whitespace, return empty
  if (isAtDocumentEnd && /^\s*$/u.test(text)) {
    return "";
  }

  // If this is at the document end, trim trailing whitespace
  if (isAtDocumentEnd) {
    text = text.replace(/\s+$/u, "");
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
  }
  return [`{{!${value}}}`];
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

function printSubExpressionPathAndParams(path, print) {
  const parts = [print("path")];

  if (path.node.params.length > 0) {
    parts.push(" ", join(" ", path.map(print, "params")));
  }

  if (path.node.hash) {
    parts.push(" ", print("hash"));
  }

  return parts;
}

function printPathAndParams(path, print, options) {
  const pathDoc = print("path");
  const paramsDoc = printParams(path, print);

  if (!paramsDoc) {
    return pathDoc;
  }

  // Check if we're in an attribute context for compact formatting
  const inAttributeContext = isInAttributeContext(path);
  const separator = inAttributeContext ? "" : " ";

  return [pathDoc, separator, paramsDoc];
}

function isInAttributeContext(path) {
  // Walk up the path to see if we're inside an AttrNode
  for (let depth = 0; depth < 4; depth++) {
    const parentNode = path.getParentNode(depth);
    if (parentNode?.type === "AttrNode") {
      return true;
    }
  }
  return false;
}

function printParams(path, print) {
  const { node } = path;
  const parts = [];

  if (node.params.length > 0) {
    parts.push(...path.map(print, "params"));
  }

  if (node.hash?.pairs?.length > 0) {
    parts.push(print("hash"));
  }

  if (parts.length === 0) {
    return "";
  }

  // Use space instead of line for compact formatting like glimmer
  return join(" ", parts);
}

function printPath(path, print) {
  return print("path");
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

  // Use getPreferredQuote like glimmer, but with a preference for double quotes
  const quote = getPreferredQuote(value, false); // false = prefer double quotes

  return [quote, value, quote];
}

function printTextNode(node, path, options) {
  // Don't format content:
  // 1. in `<pre>`,
  // 2. in `<style>`
  if (path.parent.tag === "pre" || path.parent.tag === "style") {
    return node.chars;
  }

  /* if `{{my-component}}` (or any text containing "{{")
   * makes it to the TextNode, it means it was escaped,
   * so let's print it escaped, ie.; `\{{my-component}}` */
  const text = node.chars.replaceAll("{{", String.raw`\{{`);

  const attrName = getCurrentAttributeName(path);

  if (attrName) {
    // TODO: format style and srcset attributes
    if (attrName === "class") {
      const formattedClasses = text.trim().split(/\s+/u).join(" ");

      let leadingSpace = false;
      let trailingSpace = false;

      log("path.parent.type", path.parent.type);

      log("--->", {
        parent: path.parent,
        previous: path.previous,
        next: path.next,
      });

      if (path.parent.type === "ConcatStatement") {
        if (path.previous?.type === "MustacheStatement" && /^\s/u.test(text)) {
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

    const val = replaceEndOfLine(text);
    log("retval", val);
    return val;
  }

  const isWhitespaceOnly = htmlWhitespaceUtils.isWhitespaceOnly(text);
  const { isFirst, isLast } = path;

  if (options.htmlWhitespaceSensitivity !== "ignore") {
    // let's remove the file's final newline
    // https://github.com/ember-cli/ember-new-output/blob/1a04c67ddd02ccb35e0ff41bb5cbce34b31173ef/.editorconfig#L16
    const shouldTrimTrailingNewlines =
      isLast && path.parent.type === MAP.Template;
    const shouldTrimLeadingNewlines =
      isFirst && path.parent.type === MAP.Template;

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

    const leadingWhitespace = htmlWhitespaceUtils.getLeadingWhitespace(text);

    let leadBreaks = [];
    if (leadingWhitespace) {
      leadBreaks = [line];

      const leadingNewlines = countNewLines(leadingWhitespace);
      if (leadingNewlines) {
        leadBreaks = generateHardlines(leadingNewlines);
      }

      text = text.slice(leadingWhitespace.length);
    }

    const tailingWhitespace = htmlWhitespaceUtils.getTrailingWhitespace(text);
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

function getCurrentAttributeName(path) {
  for (let depth = 0; depth < 2; depth++) {
    const parentNode = path.getParentNode(depth);
    log("parentNode", parentNode);
    if (parentNode?.type === MAP.AttrNode) {
      return parentNode.name.toLowerCase();
    }
  }
}

function getAttrValueText(value) {
  if (!value) {
    return "";
  }

  // Handle different types of attribute values
  switch (value.type) {
    case "TextNode":
    case "ContentStatement":
      return value.original || value.value || value.chars || "";
    case "ConcatStatement":
      // For concat statements, extract text from all parts
      if (value.parts) {
        return value.parts
          .map((part) => {
            if (part.type === "TextNode" || part.type === "ContentStatement") {
              return part.original || part.value || part.chars || "";
            }
            // For handlebars expressions, just return a placeholder for quote detection
            return "{{}}";
          })
          .join("");
      }
      return "";
    default:
      return String(value);
  }
}

function printStartingTag(path, print) {
  const { node } = path;

  // Handle both ElementNode (handlebars) and element (HTML) node types
  const tagName = node.tag || node.name;
  let attributes = [];

  if (node.type === "ElementNode") {
    // Handlebars ElementNode
    const types = ["attributes", "modifiers", "comments"].filter((property) =>
      isNonEmptyArray(node[property]),
    );
    attributes = types.flatMap((type) => node[type]).sort(sortByLoc);

    for (const attributeType of types) {
      path.each(({ node }) => {
        const index = attributes.indexOf(node);
        attributes.splice(index, 1, [line, print()]);
      }, attributeType);
    }

    if (isNonEmptyArray(node.blockParams)) {
      attributes.push(line, printBlockParams(node));
    }
  } else if (node.attrs) {
    // HTML element node - process similar to ElementNode
    attributes = [...node.attrs]; // Start with a copy of the attrs array

    // Replace each attribute with [line, print()] pattern like ElementNode does
    path.each(({ node: attrNode }) => {
      const index = attributes.indexOf(attrNode);
      if (index !== -1) {
        // Use consistent line breaking for all attributes
        attributes.splice(index, 1, [line, print()]);
      }
    }, "attrs");
  }

  return ["<", tagName, indent(attributes), printStartingTagEndMarker(node)];
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
  const tagName = node.tag || node.name;

  // Create a normalized node for isVoidElement that always has .tag property
  const normalizedNode = {
    ...node,
    tag: tagName,
    selfClosing: node.selfClosing,
  };

  const shouldSelfClose =
    isVoidElement(normalizedNode) ||
    (tagName && /^[A-Z]/.test(tagName) && !isNonEmptyArray(node.children));

  if (shouldSelfClose) {
    return ifBreak([softline, "/>"], [" />", softline]);
  }

  return ifBreak([softline, ">"], ">");
}

function printBlockParams(node) {
  return ["as |", node.blockParams.join(" "), "|"];
}

function sortByLoc(a, b) {
  return locStart(a) - locStart(b);
}

function isWhitespaceNode(node) {
  const text = node.original || node.value || node.chars || "";
  return (
    (node.type === "TextNode" || node.type === "ContentStatement") &&
    !/\S/u.test(text)
  );
}

function getStack() {
  try {
    throw new Error("test");
  } catch (error) {
    return error.stack;
  }
}

export default {
  print: (...args) => {
    const val = print(...args);

    log(
      "ret:",
      {
        node: args[0]?.node,
        type: args[0]?.node?.type,
        tag: args[0]?.node?.tag,
        name: args[0]?.node?.name,
        stack: getStack(),
      },
      JSON.stringify(val, null, 2),
    );

    return val;
  },
  embed,
  insertPragma() {},
  massageAstNode: clean,
  getVisitorKeys,
};

function countNewLines(string) {
  /* c8 ignore next */
  string = typeof string === "string" ? string : "";
  return string.split("\n").length - 1;
}

function generateHardlines(number = 0) {
  return Array.from({
    length: Math.min(number, NEWLINES_TO_PRESERVE_MAX),
  }).fill(hardline);
}

function getTextValueParts(value) {
  return join(line, htmlWhitespaceUtils.split(value));
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
