"use strict";

function cleanAST(ast) {
  return JSON.stringify(massageAST(ast), null, 2);
}

function massageAST(ast) {
  if (Array.isArray(ast)) {
    return ast.map(e => massageAST(e)).filter(e => e);
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
        newObj[key] = massageAST(ast[key]);
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
      "trailingComma"
    ].forEach(name => {
      delete newObj[name];
    });

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

    if (ast.type === "media-feature") {
      newObj.value = newObj.value.replace(/ /g, "");
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

    // (TypeScript) allow parenthesization of TSFunctionType
    if (
      ast.type === "TSParenthesizedType" &&
      ast.typeAnnotation.type === "TypeAnnotation" &&
      ast.typeAnnotation.typeAnnotation.type === "TSFunctionType"
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
        ast.type === "ClassProperty") &&
      typeof ast.key === "object" &&
      ast.key &&
      (ast.key.type === "Literal" || ast.key.type === "Identifier")
    ) {
      delete newObj.key;
    }

    // Remove raw and cooked values from TemplateElement when it's CSS
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

    return newObj;
  }
  return ast;
}

module.exports = { cleanAST, massageAST };
