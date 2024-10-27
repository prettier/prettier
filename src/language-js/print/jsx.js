"use strict";

const { printComments, printDanglingComments } = require("../../main/comments");
const {
  builders: {
    line,
    hardline,
    softline,
    group,
    indent,
    conditionalGroup,
    fill,
    ifBreak,
    lineSuffixBoundary,
    join,
  },
  utils: { willBreak },
} = require("../../document");

const { getLast, getPreferredQuote } = require("../../common/util");
const {
  isJsxNode,
  rawText,
  isLiteral,
  isCallExpression,
  isStringLiteral,
  isBinaryish,
  hasAddedLine, // [prettierx] for --template-curly-spacing option support (...)
  hasComment,
  CommentCheckFlags,
  hasNodeIgnoreComment,
} = require("../utils");
const pathNeedsParens = require("../needs-parens");
const { willPrintOwnComments } = require("../comments");

const isEmptyStringOrAnyLine = (doc) =>
  doc === "" || doc === line || doc === hardline || doc === softline;

/**
 * @typedef {import("../../common/ast-path")} AstPath
 * @typedef {import("../types/estree").Node} Node
 * @typedef {import("../types/estree").JSXElement} JSXElement
 */

// JSX expands children from the inside-out, instead of the outside-in.
// This is both to break children before attributes,
// and to ensure that when children break, their parents do as well.
//
// Any element that is written without any newlines and fits on a single line
// is left that way.
// Not only that, any user-written-line containing multiple JSX siblings
// should also be kept on one line if possible,
// so each user-written-line is wrapped in its own group.
//
// Elements that contain newlines or don't fit on a single line (recursively)
// are fully-split, using hardline and shouldBreak: true.
//
// To support that case properly, all leading and trailing spaces
// are stripped from the list of children, and replaced with a single hardline.
function printJsxElementInternal(path, options, print) {
  const node = path.getValue();

  if (node.type === "JSXElement" && isEmptyJsxElement(node)) {
    return [print("openingElement"), print("closingElement")];
  }

  const openingLines =
    node.type === "JSXElement"
      ? print("openingElement")
      : print("openingFragment");
  const closingLines =
    node.type === "JSXElement"
      ? print("closingElement")
      : print("closingFragment");

  if (
    node.children.length === 1 &&
    node.children[0].type === "JSXExpressionContainer" &&
    (node.children[0].expression.type === "TemplateLiteral" ||
      node.children[0].expression.type === "TaggedTemplateExpression")
  ) {
    return [openingLines, ...path.map(print, "children"), closingLines];
  }

  // Convert `{" "}` to text nodes containing a space.
  // This makes it easy to turn them into `jsxWhitespace` which
  // can then print as either a space or `{" "}` when breaking.
  node.children = node.children.map((child) => {
    if (isJsxWhitespaceExpression(child)) {
      return {
        type: "JSXText",
        value: " ",
        raw: " ",
      };
    }
    return child;
  });

  const containsTag = node.children.filter(isJsxNode).length > 0;
  const containsMultipleExpressions =
    node.children.filter((child) => child.type === "JSXExpressionContainer")
      .length > 1;
  const containsMultipleAttributes =
    node.type === "JSXElement" && node.openingElement.attributes.length > 1;

  // Record any breaks. Should never go from true to false, only false to true.
  let forcedBreak =
    willBreak(openingLines) ||
    containsTag ||
    containsMultipleAttributes ||
    containsMultipleExpressions;

  const isMdxBlock = path.getParentNode().rootMarker === "mdx";

  const rawJsxWhitespace = options.singleQuote ? "{' '}" : '{" "}';
  const jsxWhitespace = isMdxBlock
    ? " "
    : ifBreak([rawJsxWhitespace, softline], " ");

  const isFacebookTranslationTag =
    node.openingElement &&
    node.openingElement.name &&
    node.openingElement.name.name === "fbt";

  const children = printJsxChildren(
    path,
    options,
    print,
    jsxWhitespace,
    isFacebookTranslationTag
  );

  const containsText = node.children.some((child) =>
    isMeaningfulJsxText(child)
  );

  // We can end up we multiple whitespace elements with empty string
  // content between them.
  // We need to remove empty whitespace and softlines before JSX whitespace
  // to get the correct output.
  for (let i = children.length - 2; i >= 0; i--) {
    const isPairOfEmptyStrings = children[i] === "" && children[i + 1] === "";
    const isPairOfHardlines =
      children[i] === hardline &&
      children[i + 1] === "" &&
      children[i + 2] === hardline;
    const isLineFollowedByJsxWhitespace =
      (children[i] === softline || children[i] === hardline) &&
      children[i + 1] === "" &&
      children[i + 2] === jsxWhitespace;
    const isJsxWhitespaceFollowedByLine =
      children[i] === jsxWhitespace &&
      children[i + 1] === "" &&
      (children[i + 2] === softline || children[i + 2] === hardline);
    const isDoubleJsxWhitespace =
      children[i] === jsxWhitespace &&
      children[i + 1] === "" &&
      children[i + 2] === jsxWhitespace;
    const isPairOfHardOrSoftLines =
      (children[i] === softline &&
        children[i + 1] === "" &&
        children[i + 2] === hardline) ||
      (children[i] === hardline &&
        children[i + 1] === "" &&
        children[i + 2] === softline);

    if (
      (isPairOfHardlines && containsText) ||
      isPairOfEmptyStrings ||
      isLineFollowedByJsxWhitespace ||
      isDoubleJsxWhitespace ||
      isPairOfHardOrSoftLines
    ) {
      children.splice(i, 2);
    } else if (isJsxWhitespaceFollowedByLine) {
      children.splice(i + 1, 2);
    }
  }

  // Trim trailing lines (or empty strings)
  while (children.length > 0 && isEmptyStringOrAnyLine(getLast(children))) {
    children.pop();
  }

  // Trim leading lines (or empty strings)
  while (
    children.length > 1 &&
    isEmptyStringOrAnyLine(children[0]) &&
    isEmptyStringOrAnyLine(children[1])
  ) {
    children.shift();
    children.shift();
  }

  // Tweak how we format children if outputting this element over multiple lines.
  // Also detect whether we will force this element to output over multiple lines.
  const multilineChildren = [];
  for (const [i, child] of children.entries()) {
    // There are a number of situations where we need to ensure we display
    // whitespace as `{" "}` when outputting this element over multiple lines.
    if (child === jsxWhitespace) {
      if (i === 1 && children[i - 1] === "") {
        if (children.length === 2) {
          // Solitary whitespace
          multilineChildren.push(rawJsxWhitespace);
          continue;
        }
        // Leading whitespace
        multilineChildren.push([rawJsxWhitespace, hardline]);
        continue;
      } else if (i === children.length - 1) {
        // Trailing whitespace
        multilineChildren.push(rawJsxWhitespace);
        continue;
      } else if (children[i - 1] === "" && children[i - 2] === hardline) {
        // Whitespace after line break
        multilineChildren.push(rawJsxWhitespace);
        continue;
      }
    }

    multilineChildren.push(child);

    if (willBreak(child)) {
      forcedBreak = true;
    }
  }

  // If there is text we use `fill` to fit as much onto each line as possible.
  // When there is no text (just tags and expressions) we use `group`
  // to output each on a separate line.
  const content = containsText
    ? fill(multilineChildren)
    : group(multilineChildren, { shouldBreak: true });

  if (isMdxBlock) {
    return content;
  }

  const multiLineElem = group([
    openingLines,
    indent([hardline, content]),
    hardline,
    closingLines,
  ]);

  if (forcedBreak) {
    return multiLineElem;
  }

  return conditionalGroup([
    group([openingLines, ...children, closingLines]),
    multiLineElem,
  ]);
}

