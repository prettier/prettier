import {
  conditionalGroup,
  cursor,
  fill,
  group,
  hardline,
  ifBreak,
  indent,
  join,
  line,
  lineSuffixBoundary,
  softline,
} from "../../document/builders.js";
import {
  isEmptyDoc,
  replaceEndOfLine,
  willBreak,
} from "../../document/utils.js";
import {
  printComments,
  printDanglingComments,
} from "../../main/comments/print.js";
import getPreferredQuote from "../../utils/get-preferred-quote.js";
import UnexpectedNodeError from "../../utils/unexpected-node-error.js";
import WhitespaceUtils from "../../utils/whitespace-utils.js";
import { willPrintOwnComments } from "../comments/printer-methods.js";
import pathNeedsParens from "../needs-parens.js";
import getRaw from "../utils/get-raw.js";
import {
  CommentCheckFlags,
  hasComment,
  hasNodeIgnoreComment,
  isArrayExpression,
  isBinaryish,
  isCallExpression,
  isJsxElement,
  isObjectExpression,
  isStringLiteral,
} from "../utils/index.js";

/*
Only the following are treated as whitespace inside JSX.

- U+0020 SPACE
- U+000A LF
- U+000D CR
- U+0009 TAB
*/
const jsxWhitespaceUtils = new WhitespaceUtils(" \n\r\t");

