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

const getAncestorCounter = (path, typeOrTypes) => {
  const types = [].concat(typeOrTypes);

  let counter = -1;
  let ancestorNode;

  while ((ancestorNode = path.getParentNode(++counter))) {
    if (types.includes(ancestorNode.type)) {
      return counter;
    }
  }

  return -1;
};

const getAncestorNode = (path, typeOrTypes) => {
  const counter = getAncestorCounter(path, typeOrTypes);
  return counter === -1 ? null : path.getParentNode(counter);
};

const getPropOfDeclNode = (path) => {
  const declAncestorNode = getAncestorNode(path, "css-decl");

  return (
    declAncestorNode &&
    declAncestorNode.prop &&
    declAncestorNode.prop.toLowerCase()
  );
};

const hasSCSSInterpolation = (groupList) => {
  if (groupList && groupList.length) {
    for (let i = groupList.length - 1; i > 0; i--) {
      // If we find `#{`, return true.
      if (
        groupList[i].type === "word" &&
        groupList[i].value === "{" &&
        groupList[i - 1].type === "word" &&
        groupList[i - 1].value.endsWith("#")
      ) {
        return true;
      }
    }
  }
  return false;
};

const hasStringOrFunction = (groupList) => {
  if (groupList && groupList.length) {
    for (let i = 0; i < groupList.length; i++) {
      if (groupList[i].type === "string" || groupList[i].type === "func") {
        return true;
      }
    }
  }
  return false;
};

const isSCSS = (parser, text) => {
  const hasExplicitParserChoice = parser === "less" || parser === "scss";
  const IS_POSSIBLY_SCSS = /(\w\s*:\s*[^:}]+|#){|@import[^\n]+(?:url|,)/;
  return hasExplicitParserChoice
    ? parser === "scss"
    : IS_POSSIBLY_SCSS.test(text);
};

const isSCSSVariable = (node) =>
  !!(node && node.type === "word" && node.value.startsWith("$"));

const isWideKeywords = (value) =>
  ["initial", "inherit", "unset", "revert"].includes(value.toLowerCase());

const isKeyframeAtRuleKeywords = (path, value) => {
  const atRuleAncestorNode = getAncestorNode(path, "css-atrule");
  return (
    atRuleAncestorNode &&
    atRuleAncestorNode.name &&
    atRuleAncestorNode.name.toLowerCase().endsWith("keyframes") &&
    ["from", "to"].includes(value.toLowerCase())
  );
};

const maybeToLowerCase = (value) =>
  value.includes("$") ||
  value.includes("@") ||
  value.includes("#") ||
  value.startsWith("%") ||
  value.startsWith("--") ||
  value.startsWith(":--") ||
  (value.includes("(") && value.includes(")"))
    ? value
    : value.toLowerCase();

const insideValueFunctionNode = (path, functionName) => {
  const funcAncestorNode = getAncestorNode(path, "value-func");
  return (
    funcAncestorNode &&
    funcAncestorNode.value &&
    funcAncestorNode.value.toLowerCase() === functionName
  );
};

const insideICSSRuleNode = (path) => {
  const ruleAncestorNode = getAncestorNode(path, "css-rule");

  return (
    ruleAncestorNode &&
    ruleAncestorNode.raws &&
    ruleAncestorNode.raws.selector &&
    (ruleAncestorNode.raws.selector.startsWith(":import") ||
      ruleAncestorNode.raws.selector.startsWith(":export"))
  );
};

const insideAtRuleNode = (path, atRuleNameOrAtRuleNames) => {
  const atRuleNames = [].concat(atRuleNameOrAtRuleNames);
  const atRuleAncestorNode = getAncestorNode(path, "css-atrule");

  return (
    atRuleAncestorNode &&
    atRuleNames.includes(atRuleAncestorNode.name.toLowerCase())
  );
};