// JSX Children are strange, mostly for two reasons:
// 1. JSX reads newlines into string values, instead of skipping them like JS
// 2. up to one whitespace between elements within a line is significant,
//    but not between lines.
//
// Leading, trailing, and lone whitespace all need to
// turn themselves into the rather ugly `{' '}` when breaking.
//
// We print JSX using the `fill` doc primitive.
// This requires that we give it an array of alternating
// content and whitespace elements.
// To ensure this we add dummy `""` content elements as needed.
function printJsxChildren(
  path,
  options,
  print,
  jsxWhitespace,
  isFacebookTranslationTag
) {
  const parts = [];
  path.each((childPath, i, children) => {
    const child = childPath.getValue();
    if (isLiteral(child)) {
      const text = rawText(child);

      // Contains a non-whitespace character
      if (isMeaningfulJsxText(child)) {
        const words = text.split(matchJsxWhitespaceRegex);

        // Starts with whitespace
        if (words[0] === "") {
          parts.push("");
          words.shift();
          if (/\n/.test(words[0])) {
            const next = children[i + 1];
            parts.push(
              separatorWithWhitespace(
                isFacebookTranslationTag,
                words[1],
                child,
                next
              )
            );
          } else {
            parts.push(jsxWhitespace);
          }
          words.shift();
        }

        let endWhitespace;
        // Ends with whitespace
        if (getLast(words) === "") {
          words.pop();
          endWhitespace = words.pop();
        }

        // This was whitespace only without a new line.
        if (words.length === 0) {
          return;
        }

        for (const [i, word] of words.entries()) {
          if (i % 2 === 1) {
            parts.push(line);
          } else {
            parts.push(word);
          }
        }

        if (endWhitespace !== undefined) {
          if (/\n/.test(endWhitespace)) {
            const next = children[i + 1];
            parts.push(
              separatorWithWhitespace(
                isFacebookTranslationTag,
                getLast(parts),
                child,
                next
              )
            );
          } else {
            parts.push(jsxWhitespace);
          }
        } else {
          const next = children[i + 1];
          parts.push(
            separatorNoWhitespace(
              isFacebookTranslationTag,
              getLast(parts),
              child,
              next
            )
          );
        }
      } else if (/\n/.test(text)) {
        // Keep (up to one) blank line between tags/expressions/text.
        // Note: We don't keep blank lines between text elements.
        if (text.match(/\n/g).length > 1) {
          parts.push("", hardline);
        }
      } else {
        parts.push("", jsxWhitespace);
      }
    } else {
      const printedChild = print();
      parts.push(printedChild);

      const next = children[i + 1];
      const directlyFollowedByMeaningfulText =
        next && isMeaningfulJsxText(next);
      if (directlyFollowedByMeaningfulText) {
        const firstWord = trimJsxWhitespace(rawText(next)).split(
          matchJsxWhitespaceRegex
        )[0];
        parts.push(
          separatorNoWhitespace(
            isFacebookTranslationTag,
            firstWord,
            child,
            next
          )
        );
      } else {
        parts.push(hardline);
      }
    }
  }, "children");

  return parts;
}