const isEmptyStringOrAnyLine = (doc) =>
  doc === "" || doc === line || doc === hardline || doc === softline;

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Node, JSXElement} from "../types/estree.js"
 * @import {Doc} from "../../document/builders.js"
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
  const { node } = path;

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

  const containsTag = node.children.some(isJsxElement);
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

  const isMdxBlock = path.parent.rootMarker === "mdx";

  const rawJsxWhitespace = options.singleQuote ? "{' '}" : '{" "}';
  const jsxWhitespace = isMdxBlock
    ? line
    : ifBreak([rawJsxWhitespace, softline], " ");

  const isFacebookTranslationTag = node.openingElement?.name?.name === "fbt";

  const children = printJsxChildren(
    path,
    options,
    print,
    jsxWhitespace,
    isFacebookTranslationTag,
  );

  const containsText = node.children.some((child) =>
    isMeaningfulJsxText(child),
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
  while (children.length > 0 && isEmptyStringOrAnyLine(children.at(-1))) {
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

  /*
   * Tweak how we format children if outputting this element over multiple lines.
   * Also detect whether we will force this element to output over multiple lines.
   *
   * Moreover, we need to ensure that we always have line-like doc at odd index, that is rule of fill().
   * Assuming that parts.length is always odd, satisfying the above can be straightforwardly done by:
   * - if we push line-like doc, we push empty string after it
   * - if we push non-line-like doc, push [parts.pop(), doc] instead
   */
  /** @type {Doc[]} */
  const multilineChildren = [""];
  for (const [i, child] of children.entries()) {
    // There are a number of situations where we need to ensure we display
    // whitespace as `{" "}` when outputting this element over multiple lines.
    if (child === jsxWhitespace) {
      if (i === 1 && isEmptyDoc(children[i - 1])) {
        if (children.length === 2) {
          // Solitary whitespace
          multilineChildren.push([multilineChildren.pop(), rawJsxWhitespace]);
          continue;
        }
        // Leading whitespace
        multilineChildren.push([rawJsxWhitespace, hardline], "");
        continue;
      } else if (i === children.length - 1) {
        // Trailing whitespace
        multilineChildren.push([multilineChildren.pop(), rawJsxWhitespace]);
        continue;
      } else if (children[i - 1] === "" && children[i - 2] === hardline) {
        // Whitespace after line break
        multilineChildren.push([multilineChildren.pop(), rawJsxWhitespace]);
        continue;
      }
    }

    // Note that children always satisfy the rule of fill() content.
    // - printJsxChildren always returns valid fill() content
    // - we always remove even number (containing zero) of leading items from children.
    if (i % 2 === 0) {
      // non-line-like
      multilineChildren.push([multilineChildren.pop(), child]);
    } else {
      // line-like
      multilineChildren.push(child, "");
    }

    if (willBreak(child)) {
      forcedBreak = true;
    }
  }

  // If there is text we use `fill` to fit as much onto each line as possible.
  // When there is no text (just tags and expressions) we use `group`
  // to output each on a separate line.
  /** @type {Doc} */
  let content = containsText
    ? fill(multilineChildren)
    : group(multilineChildren, { shouldBreak: true });

  /*
  `printJsxChildren` won't call `print` on `JSXText`, so when the cursorNode,
  nodeBeforeCursor, or nodeAfterCursor is inside, `cursor` won't get printed.
  This logic fixes that:
  */
  if (
    options.cursorNode?.type === "JSXText" &&
    node.children.includes(options.cursorNode)
  ) {
    content = [cursor, content, cursor];
  } else if (
    options.nodeBeforeCursor?.type === "JSXText" &&
    node.children.includes(options.nodeBeforeCursor)
  ) {
    content = [cursor, content];
  } else if (
    options.nodeAfterCursor?.type === "JSXText" &&
    node.children.includes(options.nodeAfterCursor)
  ) {
    content = [content, cursor];
  }

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
// This function returns Doc array that satisfies rule of `fill()`.
function printJsxChildren(
  path,
  options,
  print,
  jsxWhitespace,
  isFacebookTranslationTag,
) {
  /** @type {Doc} */
  let prevPart = "";
  /** @type {Doc[]} */
  const parts = [prevPart];
  // To ensure rule of `fill()`, we use `push()` and `pushLine()` instead of `parts.push()`.
  function push(doc) {
    prevPart = doc;
    parts.push([parts.pop(), doc]);
  }
  function pushLine(doc) {
    if (doc === "") {
      return;
    }
    prevPart = doc;
    parts.push(doc, "");
  }
  path.each(({ node, next }) => {
    if (node.type === "JSXText") {
      const text = getRaw(node);

      // Contains a non-whitespace character
      if (isMeaningfulJsxText(node)) {
        const words = jsxWhitespaceUtils.split(
          text,
          /* captureWhitespace */ true,
        );

        // Starts with whitespace
        if (words[0] === "") {
          words.shift();
          if (/\n/u.test(words[0])) {
            pushLine(
              separatorWithWhitespace(
                isFacebookTranslationTag,
                words[1],
                node,
                next,
              ),
            );
          } else {
            pushLine(jsxWhitespace);
          }
          words.shift();
        }

        let endWhitespace;
        // Ends with whitespace
        if (words.at(-1) === "") {
          words.pop();
          endWhitespace = words.pop();
        }

        // This was whitespace only without a new line.
        if (words.length === 0) {
          return;
        }

        for (const [i, word] of words.entries()) {
          if (i % 2 === 1) {
            pushLine(line);
          } else {
            push(word);
          }
        }

        if (endWhitespace !== undefined) {
          if (/\n/u.test(endWhitespace)) {
            pushLine(
              separatorWithWhitespace(
                isFacebookTranslationTag,
                prevPart,
                node,
                next,
              ),
            );
          } else {
            pushLine(jsxWhitespace);
          }
        } else {
          pushLine(
            separatorNoWhitespace(
              isFacebookTranslationTag,
              prevPart,
              node,
              next,
            ),
          );
        }
      } else if (/\n/u.test(text)) {
        // Keep (up to one) blank line between tags/expressions/text.
        // Note: We don't keep blank lines between text elements.
        if (text.match(/\n/gu).length > 1) {
          pushLine(hardline);
        }
      } else {
        pushLine(jsxWhitespace);
      }
    } else {
      const printedChild = print();
      push(printedChild);

      const directlyFollowedByMeaningfulText =
        next && isMeaningfulJsxText(next);
      if (directlyFollowedByMeaningfulText) {
        const trimmed = jsxWhitespaceUtils.trim(getRaw(next));
        const [firstWord] = jsxWhitespaceUtils.split(trimmed);
        pushLine(
          separatorNoWhitespace(
            isFacebookTranslationTag,
            firstWord,
            node,
            next,
          ),
        );
      } else {
        pushLine(hardline);
      }
    }
  }, "children");

  return parts;
}

function separatorNoWhitespace(
  isFacebookTranslationTag,
  child,
  childNode,
  nextNode,
) {
  if (isFacebookTranslationTag) {
    return "";
  }

  if (
    (childNode.type === "JSXElement" && !childNode.closingElement) ||
    (nextNode?.type === "JSXElement" && !nextNode.closingElement)
  ) {
    return child.length === 1 ? softline : hardline;
  }

  return softline;
}

function separatorWithWhitespace(
  isFacebookTranslationTag,
  child,
  childNode,
  nextNode,
) {
  if (isFacebookTranslationTag) {
    return hardline;
  }

  if (child.length === 1) {
    return (childNode.type === "JSXElement" && !childNode.closingElement) ||
      (nextNode?.type === "JSXElement" && !nextNode.closingElement)
      ? hardline
      : softline;
  }

  return hardline;
}

const NO_WRAP_PARENTS = new Set([
  "ArrayExpression",
  "JSXAttribute",
  "JSXElement",
  "JSXExpressionContainer",
  "JSXFragment",
  "ExpressionStatement",
  "CallExpression",
  "OptionalCallExpression",
  "ConditionalExpression",
  "JsExpressionRoot",
]);
function maybeWrapJsxElementInParens(path, elem, options) {
  const { parent } = path;

  if (NO_WRAP_PARENTS.has(parent.type)) {
    return elem;
  }

  const shouldBreak = path.match(
    undefined,
    (node) => node.type === "ArrowFunctionExpression",
    isCallExpression,
    (node) => node.type === "JSXExpressionContainer",
  );

  const needsParens = pathNeedsParens(path, options);

  return group(
    [
      needsParens ? "" : ifBreak("("),
      indent([softline, elem]),
      softline,
      needsParens ? "" : ifBreak(")"),
    ],
    { shouldBreak },
  );
}

function printJsxAttribute(path, options, print) {
  const { node } = path;
  const parts = [];
  parts.push(print("name"));

  if (node.value) {
    let res;
    if (isStringLiteral(node.value)) {
      const raw = getRaw(node.value);
      // Remove enclosing quotes and unescape
      // all quotes so we get an accurate preferred quote
      let final = raw
        .slice(1, -1)
        .replaceAll("&apos;", "'")
        .replaceAll("&quot;", '"');
      const quote = getPreferredQuote(final, options.jsxSingleQuote);
      final =
        quote === '"'
          ? final.replaceAll('"', "&quot;")
          : final.replaceAll("'", "&apos;");
      res = path.call(
        () =>
          printComments(path, replaceEndOfLine(quote + final + quote), options),
        "value",
      );
    } else {
      res = print("value");
    }
    parts.push("=", res);
  }

  return parts;
}

function printJsxExpressionContainer(path, options, print) {
  const { node } = path;

  const shouldInline = (node, parent) =>
    node.type === "JSXEmptyExpression" ||
    (!hasComment(node) &&
      (isArrayExpression(node) ||
        isObjectExpression(node) ||
        node.type === "ArrowFunctionExpression" ||
        (node.type === "AwaitExpression" &&
          (shouldInline(node.argument, node) ||
            node.argument.type === "JSXElement")) ||
        isCallExpression(node) ||
        (node.type === "ChainExpression" &&
          isCallExpression(node.expression)) ||
        node.type === "FunctionExpression" ||
        node.type === "TemplateLiteral" ||
        node.type === "TaggedTemplateExpression" ||
        node.type === "DoExpression" ||
        (isJsxElement(parent) &&
          (node.type === "ConditionalExpression" || isBinaryish(node)))));

  if (shouldInline(node.expression, path.parent)) {
    return group(["{", print("expression"), lineSuffixBoundary, "}"]);
  }

  return group([
    "{",
    indent([softline, print("expression")]),
    softline,
    lineSuffixBoundary,
    "}",
  ]);
}

function printJsxOpeningElement(path, options, print) {
  const { node } = path;

  const nameHasComments =
    hasComment(node.name) ||
    hasComment(node.typeParameters) ||
    hasComment(node.typeArguments);

  // Don't break self-closing elements with no attributes and no comments
  if (node.selfClosing && node.attributes.length === 0 && !nameHasComments) {
    return [
      "<",
      print("name"),
      node.typeArguments ? print("typeArguments") : print("typeParameters"),
      " />",
    ];
  }

  // don't break up opening elements with a single long text attribute
  if (
    node.attributes?.length === 1 &&
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
      node.typeArguments ? print("typeArguments") : print("typeParameters"),
      " ",
      ...path.map(print, "attributes"),
      node.selfClosing ? " />" : ">",
    ]);
  }

  // We should print the opening element expanded if any prop value is a
  // string literal with newlines
  const shouldBreak = node.attributes?.some(
    (attr) => isStringLiteral(attr.value) && attr.value.value.includes("\n"),
  );

  const attributeLine =
    options.singleAttributePerLine && node.attributes.length > 1
      ? hardline
      : line;

  return group(
    [
      "<",
      print("name"),
      node.typeArguments ? print("typeArguments") : print("typeParameters"),
      indent(path.map(() => [attributeLine, print()], "attributes")),
      ...printEndOfOpeningTag(node, options, nameHasComments),
    ],
    { shouldBreak },
  );
}

