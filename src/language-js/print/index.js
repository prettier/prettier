import { group, indent, inheritLabel, line } from "../../document/index.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import { locEnd, locStart } from "../loc.js";
import needsParentheses from "../parentheses/needs-parentheses.js";
import { shouldPrintLeadingSemicolon } from "../semicolon/semicolon.js";
import { createTypeCheckFunction } from "../utilities/index.js";
import isIgnored from "../utilities/is-ignored.js";
import { printAngular } from "./angular.js";
import { printDecorators } from "./decorators.js";
import { printEstree } from "./estree.js";
import { printFlow } from "./flow.js";
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

  const doc = isIgnored(path)
    ? options.originalText.slice(locStart(node), locEnd(node))
    : printWithoutParentheses(path, options, print, args);
  if (!doc) {
    return "";
  }

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

  const needsParens = needsParentheses(path, options);
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