function separatorNoWhitespace(
  isFacebookTranslationTag,
  child,
  childNode,
  nextNode
) {
  if (isFacebookTranslationTag) {
    return "";
  }

  if (
    (childNode.type === "JSXElement" && !childNode.closingElement) ||
    (nextNode && nextNode.type === "JSXElement" && !nextNode.closingElement)
  ) {
    return child.length === 1 ? softline : hardline;
  }

  return softline;
}

function separatorWithWhitespace(
  isFacebookTranslationTag,
  child,
  childNode,
  nextNode
) {
  if (isFacebookTranslationTag) {
    return hardline;
  }

  if (child.length === 1) {
    return (childNode.type === "JSXElement" && !childNode.closingElement) ||
      (nextNode && nextNode.type === "JSXElement" && !nextNode.closingElement)
      ? hardline
      : softline;
  }

  return hardline;
}

function maybeWrapJsxElementInParens(path, elem, options) {
  const parent = path.getParentNode();
  /* istanbul ignore next */
  if (!parent) {
    return elem;
  }

  const NO_WRAP_PARENTS = {
    ArrayExpression: true,
    JSXAttribute: true,
    JSXElement: true,
    JSXExpressionContainer: true,
    JSXFragment: true,
    ExpressionStatement: true,
    CallExpression: true,
    OptionalCallExpression: true,
    ConditionalExpression: true,
    JsExpressionRoot: true,
  };
  if (NO_WRAP_PARENTS[parent.type]) {
    return elem;
  }

  const shouldBreak = path.match(
    undefined,
    (node) => node.type === "ArrowFunctionExpression",
    isCallExpression,
    (node) => node.type === "JSXExpressionContainer"
  );

  const needsParens = pathNeedsParens(path, options);

  return group(
    [
      needsParens ? "" : ifBreak("("),
      indent([softline, elem]),
      softline,
      needsParens ? "" : ifBreak(")"),
    ],
    { shouldBreak }
  );
}

