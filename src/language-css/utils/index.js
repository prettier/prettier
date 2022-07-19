"use strict";

const colorAdjusterFunctions = new Set([
  "red",
  "green",
  "blue",
  "alpha",
  "a",
  "rgb",
  "hue",
  "h",
  "saturation",
  "s",
  "lightness",
  "l",
  "whiteness",
  "w",
  "blackness",
  "b",
  "tint",
  "shade",
  "blend",
  "blenda",
  "contrast",
  "hsl",
  "hsla",
  "hwb",
  "hwba",
]);

function getAncestorCounter(path, typeOrTypes) {
  const types = Array.isArray(typeOrTypes) ? typeOrTypes : [typeOrTypes];

  let counter = -1;
  let ancestorNode;

  while ((ancestorNode = path.getParentNode(++counter))) {
    if (types.includes(ancestorNode.type)) {
      return counter;
    }
  }

  return -1;
}

function getAncestorNode(path, typeOrTypes) {
  const counter = getAncestorCounter(path, typeOrTypes);
  return counter === -1 ? null : path.getParentNode(counter);
}

function getPropOfDeclNode(path) {
  const declAncestorNode = getAncestorNode(path, "css-decl");

  return declAncestorNode?.prop?.toLowerCase();
}

const wideKeywords = new Set(["initial", "inherit", "unset", "revert"]);
function isWideKeywords(value) {
  return wideKeywords.has(value.toLowerCase());
}

function isKeyframeAtRuleKeywords(path, value) {
  const atRuleAncestorNode = getAncestorNode(path, "css-atrule");
  return (
    atRuleAncestorNode?.name &&
    atRuleAncestorNode.name.toLowerCase().endsWith("keyframes") &&
    ["from", "to"].includes(value.toLowerCase())
  );
}

function maybeToLowerCase(value) {
  return value.includes("$") ||
    value.includes("@") ||
    value.includes("#") ||
    value.startsWith("%") ||
    value.startsWith("--") ||
    value.startsWith(":--") ||
    (value.includes("(") && value.includes(")"))
    ? value
    : value.toLowerCase();
}

function insideValueFunctionNode(path, functionName) {
  const funcAncestorNode = getAncestorNode(path, "value-func");
  return funcAncestorNode?.value?.toLowerCase() === functionName;
}

function insideICSSRuleNode(path) {
  const ruleAncestorNode = getAncestorNode(path, "css-rule");
  const selector = ruleAncestorNode?.raws?.selector;

  return (
    selector &&
    (selector.startsWith(":import") || selector.startsWith(":export"))
  );
}

function insideAtRuleNode(path, atRuleNameOrAtRuleNames) {
  const atRuleNames = Array.isArray(atRuleNameOrAtRuleNames)
    ? atRuleNameOrAtRuleNames
    : [atRuleNameOrAtRuleNames];
  const atRuleAncestorNode = getAncestorNode(path, "css-atrule");

  return (
    atRuleAncestorNode &&
    atRuleNames.includes(atRuleAncestorNode.name.toLowerCase())
  );
}

function insideURLFunctionInImportAtRuleNode(path) {
  const node = path.getValue();
  const atRuleAncestorNode = getAncestorNode(path, "css-atrule");

  return (
    atRuleAncestorNode?.name === "import" &&
    node.groups[0].value === "url" &&
    node.groups.length === 2
  );
}

function isURLFunctionNode(node) {
  return node.type === "value-func" && node.value.toLowerCase() === "url";
}

function isLastNode(path, node) {
  const nodes = path.getParentNode()?.nodes;
  return nodes && nodes.indexOf(node) === nodes.length - 1;
}

function isDetachedRulesetDeclarationNode(node) {
  const { selector } = node;
  // If a Less file ends up being parsed with the SCSS parser, Less
  // variable declarations will be parsed as atrules with names ending
  // with a colon, so keep the original case then.
  /* istanbul ignore next */
  if (!selector) {
    return false;
  }

  return (
    (typeof selector === "string" && /^@.+:.*$/.test(selector)) ||
    (selector.value && /^@.+:.*$/.test(selector.value))
  );
}

