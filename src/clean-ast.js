"use strict";

function cleanAST(ast) {
  return JSON.stringify(massageAST(ast), null, 2);
}

function massageAST(ast, parent) {
  if (Array.isArray(ast)) {
    return ast.map(e => massageAST(e, parent)).filter(e => e);
  }
  if (ast && typeof ast === "object") {
    // We remove extra `;` and add them when needed
    if (ast.type === "EmptyStatement") {
      return undefined;
    }

    // We move text around, including whitespaces and add {" "}
    if (ast.type === "JSXText") {
      return undefined;
    }
    if (
      ast.type === "JSXExpressionContainer" &&
      ast.expression.type === "Literal" &&
      ast.expression.value === " "
    ) {
      return undefined;
    }

    const newObj = {};
    for (const key in ast) {
      if (typeof ast[key] !== "function") {
        newObj[key] = massageAST(ast[key], ast);
      }
    }

    [
      "loc",
      "range",
      "raw",
      "comments",
      "leadingComments",
      "trailingComments",
      "extra",
      "start",
      "end",
      "tokens",
      "flags",
      "raws",
      "sourceIndex",
      "id",
      "source",
      "before",
      "after",
      "trailingComma",
      "parent",
      "prev",
      "position"
    ].forEach(name => {
      delete newObj[name];
    });

    // for markdown codeblock
    if (ast.type === "code") {
      delete newObj.value;
    }

    if (
      ast.type === "media-query" ||
      ast.type === "media-query-list" ||
      ast.type === "media-feature-expression"
    ) {
      delete newObj.value;
    }

    if (ast.type === "css-rule") {
      delete newObj.params;
    }

    if (ast.type === "selector-combinator") {
      newObj.value = newObj.value.replace(/\s+/g, " ");
    }

    if (ast.type === "media-feature") {
      newObj.value = newObj.value.replace(/ /g, "");
    }

    if (
      (ast.type === "value-word" && ast.isColor && ast.isHex) ||
      ast.type === "media-feature" ||
      ast.type === "selector-root-invalid" ||
      ast.type === "selector-tag" ||
      ast.type === "selector-pseudo"
    ) {
      newObj.value = newObj.value.toLowerCase();
    }
    if (ast.type === "css-decl") {
      newObj.prop = newObj.prop.toLowerCase();
    }
    if (ast.type === "css-atrule" || ast.type === "css-import") {
      newObj.name = newObj.name.toLowerCase();
    }
    if (ast.type === "selector-attribute") {
      newObj.attribute = newObj.attribute.toLowerCase();
    }
    if (ast.type === "value-number") {
      newObj.unit = newObj.unit.toLowerCase();
    }

    if (
      (ast.type === "media-feature" ||
        ast.type === "media-keyword" ||
        ast.type === "media-type" ||
        ast.type === "media-unknown" ||
        ast.type === "media-url" ||
        ast.type === "media-value" ||
        ast.type === "selector-root-invalid" ||
        ast.type === "selector-attribute" ||
        ast.type === "selector-string" ||
        ast.type === "selector-class" ||
        ast.type === "selector-combinator" ||
        ast.type === "value-string") &&
      newObj.value
    ) {
      newObj.value = cleanCSSStrings(newObj.value);
    }

    if (ast.type === "css-import" && newObj.importPath) {
      newObj.importPath = cleanCSSStrings(newObj.importPath);
    }

    if (ast.type === "selector-attribute" && newObj.value) {
      newObj.value = newObj.value.replace(/^['"]|['"]$/g, "");
      delete newObj.quoted;
    }

    if (
      (ast.type === "media-value" ||
        ast.type === "media-type" ||
        ast.type === "value-number" ||
        ast.type === "selector-root-invalid" ||
        ast.type === "selector-class" ||
        ast.type === "selector-combinator") &&
      newObj.value
    ) {
      newObj.value = newObj.value.replace(
        /([\d.eE+-]+)([a-zA-Z]*)/g,
        (match, numStr, unit) => {
          const num = Number(numStr);
          return isNaN(num) ? match : num + unit.toLowerCase();
        }
      );
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
      ast.typeAnnotation.type === "TypeAnnotation"
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
        ast.type === "MethodDefinition" ||
        ast.type === "ClassProperty" ||
        ast.type === "TSPropertySignature" ||
        ast.type === "ObjectTypeProperty") &&
      typeof ast.key === "object" &&
      ast.key &&
      (ast.key.type === "Literal" || ast.key.type === "Identifier")
    ) {
      delete newObj.key;
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

    // styled-components, graphql, markdown
    if (
      ast.type === "TaggedTemplateExpression" &&
      (ast.tag.type === "MemberExpression" ||
        (ast.tag.type === "Identifier" &&
          (ast.tag.name === "gql" ||
            ast.tag.name === "graphql" ||
            ast.tag.name === "css" ||
            ast.tag.name === "md")) ||
        ast.tag.type === "CallExpression")
    ) {
      newObj.quasi.quasis.forEach(quasi => delete quasi.value);
    }
    if (
      ast.type === "TemplateLiteral" &&
      parent.type === "CallExpression" &&
      parent.callee.name === "graphql"
    ) {
      newObj.quasis.forEach(quasi => delete quasi.value);
    }

    return newObj;
  }
  return ast;
}

function cleanCSSStrings(value) {
  return value.replace(/'/g, '"').replace(/\\([^a-fA-F\d])/g, "$1");
}

module.exports = { cleanAST, massageAST };
