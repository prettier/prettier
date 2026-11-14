import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import { isObjectProperty } from "../utilities/is-object-property.js";
import {
  isArrayExpression,
  isBinaryCastExpression,
} from "../utilities/node-types.js";

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

/**
 * Storybook Angular CSF stories can return inline Angular templates from
 * render(). Require a named story export and an @storybook/angular import.
 */
function isAngularStorybookTemplate(path) {
  const isProperty = (name) => (node, key) =>
    key === "value" &&
    isObjectProperty(node) &&
    !node.computed &&
    node.key.type === "Identifier" &&
    node.key.name === name;
  const isObjectLiteral = (node, key) =>
    node.type === "ObjectExpression" && key === "properties";
  const isRenderArrow = (node, key) =>
    node.type === "ArrowFunctionExpression" && key === "body";
  const isReturn = (node, key) =>
    node.type === "ReturnStatement" && key === "argument";
  const isBlock = (node, key) =>
    node.type === "BlockStatement" && key === "body";
  const isStoryInitializer = (node, key) =>
    node.type === "VariableDeclarator" && key === "init";
  const isVariableDeclaration = (node, key) =>
    node.type === "VariableDeclaration" && key === "declarations";
  const isNamedExport = (node, key) =>
    node.type === "ExportNamedDeclaration" && key === "declaration";
  const isCast = (node, key) =>
    isBinaryCastExpression(node) && key === "expression";
  const isRenderMethod = (node, key) =>
    key === "body" &&
    node.type === "ObjectMethod" &&
    node.kind === "method" &&
    !node.computed &&
    node.key.type === "Identifier" &&
    node.key.name === "render";
  const isEstreeRenderMethod = (node, key) =>
    node.type === "Property" &&
    node.method &&
    !node.computed &&
    node.key.type === "Identifier" &&
    node.key.name === "render" &&
    key === "value";

  if (
    !path.match(
      (node) => node.type === "TemplateLiteral",
      isProperty("template"),
      isObjectLiteral,
    )
  ) {
    return false;
  }

  const storyDeclaration = [
    isStoryInitializer,
    isVariableDeclaration,
    isNamedExport,
  ];
  const matchesStory = (...renderPredicates) => {
    const predicates = [
      undefined,
      undefined,
      undefined,
      ...renderPredicates,
      isObjectLiteral,
    ];
    return (
      path.match(...predicates, ...storyDeclaration) ||
      path.match(...predicates, isCast, ...storyDeclaration)
    );
  };
  const inRender =
    matchesStory(isRenderArrow, isProperty("render")) ||
    matchesStory(isReturn, isBlock, isRenderArrow, isProperty("render")) ||
    matchesStory(isReturn, isBlock, isRenderMethod) ||
    matchesStory(
      isReturn,
      isBlock,
      (node, key) => node.type === "FunctionExpression" && key === "body",
      isEstreeRenderMethod,
    );

  if (!inRender) {
    return false;
  }

  const program = path.findAncestor((node) => node.type === "Program");

  return program?.body.some(
    (node) =>
      node.type === "ImportDeclaration" &&
      node.source.value === "@storybook/angular",
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
  isAngularStorybookTemplate,
};
