import { fill, group, indent, join, line } from "../../document/builders.js";
import { locStart } from "../loc.js";
import { chunk } from "./chunk.js";

const wideKeywords = new Set(["initial", "inherit", "unset", "revert"]);
function isWideKeywords(value) {
  return wideKeywords.has(value.toLowerCase());
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

function insideICSSRuleNode(path) {
  const ruleAncestorNode = path.findAncestor((node) => node.type === "rule");
  const selector = ruleAncestorNode?.selector;

  return (
    selector &&
    (selector.startsWith(":import") || selector.startsWith(":export"))
  );
}

function isVarFunctionNode(node) {
  return node.sassType === "function-call" && node.name.toLowerCase() === "var";
}

function isDetachedRulesetDeclarationNode(node) {
  const { selector } = node;
  // If a Less file ends up being parsed with the SCSS parser, Less
  // variable declarations will be parsed as atrules with names ending
  // with a colon, so keep the original case then.
  /* c8 ignore next 3 */
  if (!selector) {
    return false;
  }

  return (
    (typeof selector === "string" && /^@.+:.*$/u.test(selector)) ||
    (selector.value && /^@.+:.*$/u.test(selector.value))
  );
}

function isSCSSControlDirectiveNode(node) {
  return (
    node.type === "atrule" &&
    ["if", "else", "for", "each", "while"].includes(node.name)
  );
}

function isDetachedRulesetCallNode(node) {
  return node.params && /^\(\s*\)$/u.test(node.params);
}

function isTemplatePlaceholderNode(node) {
  return node.name.startsWith("prettier-placeholder");
}

function isTemplatePropNode(node) {
  return node.prop.startsWith("@prettier-placeholder");
}

function hasComposesNode(node) {
  return node.prop.toLowerCase() === "composes";
}

function hasParensAroundNode(node) {
  return ["parenthesized", "parameter-list", "argument-list", "map"].includes(
    node.sassType,
  );
}

function lastLineHasInlineComment(text) {
  return /\/\//u.test(text.split(/[\n\r]/u).pop());
}

function isKeyValuePairNode(node) {
  return (
    node.sassType === "map-entry" ||
    node.sassType === "configured-variable" ||
    (node.sassType === "argument" && Boolean(node.name)) ||
    (node.sassType === "parameter" && Boolean(node.defaultValue))
  );
}

function isCommaGroup(node) {
  return (
    [
      "argument-list",
      "parameter-list",
      "map",
      "configuration",
      "parenthesized",
      // TODO: How aggressively should we break lists?
      // "function-call",
      // "binary-operation",
    ].includes(node.sassType) ||
    isKeyValuePairNode(node) ||
    (node.sassType === "list" && [",", "/"].includes(node.separator))
  );
}

function shouldBreakList(path) {
  return path.match(
    (node) => node.some?.(isCommaGroup),
    (node, key) =>
      key === "expression" &&
      ((node.type === "decl" && !node.prop.startsWith("--")) ||
        (node.type === "atrule" && node.variable)),
  );
}

function hasComma({ node, parent }, options) {
  return Boolean(
    node.source &&
      options.originalText
        .slice(locStart(node), locStart(parent.close))
        .trimEnd()
        .endsWith(","),
  );
}

function setsEqual(set1, set2) {
  if (set1 === set2) {
    return true;
  }
  if (set1.size !== set2.size) {
    return false;
  }
  for (const element of set1) {
    if (!set2.has(element)) {
      return false;
    }
  }
  return true;
}

function memberListsEqual(list1, list2) {
  if (list1 === list2) {
    return true;
  }
  if (!list1 || !list2) {
    return false;
  }
  return (
    setsEqual(list1.mixinsAndFunctions, list2.mixinsAndFunctions) &&
    setsEqual(list1.variables, list2.variables)
  );
}

function serializeMemberList(keyword, members, raws) {
  if (memberListsEqual(members, raws?.value)) {
    return raws.raw;
  }
  const mixinsAndFunctionsEmpty = members.mixinsAndFunctions.size === 0;
  const variablesEmpty = members.variables.size === 0;
  if (mixinsAndFunctionsEmpty && variablesEmpty) {
    return "";
  }

  // TODO: This will re-order the members
  const allItems = [
    ...members.mixinsAndFunctions,
    ...[...members.variables].map((variable) => `$${variable}`),
  ];

  if (allItems.length === 1) {
    return indent([line, keyword, " ", allItems[0]]);
  }

  return group(
    indent([
      indent([line, keyword, " ", allItems[0], ","]),
      line,
      fill(join(line, chunk(join(",", allItems.slice(1)), 2))),
    ]),
  );
}

function isInMap(path) {
  const hasParens = path.parent.sassType === "parenthesized";
  const mapNode = hasParens ? path.grandparent : path.parent;
  const childNode = hasParens ? path.parent : path.node;
  if (mapNode.sassType !== "map-entry") {
    return { isKey: false, isValue: false };
  }
  return {
    isKey: mapNode.key === childNode,
    isValue: mapNode.value === childNode,
  };
}

export {
  hasComma,
  hasComposesNode,
  hasParensAroundNode,
  insideICSSRuleNode,
  isCommaGroup,
  isDetachedRulesetCallNode,
  isDetachedRulesetDeclarationNode,
  isInMap,
  isKeyValuePairNode,
  isSCSSControlDirectiveNode,
  isTemplatePlaceholderNode,
  isTemplatePropNode,
  isVarFunctionNode,
  isWideKeywords,
  lastLineHasInlineComment,
  maybeToLowerCase,
  memberListsEqual,
  serializeMemberList,
  setsEqual,
  shouldBreakList,
};
