import { isMeaningfulEmptyStatement } from "../utilities/is-meaningful-empty-statement.js";
import {
  isArrayExpression,
  isBigIntLiteral,
  isStringLiteral,
} from "../utilities/node-types.js";
import { cleanChainExpression } from "./chain-expression.js";
import { cleanKey } from "./key.js";
import { cleanRegExpLiteral } from "./regexp-literal.js";

/**
@import {Node} from "../types/estree.js"
*/

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
  "errors",
  "tokens",
  // Hermes
  "trailingComma",
  "docblock",
  // Prettier
  "__contentEnd",
]);

const removeTemplateElementsValue = (node) => {
  for (const templateElement of node.quasis) {
    delete templateElement.value;
  }
};

/**
@param {Node} original
@param {any} cloned
@param {Node | undefined} parent
*/
function massageAstNode(original, cloned, parent) {
  if (original.type === "Program") {
    delete cloned.sourceType;
  }

  // We don't add parentheses to `(a?.b)?.c`
  cleanChainExpression(original, cloned);

  // We quote/unquote keys
  cleanKey(original, cloned);

  // We sort regex flags
  cleanRegExpLiteral(original, cloned);

  if (
    (isBigIntLiteral(original) ||
      original.type === "BigIntLiteralTypeAnnotation") &&
    "bigint" in original
  ) {
    cloned.bigint = original.bigint.toLowerCase();
  }

  // We remove extra `;` and add them when needed
  if (
    original.type === "EmptyStatement" &&
    !isMeaningfulEmptyStatement({ node: original, parent })
  ) {
    return null;
  }

  // We move text around, including whitespaces and add {" "}
  if (original.type === "JSXText") {
    return null;
  }
  if (
    original.type === "JSXExpressionContainer" &&
    (original.expression.type === "Literal" ||
      original.expression.type === "StringLiteral") &&
    original.expression.value === " "
  ) {
    return null;
  }

  // Remove raw and cooked values from TemplateElement when it's CSS
  // styled-jsx
  if (
    original.type === "JSXElement" &&
    original.openingElement.name.type === "JSXIdentifier" &&
    original.openingElement.name.name === "style" &&
    original.openingElement.attributes.some(
      (attr) => attr.type === "JSXAttribute" && attr.name.name === "jsx",
    )
  ) {
    for (const { type, expression } of cloned.children) {
      if (
        type === "JSXExpressionContainer" &&
        expression.type === "TemplateLiteral"
      ) {
        removeTemplateElementsValue(expression);
      }
    }
  }

  // CSS template literals in css prop
  if (
    original.type === "JSXAttribute" &&
    original.name.name === "css" &&
    original.value.type === "JSXExpressionContainer" &&
    original.value.expression.type === "TemplateLiteral"
  ) {
    removeTemplateElementsValue(cloned.value.expression);
  }

  // We change quotes
  if (
    original.type === "JSXAttribute" &&
    isStringLiteral(original.value) &&
    /["']|&quot;|&apos;/.test(original.value.value)
  ) {
    cloned.value.value = original.value.value.replaceAll(
      /["']|&quot;|&apos;/g,
      '"',
    );
  }

  // Angular Components: Inline HTML template and Inline CSS styles
  // @ts-expect-error -- Fixme
  const expression = original.expression || original.callee;
  if (
    original.type === "Decorator" &&
    expression.type === "CallExpression" &&
    expression.callee.name === "Component" &&
    expression.arguments.length === 1
  ) {
    // @ts-expect-error -- Fixme
    const astProps = original.expression.arguments[0].properties;
    for (const [
      index,
      prop,
    ] of cloned.expression.arguments[0].properties.entries()) {
      switch (astProps[index].key.name) {
        case "styles":
          if (isArrayExpression(prop.value)) {
            removeTemplateElementsValue(prop.value.elements[0]);
          }
          break;
        case "template":
          if (prop.value.type === "TemplateLiteral") {
            removeTemplateElementsValue(prop.value);
          }
          break;
      }
    }
  }

  // styled-components, graphql, markdown
  if (
    original.type === "TaggedTemplateExpression" &&
    (original.tag.type === "MemberExpression" ||
      (original.tag.type === "Identifier" &&
        (original.tag.name === "gql" ||
          original.tag.name === "graphql" ||
          original.tag.name === "css" ||
          original.tag.name === "md" ||
          original.tag.name === "markdown" ||
          original.tag.name === "html")) ||
      original.tag.type === "CallExpression")
  ) {
    removeTemplateElementsValue(cloned.quasi);
  }

  if (
    (original.type === "CallExpression" ||
      original.type === "MemberExpression") &&
    // @ts-expect-error -- safe
    !original.optional
  ) {
    delete cloned.optional;
  }

  // TODO: Only delete value when there is leading comment which is exactly
  // `/* GraphQL */` or `/* HTML */`
  // Also see ./embed.js
  if (original.type === "TemplateLiteral") {
    removeTemplateElementsValue(cloned);
  }

  // https://github.com/babel/babel/issues/17719
  if (
    (original.type === "ClassDeclaration" ||
      original.type === "ClassExpression") &&
    !original.superTypeArguments &&
    original.superClass?.type === "TSInstantiationExpression" &&
    original.superClass.typeArguments
  ) {
    const {
      superClass: { typeArguments, expression },
    } = cloned;
    cloned.superTypeArguments = typeArguments;
    cloned.superClass = expression;
  }
}

massageAstNode.ignoredProperties = ignoredProperties;

export { massageAstNode };