function printJsxAttribute(path, options, print) {
  const node = path.getValue();
  const parts = [];
  parts.push(print("name"));

  if (node.value) {
    let res;
    if (isStringLiteral(node.value)) {
      const raw = rawText(node.value);
      // Unescape all quotes so we get an accurate preferred quote
      let final = raw.replace(/&apos;/g, "'").replace(/&quot;/g, '"');
      const quote = getPreferredQuote(
        final,
        options.jsxSingleQuote ? "'" : '"'
      );
      const escape = quote === "'" ? "&apos;" : "&quot;";
      final = final.slice(1, -1).replace(new RegExp(quote, "g"), escape);
      res = [quote, final, quote];
    } else {
      res = print("value");
    }
    parts.push("=", res);
  }

  return parts;
}

function printJsxExpressionContainer(path, options, print) {
  const node = path.getValue();
  const parent = path.getParentNode(0);

  // [prettierx] --template-curly-spacing option support (...)
  const templateCurlySpace = options.templateCurlySpacing ? " " : "";
  const templateCurlyLine = options.templateCurlySpacing ? line : softline;

  const shouldInline =
    node.expression.type === "JSXEmptyExpression" ||
    (!hasComment(node.expression) &&
      (node.expression.type === "ArrayExpression" ||
        node.expression.type === "ObjectExpression" ||
        node.expression.type === "ArrowFunctionExpression" ||
        isCallExpression(node.expression) ||
        node.expression.type === "FunctionExpression" ||
        node.expression.type === "TemplateLiteral" ||
        node.expression.type === "TaggedTemplateExpression" ||
        node.expression.type === "DoExpression" ||
        (isJsxNode(parent) &&
          (node.expression.type === "ConditionalExpression" ||
            isBinaryish(node.expression)))));

  if (shouldInline) {
    // [prettierx] --template-curly-spacing option support (...)
    const printed = print("expression");

    return group([
      "{",
      // [prettierx] --template-curly-spacing option support (...)
      templateCurlySpace,
      // [prettierx] --template-curly-spacing option support (...)
      printed,
      lineSuffixBoundary,
      // [prettierx] --template-curly-spacing option support (...)
      hasAddedLine(printed) ? "" : templateCurlySpace,
      "}",
    ]);
  }

  return group([
    "{",
    // [prettierx] --template-curly-spacing option support (...)
    indent([templateCurlyLine, print("expression")]),
    templateCurlyLine,
    lineSuffixBoundary,
    "}",
  ]);
}

