"use strict";

const htmlTagNames = require("html-tag-names");

function getAncestorCounter(path, typeOrTypes) {
  const types = [].concat(typeOrTypes);

  let counter = -1;
  let ancestorNode;

  while ((ancestorNode = path.getParentNode(++counter))) {
    if (types.indexOf(ancestorNode.type) !== -1) {
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

  return (
    declAncestorNode &&
    declAncestorNode.prop &&
    declAncestorNode.prop.toLowerCase()
  );
}

function isSCSS(parser, text) {
  const hasExplicitParserChoice = parser === "less" || parser === "scss";
  const IS_POSSIBLY_SCSS = /(\w\s*: [^}:]+|#){|@import[^\n]+(url|,)/;
  return hasExplicitParserChoice
    ? parser === "scss"
    : IS_POSSIBLY_SCSS.test(text);
}

function isWideKeywords(value) {
  return (
    ["initial", "inherit", "unset", "revert"].indexOf(value.toLowerCase()) !==
    -1
  );
}

function isKeyframeAtRuleKeywords(path, value) {
  const atRuleAncestorNode = getAncestorNode(path, "css-atrule");
  return (
    atRuleAncestorNode &&
    atRuleAncestorNode.name &&
    atRuleAncestorNode.name.toLowerCase().endsWith("keyframes") &&
    ["from", "to"].indexOf(value.toLowerCase()) !== -1
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
  return (
    funcAncestorNode &&
    funcAncestorNode.value &&
    funcAncestorNode.value.toLowerCase() === functionName
  );
}

function insideICSSRuleNode(path) {
  const ruleAncestorNode = getAncestorNode(path, "css-rule");

  return (
    ruleAncestorNode &&
    ruleAncestorNode.raws &&
    ruleAncestorNode.raws.selector &&
    (ruleAncestorNode.raws.selector.startsWith(":import") ||
      ruleAncestorNode.raws.selector.startsWith(":export"))
  );
}

function insideAtRuleNode(path, atRuleName) {
  const atRuleAncestorNode = getAncestorNode(path, "css-atrule");

  return (
    atRuleAncestorNode && atRuleAncestorNode.name.toLowerCase() === atRuleName
  );
}

function isURLFunctionNode(node) {
  return node.type === "value-func" && node.value.toLowerCase() === "url";
}

function isLastNode(path, node) {
  const parentNode = path.getParentNode();
  if (!parentNode) {
    return false;
  }
  const nodes = parentNode.nodes;
  return nodes && nodes.indexOf(node) === nodes.length - 1;
}

function isHTMLTag(value) {
  return htmlTagNames.indexOf(value.toLowerCase()) !== -1;
}

function isDetachedRulesetDeclarationNode(node) {
  // If a Less file ends up being parsed with the SCSS parser, Less
  // variable declarations will be parsed as atrules with names ending
  // with a colon, so keep the original case then.
  if (!node.selector) {
    return false;
  }

  return (
    (typeof node.selector === "string" && /^@.+:.*$/.test(node.selector)) ||
    (node.selector.value && /^@.+:.*$/.test(node.selector.value))
  );
}

function isParenGroupNode(node) {
  return node.type === "value-paren_group";
}

function isForKeywordNode(node) {
  return (
    node.type === "value-word" &&
    ["from", "through", "end"].indexOf(node.value) !== -1
  );
}

function isIfElseKeywordNode(node) {
  return (
    node.type === "value-word" &&
    ["and", "or", "not"].indexOf(node.value) !== -1
  );
}

function isEachKeywordNode(node) {
  return node.type === "value-word" && node.value === "in";
}

function isMathOperatorNode(node) {
  return (
    node.type === "value-operator" &&
    ["+", "-", "/", "*", "%"].indexOf(node.value) !== -1
  );
}

function isEqualityOperatorNode(node) {
  return node.type === "value-word" && ["==", "!="].indexOf(node.value) !== -1;
}

function isRelationalOperatorNode(node) {
  return (
    node.type === "value-word" &&
    ["<", ">", "<=", ">="].indexOf(node.value) !== -1
  );
}

function isSCSSControlDirectiveNode(node) {
  return (
    node.type === "css-atrule" &&
    ["if", "else", "for", "each", "while"].indexOf(node.name) !== -1
  );
}

function isSCSSMapNode(node) {
  return node.type === "css-decl" && node.prop && node.prop.startsWith("$");
}

function isSCSSNestedPropertyNode(node) {
  if (!node.selector) {
    return false;
  }

  return node.selector
    .replace(/\/\*.*?\*\//, "")
    .replace(/\/\/.*?\n/, "")
    .trim()
    .endsWith(":");
}

function isDetachedRulesetCallNode(node) {
  return node.raws && node.raws.params && /^\(\s*\)$/.test(node.raws.params);
}

function hasLessExtendValueNode(node) {
  return (
    node.value &&
    node.value.type === "value-root" &&
    node.value.group &&
    node.value.group.type === "value-value" &&
    node.value.group.group &&
    node.value.group.group.type === "value-func" &&
    node.value.group.group.value === "extend"
  );
}

function hasComposesValueNode(node) {
  return (
    node.value &&
    node.value.type === "value-root" &&
    node.value.group &&
    node.value.group.type === "value-value" &&
    node.prop.toLowerCase() === "composes"
  );
}

function hasParensAroundValueNode(node) {
  return (
    node.value &&
    node.value.group &&
    node.value.group.group &&
    node.value.group.group.type === "value-paren_group" &&
    node.value.group.group.open !== null &&
    node.value.group.group.close !== null
  );
}

function isPostcssSimpleVarNode(currentNode, nextNode) {
  return (
    currentNode.value === "$$" &&
    currentNode.type === "value-func" &&
    nextNode &&
    nextNode.type === "value-word" &&
    !nextNode.raws.before
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
  isKeyframeAtRuleKeywords,
  isHTMLTag,
  isWideKeywords,
  isSCSS,
  isLastNode,
  isSCSSControlDirectiveNode,
  isDetachedRulesetDeclarationNode,
  isRelationalOperatorNode,
  isEqualityOperatorNode,
  isMathOperatorNode,
  isEachKeywordNode,
  isParenGroupNode,
  isForKeywordNode,
  isURLFunctionNode,
  isIfElseKeywordNode,
  hasLessExtendValueNode,
  hasComposesValueNode,
  hasParensAroundValueNode,
  isSCSSMapNode,
  isSCSSNestedPropertyNode,
  isDetachedRulesetCallNode,
  isPostcssSimpleVarNode
};
