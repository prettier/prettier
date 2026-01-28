import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import { isObjectProperty } from "../utilities/is-object-property.js";
import { isArrayExpression } from "../utilities/node-types.js";

const angularComponentObjectExpressionPredicates = [
  (node, name) => name === "properties" && node.type === "ObjectExpression",
  (node, name) =>
    name === "arguments" &&
    node.type === "CallExpression" &&
    node.callee.type === "Identifier" &&
    node.callee.name === "Component",
  (node, name) => name === "expression" && node.type === "Decorator",
];

/**
 * Angular Components can have:
 * - Inline HTML template
 * - Inline CSS styles
 *
 * ...which are both within template literals somewhere
 * inside of the Component decorator factory.
 *
 * E.g.
 * @Component({
 *  template: `<div>...</div>`,
 *  styles: [`h1 { color: blue; }`]
 * })
 */
function isAngularComponentStyles(path) {
  const isTemplateLiteral = (node) => node.type === "TemplateLiteral";
  const isObjectPropertyNamedStyles = (node, key) =>
    isObjectProperty(node) &&
    !node.computed &&
    node.key.type === "Identifier" &&
    node.key.name === "styles" &&
    key === "value";
  return (
    path.match(
      isTemplateLiteral,
      (node, name) => isArrayExpression(node) && name === "elements",
      isObjectPropertyNamedStyles,
      ...angularComponentObjectExpressionPredicates,
    ) ||
    path.match(
      isTemplateLiteral,
      isObjectPropertyNamedStyles,
      ...angularComponentObjectExpressionPredicates,
    )
  );
}
function isAngularComponentTemplate(path) {
  return path.match(
    (node) => node.type === "TemplateLiteral",
    (node, name) =>
      isObjectProperty(node) &&
      !node.computed &&
      node.key.type === "Identifier" &&
      node.key.name === "template" &&
      name === "value",
    ...angularComponentObjectExpressionPredicates,
  );
}

function hasLeadingBlockCommentWithName(node, languageName) {
  // This checks for a leading comment that is exactly `/* GraphQL */`
  // In order to be in line with other implementations of this comment tag
  // we will not trim the comment value and we will expect exactly one space on
  // either side of the GraphQL string
  // Also see ./clean.js
  return hasComment(
    node,
    CommentCheckFlags.Block | CommentCheckFlags.Leading,
    ({ value }) => value === ` ${languageName} `,
  );
}
function hasLanguageComment({ node, parent }, languageName) {
  return (
    hasLeadingBlockCommentWithName(node, languageName) ||
    (isAsConstExpression(parent) &&
      hasLeadingBlockCommentWithName(parent, languageName)) ||
    (parent.type === "ExpressionStatement" &&
      hasLeadingBlockCommentWithName(parent, languageName))
  );
}

function isAsConstExpression(node) {
  return (
    node.type === "AsConstExpression" ||
    (node.type === "TSAsExpression" &&
      node.typeAnnotation.type === "TSTypeReference" &&
      node.typeAnnotation.typeName.type === "Identifier" &&
      node.typeAnnotation.typeName.name === "const")
  );
}

export {
  hasLanguageComment,
  isAngularComponentStyles,
  isAngularComponentTemplate,
};