function printJsxOpeningElement(path, options, print) {
  const node = path.getValue();

  const nameHasComments =
    (node.name && hasComment(node.name)) ||
    (node.typeParameters && hasComment(node.typeParameters));

  // Don't break self-closing elements with no attributes and no comments
  if (node.selfClosing && node.attributes.length === 0 && !nameHasComments) {
    return ["<", print("name"), print("typeParameters"), " />"];
  }

  // don't break up opening elements with a single long text attribute
  if (
    node.attributes &&
    node.attributes.length === 1 &&
    node.attributes[0].value &&
    isStringLiteral(node.attributes[0].value) &&
    !node.attributes[0].value.value.includes("\n") &&
    // We should break for the following cases:
    // <div
    //   // comment
    //   attr="value"
    // >
    // <div
    //   attr="value"
    //   // comment
    // >
    !nameHasComments &&
    !hasComment(node.attributes[0])
  ) {
    return group([
      "<",
      print("name"),
      print("typeParameters"),
      " ",
      ...path.map(print, "attributes"),
      node.selfClosing ? " />" : ">",
    ]);
  }

  const lastAttrHasTrailingComments =
    node.attributes.length > 0 &&
    hasComment(getLast(node.attributes), CommentCheckFlags.Trailing);

  const bracketSameLine =
    // Simple tags (no attributes and no comment in tag name) should be
    // kept unbroken regardless of `jsxBracketSameLine`
    (node.attributes.length === 0 && !nameHasComments) ||
    (options.jsxBracketSameLine &&
      // We should print the bracket in a new line for the following cases:
      // <div
      //   // comment
      // >
      // <div
      //   attr // comment
      // >
      (!nameHasComments || node.attributes.length > 0) &&
      !lastAttrHasTrailingComments);

  // We should print the opening element expanded if any prop value is a
  // string literal with newlines
  const shouldBreak =
    node.attributes &&
    node.attributes.some(
      (attr) =>
        attr.value &&
        isStringLiteral(attr.value) &&
        attr.value.value.includes("\n")
    );

  return group(
    [
      "<",
      print("name"),
      print("typeParameters"),
      indent(path.map(() => [line, print()], "attributes")),
      node.selfClosing ? line : bracketSameLine ? ">" : softline,
      node.selfClosing ? "/>" : bracketSameLine ? "" : ">",
    ],
    { shouldBreak }
  );
}

function printJsxClosingElement(path, options, print) {
  const node = path.getValue();
  const parts = [];

  parts.push("</");

  const printed = print("name");
  if (
    hasComment(node.name, CommentCheckFlags.Leading | CommentCheckFlags.Line)
  ) {
    parts.push(indent([hardline, printed]), hardline);
  } else if (
    hasComment(node.name, CommentCheckFlags.Leading | CommentCheckFlags.Block)
  ) {
    parts.push(" ", printed);
  } else {
    parts.push(printed);
  }

  parts.push(">");

  return parts;
}

function printJsxOpeningClosingFragment(path, options /*, print*/) {
  const node = path.getValue();
  const nodeHasComment = hasComment(node);
  const hasOwnLineComment = hasComment(node, CommentCheckFlags.Line);
  const isOpeningFragment = node.type === "JSXOpeningFragment";
  return [
    isOpeningFragment ? "<" : "</",
    indent([
      hasOwnLineComment
        ? hardline
        : nodeHasComment && !isOpeningFragment
        ? " "
        : "",
      printDanglingComments(path, options, true),
    ]),
    hasOwnLineComment ? hardline : "",
    ">",
  ];
}

function printJsxElement(path, options, print) {
  const elem = printComments(
    path,
    printJsxElementInternal(path, options, print),
    options
  );
  return maybeWrapJsxElementInParens(path, elem, options);
}

function printJsxEmptyExpression(path, options /*, print*/) {
  const node = path.getValue();
  const requiresHardline = hasComment(node, CommentCheckFlags.Line);

  return [
    printDanglingComments(path, options, /* sameIndent */ !requiresHardline),
    requiresHardline ? hardline : "",
  ];
}

// `JSXSpreadAttribute` and `JSXSpreadChild`
function printJsxSpreadAttribute(path, options, print) {
  const node = path.getValue();

  // [prettierx] --template-curly-spacing option support (...)
  const templateCurlySpace = options.templateCurlySpacing ? " " : "";
  const templateCurlyLine = options.templateCurlySpacing ? line : softline;

  return [
    "{",
    path.call(
      (p) => {
        const printed = ["...", print()];
        const node = p.getValue();
        if (!hasComment(node) || !willPrintOwnComments(p)) {
          // [prettierx] --template-curly-spacing option support (...)
          return [templateCurlySpace, ...printed, templateCurlySpace];
        }
        // [prettierx] with --template-curly-spacing option support (...)
        return [
          // [prettierx] with --template-curly-spacing option support (...)
          indent([templateCurlyLine, printComments(p, printed, options)]),
          templateCurlyLine,
        ];
      },
      node.type === "JSXSpreadAttribute" ? "argument" : "expression"
    ),
    "}",
  ];
}