function printEndOfOpeningTag(node, options, nameHasComments) {
  if (node.selfClosing) {
    return [line, "/>"];
  }
  const bracketSameLine = shouldPrintBracketSameLine(
    node,
    options,
    nameHasComments,
  );
  if (bracketSameLine) {
    return [">"];
  }
  return [softline, ">"];
}

function shouldPrintBracketSameLine(node, options, nameHasComments) {
  const lastAttrHasTrailingComments =
    node.attributes.length > 0 &&
    hasComment(node.attributes.at(-1), CommentCheckFlags.Trailing);
  return (
    // Simple tags (no attributes and no comment in tag name) should be
    // kept unbroken regardless of `bracketSameLine`.
    // jsxBracketSameLine is deprecated in favour of bracketSameLine,
    // but is still needed for backwards compatibility.
    (node.attributes.length === 0 && !nameHasComments) ||
    ((options.bracketSameLine || options.jsxBracketSameLine) &&
      // We should print the bracket in a new line for the following cases:
      // <div
      //   // comment
      // >
      // <div
      //   attr // comment
      // >
      (!nameHasComments || node.attributes.length > 0) &&
      !lastAttrHasTrailingComments)
  );
}

function printJsxClosingElement(path, options, print) {
  const { node } = path;
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
  const { node } = path;
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
      printDanglingComments(path, options),
    ]),
    hasOwnLineComment ? hardline : "",
    ">",
  ];
}

