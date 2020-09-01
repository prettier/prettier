"use strict";

function clean(ast, newObj, parent) {
  [
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
  ].forEach((name) => {
    delete newObj[name];
  });

  if (ast.type === "Program") {
    delete newObj.sourceType;
  }

  if (ast.type === "BigIntLiteral") {
    if (newObj.value) {
      newObj.value = newObj.value.toLowerCase();
    }
    if (newObj.bigint) {
      newObj.bigint = newObj.bigint.toLowerCase();
    }
  }

  if (ast.type === "DecimalLiteral") {
    newObj.value = Number(newObj.value);
  }

  // We remove extra `;` and add them when needed
  if (ast.type === "EmptyStatement") {
    return null;
  }

  // We move text around, including whitespaces and add {" "}
  if (ast.type === "JSXText") {
    return null;
  }
  if (
    ast.type === "JSXExpressionContainer" &&
    (ast.expression.type === "Literal" ||
      ast.expression.type === "StringLiteral") &&
    ast.expression.value === " "
  ) {
    return null;
  }

  // We change {'key': value} into {key: value}.
  // And {key: value} into {'key': value}.
  // Also for (some) number keys.
  if (
    (ast.type === "Property" ||
      ast.type === "ObjectProperty" ||
      ast.type === "MethodDefinition" ||
      ast.type === "ClassProperty" ||
      ast.type === "ClassMethod" ||
      ast.type === "TSDeclareMethod" ||
      ast.type === "TSPropertySignature" ||
      ast.type === "ObjectTypeProperty") &&
    typeof ast.key === "object" &&
    ast.key &&
    (ast.key.type === "Literal" ||
      ast.key.type === "NumericLiteral" ||
      ast.key.type === "StringLiteral" ||
      ast.key.type === "Identifier")
  ) {
    delete newObj.key;
  }

  if (ast.type === "OptionalMemberExpression" && ast.optional === false) {
    newObj.type = "MemberExpression";
    delete newObj.optional;
  }

  // Remove raw and cooked values from TemplateElement when it's CSS
  // styled-jsx
  if (
    ast.type === "JSXElement" &&
    ast.openingElement.name.name === "style" &&
    ast.openingElement.attributes.some((attr) => attr.name.name === "jsx")
  ) {
    const templateLiterals = newObj.children
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
    ast.type === "JSXAttribute" &&
    ast.name.name === "css" &&
    ast.value.type === "JSXExpressionContainer" &&
    ast.value.expression.type === "TemplateLiteral"
  ) {
    newObj.value.expression.quasis.forEach((q) => delete q.value);
  }

  // We change quotes
  if (
    ast.type === "JSXAttribute" &&
    ast.value &&
    ast.value.type === "Literal" &&
    /["']|&quot;|&apos;/.test(ast.value.value)
  ) {
    newObj.value.value = newObj.value.value.replace(/["']|&quot;|&apos;/g, '"');
  }

  // Angular Components: Inline HTML template and Inline CSS styles
  const expression = ast.expression || ast.callee;
  if (
    ast.type === "Decorator" &&
    expression.type === "CallExpression" &&
    expression.callee.name === "Component" &&
    expression.arguments.length === 1
  ) {
    const astProps = ast.expression.arguments[0].properties;
    newObj.expression.arguments[0].properties.forEach((prop, index) => {
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
    ast.type === "TaggedTemplateExpression" &&
    (ast.tag.type === "MemberExpression" ||
      (ast.tag.type === "Identifier" &&
        (ast.tag.name === "gql" ||
          ast.tag.name === "graphql" ||
          ast.tag.name === "css" ||
          ast.tag.name === "md" ||
          ast.tag.name === "markdown" ||
          ast.tag.name === "html")) ||
      ast.tag.type === "CallExpression")
  ) {
    newObj.quasi.quasis.forEach((quasi) => delete quasi.value);
  }
  if (ast.type === "TemplateLiteral") {
    // This checks for a leading comment that is exactly `/* GraphQL */`
    // In order to be in line with other implementations of this comment tag
    // we will not trim the comment value and we will expect exactly one space on
    // either side of the GraphQL string
    // Also see ./embed.js
    const hasLanguageComment =
      ast.leadingComments &&
      ast.leadingComments.some(
        (comment) =>
          comment.type === "CommentBlock" &&
          ["GraphQL", "HTML"].some(
            (languageName) => comment.value === ` ${languageName} `
          )
      );
    if (
      hasLanguageComment ||
      (parent.type === "CallExpression" && parent.callee.name === "graphql")
    ) {
      newObj.quasis.forEach((quasi) => delete quasi.value);
    }

    // TODO: check parser
    // `flow` and `typescript` don't have `leadingComments`
    if (!ast.leadingComments) {
      newObj.quasis.forEach((quasi) => {
        if (quasi.value) {
          delete quasi.value.cooked;
        }
      });
    }
  }

  if (ast.type === "InterpreterDirective") {
    newObj.value = newObj.value.trimEnd();
  }
}

module.exports = clean;
