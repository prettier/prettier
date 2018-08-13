"use strict";

function clean(ast, newObj, parent) {
  [
    "range",
    "raw",
    "comments",
    "leadingComments",
    "trailingComments",
    "extra",
    "start",
    "end",
    "flags"
  ].forEach(name => {
    delete newObj[name];
  });

  if (ast.type === "BigIntLiteral") {
    newObj.value = newObj.value.toLowerCase();
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
    ast.expression.type === "Literal" &&
    ast.expression.value === " "
  ) {
    return null;
  }

  // (TypeScript) Ignore `static` in `constructor(static p) {}`
  // and `export` in `constructor(export p) {}`
  if (
    ast.type === "TSParameterProperty" &&
    ast.accessibility === null &&
    !ast.readonly
  ) {
    return {
      type: "Identifier",
      name: ast.parameter.name,
      typeAnnotation: newObj.parameter.typeAnnotation,
      decorators: newObj.decorators
    };
  }

  // (TypeScript) ignore empty `specifiers` array
  if (
    ast.type === "TSNamespaceExportDeclaration" &&
    ast.specifiers &&
    ast.specifiers.length === 0
  ) {
    delete newObj.specifiers;
  }

  // (TypeScript) bypass TSParenthesizedType
  if (
    ast.type === "TSParenthesizedType" &&
    ast.typeAnnotation.type === "TSTypeAnnotation"
  ) {
    return newObj.typeAnnotation.typeAnnotation;
  }

  // We convert <div></div> to <div />
  if (ast.type === "JSXOpeningElement") {
    delete newObj.selfClosing;
  }
  if (ast.type === "JSXElement") {
    delete newObj.closingElement;
  }

  // We change {'key': value} into {key: value}
  if (
    (ast.type === "Property" ||
      ast.type === "ObjectProperty" ||
      ast.type === "MethodDefinition" ||
      ast.type === "ClassProperty" ||
      ast.type === "TSPropertySignature" ||
      ast.type === "ObjectTypeProperty") &&
    typeof ast.key === "object" &&
    ast.key &&
    (ast.key.type === "Literal" ||
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
    ast.openingElement.attributes.some(attr => attr.name.name === "jsx")
  ) {
    const templateLiterals = newObj.children
      .filter(
        child =>
          child.type === "JSXExpressionContainer" &&
          child.expression.type === "TemplateLiteral"
      )
      .map(container => container.expression);

    const quasis = templateLiterals.reduce(
      (quasis, templateLiteral) => quasis.concat(templateLiteral.quasis),
      []
    );

    quasis.forEach(q => delete q.value);
  }

  // CSS template literals in css prop
  if (
    ast.type === "JSXAttribute" &&
    ast.name.name === "css" &&
    ast.value.type === "JSXExpressionContainer" &&
    ast.value.expression.type === "TemplateLiteral"
  ) {
    newObj.value.expression.quasis.forEach(q => delete q.value);
  }

  // CSS template literals in Angular Component decorator
  const expression = ast.expression || ast.callee;
  if (
    ast.type === "Decorator" &&
    expression.type === "CallExpression" &&
    expression.callee.name === "Component" &&
    expression.arguments.length === 1 &&
    expression.arguments[0].properties.some(
      prop =>
        prop.key.name === "styles" && prop.value.type === "ArrayExpression"
    )
  ) {
    newObj.expression.arguments[0].properties.forEach(prop => {
      if (prop.value.type === "ArrayExpression") {
        prop.value.elements[0].quasis.forEach(q => delete q.value);
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
          ast.tag.name === "markdown")) ||
      ast.tag.type === "CallExpression")
  ) {
    newObj.quasi.quasis.forEach(quasi => delete quasi.value);
  }
  if (ast.type === "TemplateLiteral") {
    // This checks for a leading comment that is exactly `/* GraphQL */`
    // In order to be in line with other implementations of this comment tag
    // we will not trim the comment value and we will expect exactly one space on
    // either side of the GraphQL string
    // Also see ./embed.js
    const hasGraphQLComment =
      ast.leadingComments &&
      ast.leadingComments.some(
        comment =>
          comment.type === "CommentBlock" && comment.value === " GraphQL "
      );
    if (
      hasGraphQLComment ||
      (parent.type === "CallExpression" && parent.callee.name === "graphql")
    ) {
      newObj.quasis.forEach(quasi => delete quasi.value);
    }
  }
}

module.exports = clean;
