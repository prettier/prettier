import { group, indent, line } from "../../document/builders.js";
import { inheritLabel } from "../../document/utils.js";
import printIgnored from "../../main/print-ignored.js";
import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import pathNeedsParens from "../needs-parens.js";
import { createTypeCheckFunction } from "../utils/index.js";
import isIgnored from "../utils/is-ignored.js";
import { printAngular } from "./angular.js";
import { printDecorators } from "./decorators.js";
import { printEstree } from "./estree.js";
import { printFlow } from "./flow.js";
import { printJsx } from "./jsx.js";
import { shouldPrintLeadingSemicolon } from "./semicolon.js";
import { printTypescript } from "./typescript.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/builders.js"
 */

function printWithoutParentheses(path, options, print, args) {
  if (isIgnored(path)) {
    return printIgnored(path, options);
  }

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

  const doc = printWithoutParentheses(path, options, print, args);
  if (!doc) {
    return "";
  }

  const { node } = path;
  if (shouldPrintDirectly(node)) {
    return doc;
  }

  const hasDecorators = isNonEmptyArray(node.decorators);
  const decoratorsDoc = printDecorators(path, options, print);
  const isClassExpression = node.type === "ClassExpression";
  // Nodes (except `ClassExpression`) with decorators can't have parentheses and don't need leading semicolons
  if (hasDecorators && !isClassExpression) {
    return inheritLabel(doc, (doc) => group([decoratorsDoc, doc]));
  }

  const needsParens = pathNeedsParens(path, options);
  const needsSemi = shouldPrintLeadingSemicolon(path, options);

  if (!decoratorsDoc && !needsParens && !needsSemi) {
    return doc;
  }

  return inheritLabel(doc, (doc) => [
    needsSemi ? ";" : "",
    needsParens ? "(" : "",
    needsParens && isClassExpression && hasDecorators
      ? [indent([line, decoratorsDoc, doc]), line]
      : [decoratorsDoc, doc],
    needsParens ? ")" : "",
  ]);
}

export default print;
