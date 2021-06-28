"use strict";

const { hasComment, CommentCheckFlags, isObjectProperty } = require("./utils");
const formatMarkdown = require("./embed/markdown");
const formatCss = require("./embed/css");
const formatGraphql = require("./embed/graphql");
const formatHtml = require("./embed/html");

function getLanguage(path) {
  if (
    isStyledJsx(path) ||
    isStyledComponents(path) ||
    isCssProp(path) ||
    isAngularComponentStyles(path)
  ) {
    return "css";
  }

  if (isGraphQL(path)) {
    return "graphql";
  }

  if (isHtml(path)) {
    return "html";
  }

  if (isAngularComponentTemplate(path)) {
    return "angular";
  }

  if (isMarkdown(path)) {
    return "markdown";
  }
}

function embed(path, print, textToDoc, options) {
  const node = path.getValue();

  if (
    node.type !== "TemplateLiteral" ||
    // Bail out if any of the quasis have an invalid escape sequence
    // (which would make the `cooked` value be `null`)
    hasInvalidCookedValue(node)
  ) {
    return;
  }

  const language = getLanguage(path);
  if (!language) {
    return;
  }

  if (language === "markdown") {
    return formatMarkdown(path, print, textToDoc);
  }

  if (language === "css") {
    return formatCss(path, print, textToDoc);
  }

  if (language === "graphql") {
    return formatGraphql(path, print, textToDoc);
  }

  if (language === "html" || language === "angular") {
    return formatHtml(path, print, textToDoc, options, { parser: language });
  }
}

/**
 * md`...`
 * markdown`...`
 */
function isMarkdown(path) {
  const node = path.getValue();
  const parent = path.getParentNode();
  return (
    parent &&
    parent.type === "TaggedTemplateExpression" &&
    node.quasis.length === 1 &&
    parent.tag.type === "Identifier" &&
    (parent.tag.name === "md" || parent.tag.name === "markdown")
  );
}

/**
 * Template literal in these contexts:
 * <style jsx>{`div{color:red}`}</style>
 * css``
 * css.global``
 * css.resolve``
 */
function isStyledJsx(path) {
  const node = path.getValue();
  const parent = path.getParentNode();
  const parentParent = path.getParentNode(1);
  return (
    (parentParent &&
      node.quasis &&
      parent.type === "JSXExpressionContainer" &&
      parentParent.type === "JSXElement" &&
      parentParent.openingElement.name.name === "style" &&
      parentParent.openingElement.attributes.some(
        (attribute) => attribute.name.name === "jsx"
      )) ||
    (parent &&
      parent.type === "TaggedTemplateExpression" &&
      parent.tag.type === "Identifier" &&
      parent.tag.name === "css") ||
    (parent &&
      parent.type === "TaggedTemplateExpression" &&
      parent.tag.type === "MemberExpression" &&
      parent.tag.object.name === "css" &&
      (parent.tag.property.name === "global" ||
        parent.tag.property.name === "resolve"))
  );
}

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
  return path.match(
    (node) => node.type === "TemplateLiteral",
    (node, name) => node.type === "ArrayExpression" && name === "elements",
    (node, name) =>
      isObjectProperty(node) &&
      node.key.type === "Identifier" &&
      node.key.name === "styles" &&
      name === "value",
    ...angularComponentObjectExpressionPredicates
  );
}
function isAngularComponentTemplate(path) {
  return path.match(
    (node) => node.type === "TemplateLiteral",
    (node, name) =>
      isObjectProperty(node) &&
      node.key.type === "Identifier" &&
      node.key.name === "template" &&
      name === "value",
    ...angularComponentObjectExpressionPredicates
  );
}
const angularComponentObjectExpressionPredicates = [
  (node, name) => node.type === "ObjectExpression" && name === "properties",
  (node, name) =>
    node.type === "CallExpression" &&
    node.callee.type === "Identifier" &&
    node.callee.name === "Component" &&
    name === "arguments",
  (node, name) => node.type === "Decorator" && name === "expression",
];

/**
 * styled-components template literals
 */
function isStyledComponents(path) {
  const parent = path.getParentNode();

  if (!parent || parent.type !== "TaggedTemplateExpression") {
    return false;
  }

  const { tag } = parent;

  switch (tag.type) {
    case "MemberExpression":
      return (
        // styled.foo``
        isStyledIdentifier(tag.object) ||
        // Component.extend``
        isStyledExtend(tag)
      );

    case "CallExpression":
      return (
        // styled(Component)``
        isStyledIdentifier(tag.callee) ||
        (tag.callee.type === "MemberExpression" &&
          ((tag.callee.object.type === "MemberExpression" &&
            // styled.foo.attrs({})``
            (isStyledIdentifier(tag.callee.object.object) ||
              // Component.extend.attrs({})``
              isStyledExtend(tag.callee.object))) ||
            // styled(Component).attrs({})``
            (tag.callee.object.type === "CallExpression" &&
              isStyledIdentifier(tag.callee.object.callee))))
      );

    case "Identifier":
      // css``
      return tag.name === "css";

    default:
      return false;
  }
}

/**
 * JSX element with CSS prop
 */
function isCssProp(path) {
  const parent = path.getParentNode();
  const parentParent = path.getParentNode(1);
  return (
    parentParent &&
    parent.type === "JSXExpressionContainer" &&
    parentParent.type === "JSXAttribute" &&
    parentParent.name.type === "JSXIdentifier" &&
    parentParent.name.name === "css"
  );
}

function isStyledIdentifier(node) {
  return node.type === "Identifier" && node.name === "styled";
}

function isStyledExtend(node) {
  return /^[A-Z]/.test(node.object.name) && node.property.name === "extend";
}

/*
 * react-relay and graphql-tag
 * graphql`...`
 * graphql.experimental`...`
 * gql`...`
 * GraphQL comment block
 *
 * This intentionally excludes Relay Classic tags, as Prettier does not
 * support Relay Classic formatting.
 */
function isGraphQL(path) {
  const node = path.getValue();
  const parent = path.getParentNode();

  return (
    hasLanguageComment(node, "GraphQL") ||
    (parent &&
      ((parent.type === "TaggedTemplateExpression" &&
        ((parent.tag.type === "MemberExpression" &&
          parent.tag.object.name === "graphql" &&
          parent.tag.property.name === "experimental") ||
          (parent.tag.type === "Identifier" &&
            (parent.tag.name === "gql" || parent.tag.name === "graphql")))) ||
        (parent.type === "CallExpression" &&
          parent.callee.type === "Identifier" &&
          parent.callee.name === "graphql")))
  );
}

function hasLanguageComment(node, languageName) {
  // This checks for a leading comment that is exactly `/* GraphQL */`
  // In order to be in line with other implementations of this comment tag
  // we will not trim the comment value and we will expect exactly one space on
  // either side of the GraphQL string
  // Also see ./clean.js
  return hasComment(
    node,
    CommentCheckFlags.Block | CommentCheckFlags.Leading,
    ({ value }) => value === ` ${languageName} `
  );
}

/**
 *     - html`...`
 *     - HTML comment block
 */
function isHtml(path) {
  return (
    hasLanguageComment(path.getValue(), "HTML") ||
    path.match(
      (node) => node.type === "TemplateLiteral",
      (node, name) =>
        node.type === "TaggedTemplateExpression" &&
        node.tag.type === "Identifier" &&
        node.tag.name === "html" &&
        name === "quasi"
    )
  );
}

function hasInvalidCookedValue({ quasis }) {
  return quasis.some(({ value: { cooked } }) => cooked === null);
}

module.exports = embed;