const insideURLFunctionInImportAtRuleNode = (path) => {
  const node = path.getValue();
  const atRuleAncestorNode = getAncestorNode(path, "css-atrule");

  return (
    atRuleAncestorNode &&
    atRuleAncestorNode.name === "import" &&
    node.groups[0].value === "url" &&
    node.groups.length === 2
  );
};

const isURLFunctionNode = (node) =>
  node.type === "value-func" && node.value.toLowerCase() === "url";

const isLastNode = (path, node) => {
  const parentNode = path.getParentNode();

  /* istanbul ignore next */
  if (!parentNode) {
    return false;
  }
  const { nodes } = parentNode;
  return nodes && nodes.indexOf(node) === nodes.length - 1;
};

const isDetachedRulesetDeclarationNode = (node) => {
  // If a Less file ends up being parsed with the SCSS parser, Less
  // variable declarations will be parsed as atrules with names ending
  // with a colon, so keep the original case then.
  /* istanbul ignore next */
  if (!node.selector) {
    return false;
  }

  return (
    (typeof node.selector === "string" && /^@.+:.*$/.test(node.selector)) ||
    (node.selector.value && /^@.+:.*$/.test(node.selector.value))
  );
};

const isForKeywordNode = (node) =>
  node.type === "value-word" && ["from", "through", "end"].includes(node.value);

const isIfElseKeywordNode = (node) =>
  node.type === "value-word" && ["and", "or", "not"].includes(node.value);

const isEachKeywordNode = (node) =>
  node.type === "value-word" && node.value === "in";

const isMultiplicationNode = (node) =>
  node.type === "value-operator" && node.value === "*";

const isDivisionNode = (node) =>
  node.type === "value-operator" && node.value === "/";

const isAdditionNode = (node) =>
  node.type === "value-operator" && node.value === "+";

const isSubtractionNode = (node) =>
  node.type === "value-operator" && node.value === "-";

const isModuloNode = (node) =>
  node.type === "value-operator" && node.value === "%";

const isMathOperatorNode = (node) =>
  isMultiplicationNode(node) ||
  isDivisionNode(node) ||
  isAdditionNode(node) ||
  isSubtractionNode(node) ||
  isModuloNode(node);

const isEqualityOperatorNode = (node) =>
  node.type === "value-word" && ["==", "!="].includes(node.value);

const isRelationalOperatorNode = (node) =>
  node.type === "value-word" && ["<", ">", "<=", ">="].includes(node.value);

const isSCSSControlDirectiveNode = (node) =>
  node.type === "css-atrule" &&
  ["if", "else", "for", "each", "while"].includes(node.name);

