import { group, indent, inheritLabel, softline } from "../../document/index.js";
import { printComments } from "../../main/comments/print.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import needsParentheses from "../parentheses/needs-parentheses.js";
import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import { createTypeCheckFunction } from "../utilities/create-type-check-function.js";
import isIgnored from "../utilities/is-ignored.js";
import { isIifeCalleeOrTaggedTemplateExpressionTag } from "../utilities/is-iife-callee-or-tagged-template-expression-tag.js";
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

  const decoratorsDoc =
    // `ClassExpression` prints own decorators
    node.type !== "ClassExpression" && isNonEmptyArray(node.decorators)
      ? printDecorators(path, options, print)
      : "";

  const needsParens = needsParentheses(path, options);

  if (!decoratorsDoc && !needsParens) {
    return doc;
  }

  return inheritLabel(doc, (doc) => [
    needsParens ? "(" : "",
    decoratorsDoc ? group([decoratorsDoc, doc]) : doc,
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