function isForKeywordNode(node) {
  return (
    node.type === "value-word" &&
    ["from", "through", "end"].includes(node.value)
  );
}

function isIfElseKeywordNode(node) {
  return (
    node.type === "value-word" && ["and", "or", "not"].includes(node.value)
  );
}

function isEachKeywordNode(node) {
  return node.type === "value-word" && node.value === "in";
}

function isMultiplicationNode(node) {
  return node.type === "value-operator" && node.value === "*";
}

function isDivisionNode(node) {
  return node.type === "value-operator" && node.value === "/";
}

function isAdditionNode(node) {
  return node.type === "value-operator" && node.value === "+";
}

function isSubtractionNode(node) {
  return node.type === "value-operator" && node.value === "-";
}

function isModuloNode(node) {
  return node.type === "value-operator" && node.value === "%";
}

function isMathOperatorNode(node) {
  return (
    isMultiplicationNode(node) ||
    isDivisionNode(node) ||
    isAdditionNode(node) ||
    isSubtractionNode(node) ||
    isModuloNode(node)
  );
}

function isEqualityOperatorNode(node) {
  return node.type === "value-word" && ["==", "!="].includes(node.value);
}

function isRelationalOperatorNode(node) {
  return (
    node.type === "value-word" && ["<", ">", "<=", ">="].includes(node.value)
  );
}

function isSCSSControlDirectiveNode(node) {
  return (
    node.type === "css-atrule" &&
    ["if", "else", "for", "each", "while"].includes(node.name)
  );
}

function isDetachedRulesetCallNode(node) {
  return node.raws?.params && /^\(\s*\)$/.test(node.raws.params);
}

function isTemplatePlaceholderNode(node) {
  return node.name.startsWith("prettier-placeholder");
}

function isTemplatePropNode(node) {
  return node.prop.startsWith("@prettier-placeholder");
}

function isPostcssSimpleVarNode(currentNode, nextNode) {
  return (
    currentNode.value === "$$" &&
    currentNode.type === "value-func" &&
    nextNode?.type === "value-word" &&
    !nextNode.raws.before
  );
}

function hasComposesNode(node) {
  return (
    node.value?.type === "value-root" &&
    node.value.group?.type === "value-value" &&
    node.prop.toLowerCase() === "composes"
  );
}

function hasParensAroundNode(node) {
  return (
    node.value?.group?.group?.type === "value-paren_group" &&
    node.value.group.group.open !== null &&
    node.value.group.group.close !== null
  );
}

function hasEmptyRawBefore(node) {
  return node.raws?.before === "";
}

function isKeyValuePairNode(node) {
  return (
    node.type === "value-comma_group" &&
    node.groups?.[1]?.type === "value-colon"
  );
}

function isKeyValuePairInParenGroupNode(node) {
  return (
    node.type === "value-paren_group" &&
    node.groups?.[0] &&
    isKeyValuePairNode(node.groups[0])
  );
}

function isSCSSMapItemNode(path) {
  const node = path.getValue();

  // Ignore empty item (i.e. `$key: ()`)
  if (node.groups.length === 0) {
    return false;
  }

  const parentParentNode = path.getParentNode(1);

  // Check open parens contain key/value pair (i.e. `(key: value)` and `(key: (value, other-value)`)
  if (
    !isKeyValuePairInParenGroupNode(node) &&
    !(parentParentNode && isKeyValuePairInParenGroupNode(parentParentNode))
  ) {
    return false;
  }

  const declNode = getAncestorNode(path, "css-decl");

  // SCSS map declaration (i.e. `$map: (key: value, other-key: other-value)`)
  if (declNode?.prop?.startsWith("$")) {
    return true;
  }

  // List as value of key inside SCSS map (i.e. `$map: (key: (value other-value other-other-value))`)
  if (isKeyValuePairInParenGroupNode(parentParentNode)) {
    return true;
  }

  // SCSS Map is argument of function (i.e. `func((key: value, other-key: other-value))`)
  if (parentParentNode.type === "value-func") {
    return true;
  }

  return false;
}