const isSCSSNestedPropertyNode = (node) => {
  /* istanbul ignore next */
  if (!node.selector) {
    return false;
  }

  return node.selector
    .replace(/\/\*.*?\*\//, "")
    .replace(/\/\/.*?\n/, "")
    .trim()
    .endsWith(":");
};

const isDetachedRulesetCallNode = (node) =>
  node.raws && node.raws.params && /^\(\s*\)$/.test(node.raws.params);

const isTemplatePlaceholderNode = (node) =>
  node.name.startsWith("prettier-placeholder");

const isTemplatePropNode = (node) =>
  node.prop.startsWith("@prettier-placeholder");

const isPostcssSimpleVarNode = (currentNode, nextNode) =>
  currentNode.value === "$$" &&
  currentNode.type === "value-func" &&
  nextNode &&
  nextNode.type === "value-word" &&
  !nextNode.raws.before;

const hasComposesNode = (node) =>
  node.value &&
  node.value.type === "value-root" &&
  node.value.group &&
  node.value.group.type === "value-value" &&
  node.prop.toLowerCase() === "composes";

const hasParensAroundNode = (node) =>
  node.value &&
  node.value.group &&
  node.value.group.group &&
  node.value.group.group.type === "value-paren_group" &&
  node.value.group.group.open !== null &&
  node.value.group.group.close !== null;

const hasEmptyRawBefore = (node) => node.raws && node.raws.before === "";

const isKeyValuePairNode = (node) =>
  node.type === "value-comma_group" &&
  node.groups &&
  node.groups[1] &&
  node.groups[1].type === "value-colon";

const isKeyValuePairInParenGroupNode = (node) =>
  node.type === "value-paren_group" &&
  node.groups &&
  node.groups[0] &&
  isKeyValuePairNode(node.groups[0]);

const isSCSSMapItemNode = (path) => {
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
  if (declNode && declNode.prop && declNode.prop.startsWith("$")) {
    return true;
  }

  // List as value of key inside SCSS map (i.e. `$map: (key: (value other-value other-other-value))`)
  if (isKeyValuePairInParenGroupNode(parentParentNode)) {
    return true;
  }

  // SCSS Map is argument of const (i = .e. `func((key: value, other-key: other-value))`=>)
  if (parentParentNode.type === "value-func") {
    return true;
  }

  return false;
};

const isInlineValueCommentNode = (node) =>
  node.type === "value-comment" && node.inline;

const isHashNode = (node) => node.type === "value-word" && node.value === "#";

const isLeftCurlyBraceNode = (node) =>
  node.type === "value-word" && node.value === "";

const isRightCurlyBraceNode = (node) =>
  node.type === "value-word" && node.value === "}";

const isWordNode = (node) => ["value-word", "value-atword"].includes(node.type);

const isColonNode = (node) => node.type === "value-colon";

const isMediaAndSupportsKeywords = (node) =>
  node.value && ["not", "and", "or"].includes(node.value.toLowerCase());

const isColorAdjusterFuncNode = (node) => {
  if (node.type !== "value-func") {
    return false;
  }

  return colorAdjusterFunctions.has(node.value.toLowerCase());
};

// TODO: only check `less` when we don't use `less` to parse `css`
const isLessParser = (options) =>
  options.parser === "css" || options.parser === "less";

const lastLineHasInlineComment = (text) =>
  /\/\//.test(text.split(/[\n\r]/).pop());

const stringifyNode = (node) => {
  if (node.groups) {
    const open = node.open && node.open.value ? node.open.value : "";
    const groups = node.groups.reduce((previousValue, currentValue, index) => {
      return (
        previousValue +
        stringifyNode(currentValue) +
        (node.groups[0].type === "comma_group" &&
        index !== node.groups.length - 1
          ? ","
          : "")
      );
    }, "");
    const close = node.close && node.close.value ? node.close.value : "";

    return open + groups + close;
  }

  const before = node.raws && node.raws.before ? node.raws.before : "";
  const quote = node.raws && node.raws.quote ? node.raws.quote : "";
  const atword = node.type === "atword" ? "@" : "";
  const value = node.value ? node.value : "";
  const unit = node.unit ? node.unit : "";
  const group = node.group ? stringifyNode(node.group) : "";
  const after = node.raws && node.raws.after ? node.raws.after : "";

  return before + quote + atword + value + quote + unit + group + after;
};

const isAtWordPlaceholderNode = (node) => {
  return (
    node &&
    node.type === "value-atword" &&
    node.value.startsWith("prettier-placeholder-")
  );
};

module.exports = {
  getAncestorCounter,
  getAncestorNode,
  getPropOfDeclNode,
  hasSCSSInterpolation,
  hasStringOrFunction,
  maybeToLowerCase,
  insideValueFunctionNode,
  insideICSSRuleNode,
  insideAtRuleNode,
  insideURLFunctionInImportAtRuleNode,
  isKeyframeAtRuleKeywords,
  isWideKeywords,
  isSCSS,
  isSCSSVariable,
  isLastNode,
  isLessParser,
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
  isSCSSNestedPropertyNode,
  isDetachedRulesetCallNode,
  isTemplatePlaceholderNode,
  isTemplatePropNode,
  isPostcssSimpleVarNode,
  isKeyValuePairNode,
  isKeyValuePairInParenGroupNode,
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
  stringifyNode,
  isAtWordPlaceholderNode,
};