function printJsx(path, options, print) {
  const node = path.getValue();

  // JSX nodes always starts with `JSX`
  if (!node.type.startsWith("JSX")) {
    return;
  }

  switch (node.type) {
    case "JSXAttribute":
      return printJsxAttribute(path, options, print);
    case "JSXIdentifier":
      return String(node.name);
    case "JSXNamespacedName":
      return join(":", [print("namespace"), print("name")]);
    case "JSXMemberExpression":
      return join(".", [print("object"), print("property")]);
    case "JSXSpreadAttribute":
      return printJsxSpreadAttribute(path, options, print);
    case "JSXSpreadChild": {
      // Same as `printJsxSpreadAttribute`
      const printJsxSpreadChild = printJsxSpreadAttribute;
      return printJsxSpreadChild(path, options, print);
    }
    case "JSXExpressionContainer":
      return printJsxExpressionContainer(path, options, print);
    case "JSXFragment":
    case "JSXElement":
      return printJsxElement(path, options, print);
    case "JSXOpeningElement":
      return printJsxOpeningElement(path, options, print);
    case "JSXClosingElement":
      return printJsxClosingElement(path, options, print);
    case "JSXOpeningFragment":
    case "JSXClosingFragment":
      return printJsxOpeningClosingFragment(path, options /*, print*/);
    case "JSXEmptyExpression":
      return printJsxEmptyExpression(path, options /*, print*/);
    case "JSXText":
      /* istanbul ignore next */
      throw new Error("JSXTest should be handled by JSXElement");
    default:
      /* istanbul ignore next */
      throw new Error(`Unknown JSX node type: ${JSON.stringify(node.type)}.`);
  }
}

// Only space, newline, carriage return, and tab are treated as whitespace
// inside JSX.
const jsxWhitespaceChars = " \n\r\t";
const matchJsxWhitespaceRegex = new RegExp("([" + jsxWhitespaceChars + "]+)");
const containsNonJsxWhitespaceRegex = new RegExp(
  "[^" + jsxWhitespaceChars + "]"
);
const trimJsxWhitespace = (text) =>
  text.replace(
    new RegExp(
      "(?:^" +
        matchJsxWhitespaceRegex.source +
        "|" +
        matchJsxWhitespaceRegex.source +
        "$)"
    ),
    ""
  );

/**
 * @param {JSXElement} node
 * @returns {boolean}
 */
function isEmptyJsxElement(node) {
  if (node.children.length === 0) {
    return true;
  }
  if (node.children.length > 1) {
    return false;
  }

  // if there is one text child and does not contain any meaningful text
  // we can treat the element as empty.
  const child = node.children[0];
  return isLiteral(child) && !isMeaningfulJsxText(child);
}

// Meaningful if it contains non-whitespace characters,
// or it contains whitespace without a new line.
/**
 * @param {Node} node
 * @returns {boolean}
 */
function isMeaningfulJsxText(node) {
  return (
    isLiteral(node) &&
    (containsNonJsxWhitespaceRegex.test(rawText(node)) ||
      !/\n/.test(rawText(node)))
  );
}

// Detect an expression node representing `{" "}`
function isJsxWhitespaceExpression(node) {
  return (
    node.type === "JSXExpressionContainer" &&
    isLiteral(node.expression) &&
    node.expression.value === " " &&
    !hasComment(node.expression)
  );
}

/**
 * @param {AstPath} path
 * @returns {boolean}
 */
function hasJsxIgnoreComment(path) {
  const node = path.getValue();
  const parent = path.getParentNode();
  if (!parent || !node || !isJsxNode(node) || !isJsxNode(parent)) {
    return false;
  }

  // Lookup the previous sibling, ignoring any empty JSXText elements
  const index = parent.children.indexOf(node);
  let prevSibling = null;
  for (let i = index; i > 0; i--) {
    const candidate = parent.children[i - 1];
    if (candidate.type === "JSXText" && !isMeaningfulJsxText(candidate)) {
      continue;
    }
    prevSibling = candidate;
    break;
  }

  return (
    prevSibling &&
    prevSibling.type === "JSXExpressionContainer" &&
    prevSibling.expression.type === "JSXEmptyExpression" &&
    hasNodeIgnoreComment(prevSibling.expression)
  );
}

module.exports = {
  hasJsxIgnoreComment,
  printJsx,
};
