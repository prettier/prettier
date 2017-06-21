"use strict";

const createError = require("./parser-create-error");

function parseSelector(selector) {
  const selectorParser = require("postcss-selector-parser");
  let result;
  selectorParser(result_ => {
    result = result_;
  }).process(selector);
  return addTypePrefix(result, "selector-");
}

function parseValueNodes(nodes) {
  let parenGroup = {
    open: null,
    close: null,
    groups: [],
    type: "paren_group"
  };
  const parenGroupStack = [parenGroup];
  const rootParenGroup = parenGroup;
  let commaGroup = {
    groups: [],
    type: "comma_group"
  };
  const commaGroupStack = [commaGroup];

  for (let i = 0; i < nodes.length; ++i) {
    const node = nodes[i];
    if (node.type === "paren" && node.value === "(") {
      parenGroup = {
        open: node,
        close: null,
        groups: [],
        type: "paren_group"
      };
      parenGroupStack.push(parenGroup);

      commaGroup = {
        groups: [],
        type: "comma_group"
      };
      commaGroupStack.push(commaGroup);
    } else if (node.type === "paren" && node.value === ")") {
      if (commaGroup.groups.length) {
        parenGroup.groups.push(commaGroup);
      }
      parenGroup.close = node;

      if (commaGroupStack.length === 1) {
        throw new Error("Unbalanced parenthesis");
      }

      commaGroupStack.pop();
      commaGroup = commaGroupStack[commaGroupStack.length - 1];
      commaGroup.groups.push(parenGroup);

      parenGroupStack.pop();
      parenGroup = parenGroupStack[parenGroupStack.length - 1];
    } else if (node.type === "comma") {
      parenGroup.groups.push(commaGroup);
      commaGroup = {
        groups: [],
        type: "comma_group"
      };
      commaGroupStack[commaGroupStack.length - 1] = commaGroup;
    } else {
      commaGroup.groups.push(node);
    }
  }
  if (commaGroup.groups.length > 0) {
    parenGroup.groups.push(commaGroup);
  }
  return rootParenGroup;
}

function flattenGroups(node) {
  if (
    node.type === "paren_group" &&
    !node.open &&
    !node.close &&
    node.groups.length === 1
  ) {
    return flattenGroups(node.groups[0]);
  }

  if (node.type === "comma_group" && node.groups.length === 1) {
    return flattenGroups(node.groups[0]);
  }

  if (node.type === "paren_group" || node.type === "comma_group") {
    return Object.assign({}, node, { groups: node.groups.map(flattenGroups) });
  }

  return node;
}

function addTypePrefix(node, prefix) {
  if (node && typeof node === "object") {
    delete node.parent;
    for (const key in node) {
      addTypePrefix(node[key], prefix);
      if (key === "type" && typeof node[key] === "string") {
        if (!node[key].startsWith(prefix)) {
          node[key] = prefix + node[key];
        }
      }
    }
  }
  return node;
}

function addMissingType(node) {
  if (node && typeof node === "object") {
    delete node.parent;
    for (const key in node) {
      addMissingType(node[key]);
    }
    if (!Array.isArray(node) && node.value && !node.type) {
      node.type = "unknown";
    }
  }
  return node;
}

function parseNestedValue(node) {
  if (node && typeof node === "object") {
    delete node.parent;
    for (const key in node) {
      parseNestedValue(node[key]);
      if (key === "nodes") {
        node.group = flattenGroups(parseValueNodes(node[key]));
        delete node[key];
      }
    }
  }
  return node;
}

function parseValue(value) {
  const valueParser = require("postcss-values-parser");
  const result = valueParser(value, { loose: true }).parse();
  const parsedResult = parseNestedValue(result);
  return addTypePrefix(parsedResult, "value-");
}

function parseMediaQuery(value) {
  const mediaParser = require("postcss-media-query-parser").default;
  const result = addMissingType(mediaParser(value));
  return addTypePrefix(result, "media-");
}

function parseNestedCSS(node) {
  if (node && typeof node === "object") {
    delete node.parent;
    for (const key in node) {
      parseNestedCSS(node[key]);
    }
    if (typeof node.selector === "string") {
      const selector = node.raws.selector
        ? node.raws.selector.raw
        : node.selector;

      try {
        node.selector = parseSelector(selector);
      } catch (e) {
        // Fail silently. It's better to print it as is than to try and parse it
        node.selector = selector;
      }
    }
    if (node.type && typeof node.value === "string") {
      try {
        node.value = parseValue(node.value);
      } catch (e) {
        throw createError(
          "(postcss-values-parser) " + e.toString(),
          node.source
        );
      }
    }
    if (node.type === "css-atrule" && typeof node.params === "string") {
      node.params = parseMediaQuery(node.params);
    }
  }
  return node;
}

function parseWithParser(parser, text) {
  let result;
  try {
    result = parser.parse(text);
  } catch (e) {
    if (typeof e.line !== "number") {
      throw e;
    }
    throw createError("(postcss) " + e.name + " " + e.reason, { start: e });
  }
  const prefixedResult = addTypePrefix(result, "css-");
  const parsedResult = parseNestedCSS(prefixedResult);
  return parsedResult;
}

function requireParser(isSCSS) {
  if (isSCSS) {
    return require("postcss-scss");
  }
  return require("postcss-less");
}

function parse(text) {
  const isLikelySCSS = !!text.match(/(\w\s*: [^}:]+|#){|\@import[^\n]+(url|,)/);
  try {
    return parseWithParser(requireParser(isLikelySCSS), text);
  } catch (e) {
    try {
      return parseWithParser(requireParser(!isLikelySCSS), text);
    } catch (e2) {
      throw e;
    }
  }
}

module.exports = parse;
