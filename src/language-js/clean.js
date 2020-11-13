"use strict";

const { isBlockComment } = require("./utils");

const ignoredProperties = new Set([
  "range",
  "raw",
  "comments",
  "leadingComments",
  "trailingComments",
  "innerComments",
  "extra",
  "start",
  "end",
  "loc",
  "flags",
  "errors",
  "tokens",
]);

function clean(node) {
  if (node.type === "Program") {
    delete node.sourceType;
  }

  if (
    node.type === "BigIntLiteral" ||
    node.type === "BigIntLiteralTypeAnnotation"
  ) {
    if (node.value) {
      node.value = node.value.toLowerCase();
    }
  }
  if (node.type === "BigIntLiteral" || node.type === "Literal") {
    if (node.bigint) {
      node.bigint = node.bigint.toLowerCase();
    }
  }

  if (node.type === "DecimalLiteral") {
    node.value = Number(node.value);
  }

  // We remove extra `;` and add them when needed
  if (node.type === "EmptyStatement") {
    return null;
  }

  // We move text around, including whitespaces and add {" "}
  if (node.type === "JSXText") {
    return null;
  }
  if (
    node.type === "JSXExpressionContainer" &&
    (node.expression.type === "Literal" ||
      node.expression.type === "StringLiteral") &&
    node.expression.value === " "
  ) {
    return null;
  }

  // We change {'key': value} into {key: value}.
  // And {key: value} into {'key': value}.
  // Also for (some) number keys.
  if (
    (node.type === "Property" ||
      node.type === "ObjectProperty" ||
      node.type === "MethodDefinition" ||
      node.type === "ClassProperty" ||
      node.type === "ClassMethod" ||
      node.type === "FieldDefinition" ||
      node.type === "TSDeclareMethod" ||
      node.type === "TSPropertySignature" ||
      node.type === "ObjectTypeProperty") &&
    typeof node.key === "object" &&
    node.key &&
    (node.key.type === "Literal" ||
      node.key.type === "NumericLiteral" ||
      node.key.type === "StringLiteral" ||
      node.key.type === "Identifier")
  ) {
    delete node.key;
  }

  if (node.type === "OptionalMemberExpression" && node.optional === false) {
    node.type = "MemberExpression";
    delete node.optional;
  }

  // Remove raw and cooked values from TemplateElement when it's CSS
  // styled-jsx
  if (
    node.type === "JSXElement" &&
    node.openingElement.name.name === "style" &&
    node.openingElement.attributes.some((attr) => attr.name.name === "jsx")
  ) {
    const templateLiterals = node.children
      .filter(
        (child) =>
          child.type === "JSXExpressionContainer" &&
          child.expression.type === "TemplateLiteral"
      )
      .map((container) => container.expression);

    const quasis = templateLiterals.reduce(
      (quasis, templateLiteral) => quasis.concat(templateLiteral.quasis),
      []
    );

    quasis.forEach((q) => delete q.value);
  }

  // CSS template literals in css prop
  if (
    node.type === "JSXAttribute" &&
    node.name.name === "css" &&
    node.value.type === "JSXExpressionContainer" &&
    node.value.expression.type === "TemplateLiteral"
  ) {
    node.value.expression.quasis.forEach((q) => delete q.value);
  }

  // We change quotes
  if (
    node.type === "JSXAttribute" &&
    node.value &&
    node.value.type === "Literal" &&
    /["']|&quot;|&apos;/.test(node.value.value)
  ) {
    node.value.value = node.value.value.replace(/["']|&quot;|&apos;/g, '"');
  }

  // Angular Components: Inline HTML template and Inline CSS styles
  const expression = node.expression || node.callee;
  if (
    node.type === "Decorator" &&
    expression.type === "CallExpression" &&
    expression.callee.name === "Component" &&
    expression.arguments.length === 1
  ) {
    const astProps = node.expression.arguments[0].properties;
    node.expression.arguments[0].properties.forEach((prop, index) => {
      let templateLiteral = null;

      switch (astProps[index].key.name) {
        case "styles":
          if (prop.value.type === "ArrayExpression") {
            templateLiteral = prop.value.elements[0];
          }
          break;
        case "template":
          if (prop.value.type === "TemplateLiteral") {
            templateLiteral = prop.value;
          }
          break;
      }

      if (templateLiteral) {
        templateLiteral.quasis.forEach((q) => delete q.value);
      }
    });
  }

  // styled-components, graphql, markdown
  if (
    node.type === "TaggedTemplateExpression" &&
    (node.tag.type === "MemberExpression" ||
      (node.tag.type === "Identifier" &&
        (node.tag.name === "gql" ||
          node.tag.name === "graphql" ||
          node.tag.name === "css" ||
          node.tag.name === "md" ||
          node.tag.name === "markdown" ||
          node.tag.name === "html")) ||
      node.tag.type === "CallExpression")
  ) {
    node.quasi.quasis.forEach((quasi) => delete quasi.value);
  }

  if (node.type === "CallExpression" && node.callee.name === "graphql") {
    for (const child of node.arguments) {
      if (child.type === "TemplateLiteral") {
        cleanTemplateLiteral(child);
      }
    }
  }

  if (node.type === "TemplateLiteral") {
    // This checks for a leading comment that is exactly `/* GraphQL */`
    // In order to be in line with other implementations of this comment tag
    // we will not trim the comment value and we will expect exactly one space on
    // either side of the GraphQL string
    // Also see ./embed.js
    const hasLanguageComment =
      node.leadingComments &&
      node.leadingComments.some(
        (comment) =>
          isBlockComment(comment) &&
          ["GraphQL", "HTML"].some(
            (languageName) => comment.value === ` ${languageName} `
          )
      );
    if (hasLanguageComment) {
      cleanTemplateLiteral(node);
    }

    // TODO: check parser
    // `flow` and `typescript` don't have `leadingComments`
    if (!node.leadingComments) {
      cleanTemplateLiteral(node);
    }
  }

  if (node.type === "InterpreterDirective") {
    node.value = node.value.trimEnd();
  }
}

clean.ignoredProperties = ignoredProperties;

function cleanTemplateLiteral(node) {
  for (const quasi of node.quasis) {
    delete quasi.value;
  }
}

module.exports = clean;
