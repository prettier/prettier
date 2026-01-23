import {
  isArrayExpression,
  isBigIntLiteral,
  isMeaningfulEmptyStatement,
  isNumericLiteral,
  isStringLiteral,
} from "./utilities/index.js";

/**
@import {Node} from "./types/estree.js"
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
]);

const removeTemplateElementsValue = (node) => {
  for (const templateElement of node.quasis) {
    delete templateElement.value;
  }
};

function cleanKey(cloned, original, property) {
  const key = original[property];
  if (isStringLiteral(key) || isNumericLiteral(key)) {
    cloned[property] = String(key.value);
  }

  if (key.type === "Identifier") {
    cloned[property] = key.name;
  }
}

function cleanEstreeChainExpression(node) {
  while (true) {
    if (node.type === "MemberExpression") {
      if (node.object.type === "ChainExpression") {
        node.object = node.object.expression;
      }
      node = node.object;
      continue;
    }

    if (node.type === "CallExpression") {
      if (node.callee.type === "ChainExpression") {
        node.callee = node.callee.expression;
      }
      node = node.callee;
      continue;
    }

    if (node.type === "TSNonNullExpression") {
      node = node.expression;
      continue;
    }

    return;
  }
}

function cleanBabelChainExpression(node) {
  while (true) {
    if (node.type === "MemberExpression") {
      node.type = "OptionalMemberExpression";
      node = node.object;
      continue;
    }

    if (node.type === "CallExpression") {
      node.type = "OptionalCallExpression";
      node = node.callee;
      continue;
    }

    return;
  }
}

/**
@param {Node} original
@param {any} cloned
@param {Node | undefined} parent
*/
function clean(original, cloned, parent) {
  if (original.type === "Program") {
    delete cloned.sourceType;
  }

  if (
    (isBigIntLiteral(original) ||
      original.type === "BigIntLiteralTypeAnnotation") &&
    "bigint" in original
  ) {
    cloned.bigint = original.bigint.toLowerCase();
  }

  if (original.type === "RegExpLiteral") {
    cloned.flags = [...original.flags].sort().join("");
  }

  if (original.type === "Literal" && "regex" in original) {
    cloned.regex.flags = [...original.regex.flags].sort().join("");
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

  // We change {'key': value} into {key: value}.
  // And {key: value} into {'key': value}.
  // Also for (some) number keys.
  if (
    (original.type === "Property" ||
      original.type === "ObjectProperty" ||
      original.type === "MethodDefinition" ||
      original.type === "ClassProperty" ||
      original.type === "ClassMethod" ||
      original.type === "PropertyDefinition" ||
      original.type === "TSDeclareMethod" ||
      original.type === "TSPropertySignature" ||
      original.type === "TSMethodSignature" ||
      original.type === "ObjectTypeProperty" ||
      original.type === "ImportAttribute" ||
      original.type === "RecordDeclarationProperty" ||
      original.type === "RecordDeclarationStaticProperty") &&
    // @ts-expect-error -- safe
    !original.computed
  ) {
    cleanKey(cloned, original, "key");
  }

  if (original.type === "TSEnumMember") {
    cleanKey(cloned, original, "id");
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

  // We don't add parentheses to `(a?.b)?.c`
  if (original.type === "ChainExpression") {
    cleanEstreeChainExpression(cloned.expression);
  }
  if (original.type === "OptionalMemberExpression") {
    cleanBabelChainExpression(cloned.object);
  }
  if (original.type === "OptionalCallExpression") {
    cleanBabelChainExpression(cloned.callee);
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

clean.ignoredProperties = ignoredProperties;

export default clean;
