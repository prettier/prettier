import { label } from "../document/builders.js";
import {
  hasComment,
  CommentCheckFlags,
  isObjectProperty,
  isArrayOrTupleExpression,
} from "./utils/index.js";
import embedMarkdown from "./embed/markdown.js";
import embedCss from "./embed/css.js";
import embedGraphQL from "./embed/graphql.js";
import { embedHtml, embedAngular } from "./embed/html.js";

function embed(path) {
  const { node } = path;

  if (
    node.type !== "TemplateLiteral" ||
    // Bail out if any of the quasis have an invalid escape sequence
    // (which would make the `cooked` value be `null`)
    hasInvalidCookedValue(node)
  ) {
    return;
  }

  const embedder = getEmbedder(path);

  if (embedder) {
    // Special case: whitespace-only template literals
    if (node.quasis.length === 1 && node.quasis[0].value.raw.trim() === "") {
      return "``";
    }

    return async (...args) => {
      const doc = await embedder(...args);
      return doc && label({ embed: true, ...doc.label }, doc);
    };
  }
}

function getEmbedder(path) {
  if (
    isStyledJsx(path) ||
    isStyledComponents(path) ||
    isCssProp(path) ||
    isAngularComponentStyles(path)
  ) {
    return embedCss;
  }

  if (isGraphQL(path)) {
    return embedGraphQL;
  }

  if (isHtml(path)) {
    return embedHtml;
  }

  if (isAngularComponentTemplate(path)) {
    return embedAngular;
  }

  if (isMarkdown(path)) {
    return embedMarkdown;
  }
}

/**
 * md`...`
 * markdown`...`
 */
function isMarkdown({ node, parent }) {
  return (
    parent?.type === "TaggedTemplateExpression" &&
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
function isStyledJsx({ node, parent, grandparent }) {
  return (
    (grandparent &&
      node.quasis &&
      parent.type === "JSXExpressionContainer" &&
      grandparent.type === "JSXElement" &&
      grandparent.openingElement.name.name === "style" &&
      grandparent.openingElement.attributes.some(
        (attribute) => attribute.name.name === "jsx"
      )) ||
    (parent?.type === "TaggedTemplateExpression" &&
      parent.tag.type === "Identifier" &&
      parent.tag.name === "css") ||
    (parent?.type === "TaggedTemplateExpression" &&
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
    (node, name) => isArrayOrTupleExpression(node) && name === "elements",
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
function isStyledComponents({ parent }) {
  if (!parent || parent.type !== "TaggedTemplateExpression") {
    return false;
  }

  const tag =
    parent.tag.type === "ParenthesizedExpression"
      ? parent.tag.expression
      : parent.tag;

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
function isCssProp({ parent, grandparent }) {
  return (
    grandparent?.type === "JSXAttribute" &&
    parent.type === "JSXExpressionContainer" &&
    grandparent.name.type === "JSXIdentifier" &&
    grandparent.name.name === "css"
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
function isGraphQL({ node, parent }) {
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
          (parent.callee.name === "gql" || parent.callee.name === "graphql"))))
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
    hasLanguageComment(path.node, "HTML") ||
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

export default embed;
