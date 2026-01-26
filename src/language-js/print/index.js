import {
  group,
  indent,
  inheritLabel,
  line,
  softline,
} from "../../document/index.js";
import { printComments } from "../../main/comments/print.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import needsParentheses from "../parentheses/needs-parentheses.js";
import {
  CommentCheckFlags,
  createTypeCheckFunction,
  hasComment,
  isIifeCalleeOrTaggedTemplateExpressionTag,
} from "../utilities/index.js";
import isIgnored from "../utilities/is-ignored.js";
import { printAngular } from "./angular.js";
import { printDecorators } from "./decorators.js";
import { printEstree } from "./estree.js";
import { printFlow } from "./flow.js";
import { printIgnored } from "./ignored.js";
import { printJsx } from "./jsx.js";
import { printTypescript } from "./typescript.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

function printWithoutParentheses(path, options, print, args) {
  for (const printer of [
    printAngular,
    printJsx,
    printFlow,
    printTypescript,
    printEstree,
  ]) {
    const doc = printer(path, options, print, args);
    if (doc !== undefined) {
      return doc;
    }
  }
}

// Their decorators are handled themselves, and they don't need parentheses or leading semicolons
const shouldPrintDirectly = createTypeCheckFunction([
  "ClassMethod",
  "ClassPrivateMethod",
  "ClassProperty",
  "ClassAccessorProperty",
  "AccessorProperty",
  "TSAbstractAccessorProperty",
  "PropertyDefinition",
  "TSAbstractPropertyDefinition",
  "ClassPrivateProperty",
  "MethodDefinition",
  "TSAbstractMethodDefinition",
  "TSDeclareMethod",
]);

/**
 * @param {AstPath} path
 * @param {*} options
 * @param {*} print
 * @param {*} [args]
 * @returns {Doc}
 */
function print(path, options, print, args) {
  if (path.isRoot) {
    options.__onHtmlBindingRoot?.(path.node, options);
  }

  const { node } = path;

  let doc = isIgnored(path)
    ? printIgnored(path, options)
    : printWithoutParentheses(path, options, print, args);
  if (!doc) {
    return "";
  }

  if (shouldPrintDirectly(node)) {
    return doc;
  }

  doc = printCommentsForFunction(path, options, doc);

  const hasDecorators = isNonEmptyArray(node.decorators);
  const decoratorsDoc = printDecorators(path, options, print);
  const isClassExpression = node.type === "ClassExpression";
  // Nodes (except `ClassExpression`) with decorators can't have parentheses and don't need leading semicolons
  if (hasDecorators && !isClassExpression) {
    return inheritLabel(doc, (doc) => group([decoratorsDoc, doc]));
  }

  const needsParens = needsParentheses(path, options);

  if (!decoratorsDoc && !needsParens) {
    return doc;
  }

  return inheritLabel(doc, (doc) => [
    needsParens ? "(" : "",
    needsParens && isClassExpression && hasDecorators
      ? [indent([line, decoratorsDoc, doc]), line]
      : [decoratorsDoc, doc],
    needsParens ? ")" : "",
  ]);
}

function printCommentsForFunction(path, options, doc) {
  const { node } = path;

  if (
    (hasComment(node, CommentCheckFlags.Leading) ||
      hasComment(node, CommentCheckFlags.Trailing)) &&
    isIifeCalleeOrTaggedTemplateExpressionTag(path)
  ) {
    return [indent([softline, printComments(path, doc, options)]), softline];
  }

  return doc;
}

export { print as printEstree };