function isInlineValueCommentNode(node) {
  return node.type === "value-comment" && node.inline;
}

function isHashNode(node) {
  return node.type === "value-word" && node.value === "#";
}

function isLeftCurlyBraceNode(node) {
  return node.type === "value-word" && node.value === "{";
}

function isRightCurlyBraceNode(node) {
  return node.type === "value-word" && node.value === "}";
}

function isWordNode(node) {
  return ["value-word", "value-atword"].includes(node.type);
}

function isColonNode(node) {
  return node?.type === "value-colon";
}

function isKeyInValuePairNode(node, parentNode) {
  if (!isKeyValuePairNode(parentNode)) {
    return false;
  }

  const { groups } = parentNode;
  const index = groups.indexOf(node);

  if (index === -1) {
    return false;
  }

  return isColonNode(groups[index + 1]);
}

function isMediaAndSupportsKeywords(node) {
  return node.value && ["not", "and", "or"].includes(node.value.toLowerCase());
}

function isColorAdjusterFuncNode(node) {
  if (node.type !== "value-func") {
    return false;
  }

  return colorAdjusterFunctions.has(node.value.toLowerCase());
}

function lastLineHasInlineComment(text) {
  return /\/\//.test(text.split(/[\n\r]/).pop());
}

function isAtWordPlaceholderNode(node) {
  return (
    node?.type === "value-atword" &&
    node.value.startsWith("prettier-placeholder-")
  );
}

function isConfigurationNode(node, parentNode) {
  if (
    node.open?.value !== "(" ||
    node.close?.value !== ")" ||
    node.groups.some((group) => group.type !== "value-comma_group")
  ) {
    return false;
  }
  if (parentNode.type === "value-comma_group") {
    const prevIdx = parentNode.groups.indexOf(node) - 1;
    const maybeWithNode = parentNode.groups[prevIdx];
    if (
      maybeWithNode?.type === "value-word" &&
      maybeWithNode.value === "with"
    ) {
      return true;
    }
  }
  return false;
}

function isParenGroupNode(node) {
  return (
    node.type === "value-paren_group" &&
    node.open?.value === "(" &&
    node.close?.value === ")"
  );
}

module.exports = {
  getAncestorCounter,
  getAncestorNode,
  getPropOfDeclNode,
  maybeToLowerCase,
  insideValueFunctionNode,
  insideICSSRuleNode,
  insideAtRuleNode,
  insideURLFunctionInImportAtRuleNode,
  isKeyframeAtRuleKeywords,
  isWideKeywords,
  isLastNode,
  isSCSSControlDirectiveNode,
  isDetachedRulesetDeclarationNode,
  isRelationalOperatorNode,
  isEqualityOperatorNode,
  isMultiplicationNode,
  isDivisionNode,
  isAdditionNode,
  isSubtractionNode,
  isModuloNode,
  isMathOperatorNode,
  isEachKeywordNode,
  isForKeywordNode,
  isURLFunctionNode,
  isIfElseKeywordNode,
  hasComposesNode,
  hasParensAroundNode,
  hasEmptyRawBefore,
  isDetachedRulesetCallNode,
  isTemplatePlaceholderNode,
  isTemplatePropNode,
  isPostcssSimpleVarNode,
  isKeyValuePairNode,
  isKeyValuePairInParenGroupNode,
  isKeyInValuePairNode,
  isSCSSMapItemNode,
  isInlineValueCommentNode,
  isHashNode,
  isLeftCurlyBraceNode,
  isRightCurlyBraceNode,
  isWordNode,
  isColonNode,
  isMediaAndSupportsKeywords,
  isColorAdjusterFuncNode,
  lastLineHasInlineComment,
  isAtWordPlaceholderNode,
  isConfigurationNode,
  isParenGroupNode,
};