function printJsxElement(path, options, print) {
  const elem = printComments(
    path,
    printJsxElementInternal(path, options, print),
    options,
  );
  return maybeWrapJsxElementInParens(path, elem, options);
}

function printJsxEmptyExpression(path, options /*, print*/) {
  const { node } = path;
  const requiresHardline = hasComment(node, CommentCheckFlags.Line);

  return [
    printDanglingComments(path, options, { indent: requiresHardline }),
    requiresHardline ? hardline : "",
  ];
}

// `JSXSpreadAttribute` and `JSXSpreadChild`
function printJsxSpreadAttributeOrChild(path, options, print) {
  const { node } = path;
  return [
    "{",
    path.call(
      ({ node }) => {
        const printed = ["...", print()];
        if (!hasComment(node) || !willPrintOwnComments(path)) {
          return printed;
        }
        return [
          indent([softline, printComments(path, printed, options)]),
          softline,
        ];
      },
      node.type === "JSXSpreadAttribute" ? "argument" : "expression",
    ),
    "}",
  ];
}

function printJsx(path, options, print) {
  const { node } = path;

  // JSX nodes always starts with `JSX`
  if (!node.type.startsWith("JSX")) {
    return;
  }

  switch (node.type) {
    case "JSXAttribute":
      return printJsxAttribute(path, options, print);
    case "JSXIdentifier":
      return node.name;
    case "JSXNamespacedName":
      return join(":", [print("namespace"), print("name")]);
    case "JSXMemberExpression":
      return join(".", [print("object"), print("property")]);
    case "JSXSpreadAttribute":
    case "JSXSpreadChild":
      return printJsxSpreadAttributeOrChild(path, options, print);
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
      /* c8 ignore next */
      throw new Error("JSXText should be handled by JSXElement");
    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "JSX");
  }
}

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
  return child.type === "JSXText" && !isMeaningfulJsxText(child);
}

// Meaningful if it contains non-whitespace characters,
// or it contains whitespace without a new line.
/**
 * @param {Node} node
 * @returns {boolean}
 */
function isMeaningfulJsxText(node) {
  return (
    node.type === "JSXText" &&
    (jsxWhitespaceUtils.hasNonWhitespaceCharacter(getRaw(node)) ||
      !/\n/u.test(getRaw(node)))
  );
}

// Detect an expression node representing `{" "}`
function isJsxWhitespaceExpression(node) {
  return (
    node.type === "JSXExpressionContainer" &&
    isStringLiteral(node.expression) &&
    node.expression.value === " " &&
    !hasComment(node.expression)
  );
}

/**
 * @param {AstPath} path
 * @returns {boolean}
 */
function hasJsxIgnoreComment(path) {
  const { node, parent } = path;
  if (!isJsxElement(node) || !isJsxElement(parent)) {
    return false;
  }

  // Lookup the previous sibling, ignoring any empty JSXText elements
  const { index, siblings } = path;
  let prevSibling;
  for (let i = index; i > 0; i--) {
    const candidate = siblings[i - 1];
    if (candidate.type === "JSXText" && !isMeaningfulJsxText(candidate)) {
      continue;
    }
    prevSibling = candidate;
    break;
  }

  return (
    prevSibling?.type === "JSXExpressionContainer" &&
    prevSibling.expression.type === "JSXEmptyExpression" &&
    hasNodeIgnoreComment(prevSibling.expression)
  );
}

export { hasJsxIgnoreComment, printJsx };
