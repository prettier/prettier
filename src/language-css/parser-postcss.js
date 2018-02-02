"use strict";

const createError = require("../common/parser-create-error");
const grayMatter = require("gray-matter");

function parseSelector(selector) {
  // If there's a comment inside of a selector, the parser tries to parse
  // the content of the comment as selectors which turns it into complete
  // garbage. Better to print the whole selector as-is and not try to parse
  // and reformat it.
  if (selector.match(/\/\/|\/\*/)) {
    return {
      type: "selector-comment",
      value: selector
    };
  }
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
    const isUnquotedDataURLCall =
      node.type === "func" &&
      node.value === "url" &&
      node.group &&
      node.group.groups &&
      node.group.groups[0] &&
      node.group.groups[0].groups &&
      node.group.groups[0].groups.length > 2 &&
      node.group.groups[0].groups[0].type === "word" &&
      node.group.groups[0].groups[0].value === "data" &&
      node.group.groups[0].groups[1].type === "colon" &&
      node.group.groups[0].groups[1].value === ":";

    if (isUnquotedDataURLCall) {
      node.group.groups = [stringifyGroup(node)];

      return node;
    }

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

function stringifyGroup(node) {
  if (node.group) {
    return stringifyGroup(node.group);
  }

  if (node.groups) {
    return node.groups.reduce((previousValue, currentValue, index) => {
      return (
        previousValue +
        stringifyGroup(currentValue) +
        (currentValue.type === "comma_group" && index !== node.groups.length - 1
          ? ","
          : "")
      );
    }, "");
  }

  const before = node.raws && node.raws.before ? node.raws.before : "";
  const value = node.value ? node.value : "";
  const unit = node.unit ? node.unit : "";
  const after = node.raws && node.raws.after ? node.raws.after : "";

  return before + value + unit + after;
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

const DEFAULT_SCSS_DIRECTIVE = "!default";
const GLOBAL_SCSS_DIRECTIVE = "!global";

function parseNestedCSS(node) {
  if (node && typeof node === "object") {
    delete node.parent;

    for (const key in node) {
      parseNestedCSS(node[key]);
    }

    if (typeof node.selector === "string" && node.selector.trim().length > 0) {
      const selector = node.raws.selector
        ? node.raws.selector.raw
        : node.selector;

      if (selector.startsWith("@") && selector.endsWith(":")) {
        return node;
      }

      try {
        node.selector = parseSelector(selector);
      } catch (e) {
        // Fail silently. It's better to print it as is than to try and parse it
        // Note: A common failure is for SCSS nested properties. `background:
        // none { color: red; }` is parsed as a NestedDeclaration by
        // postcss-scss, while `background: { color: red; }` is parsed as a Rule
        // with a selector ending with a colon. See:
        // https://github.com/postcss/postcss-scss/issues/39
        node.selector = {
          type: "selector-root-invalid",
          value: selector
        };
      }

      return node;
    }

    if (
      node.type &&
      node.type !== "css-comment-yaml" &&
      typeof node.value === "string" &&
      node.value.trim().length > 0
    ) {
      try {
        if (node.value.endsWith(DEFAULT_SCSS_DIRECTIVE)) {
          node.default = true;
          node.value = node.value.slice(0, -DEFAULT_SCSS_DIRECTIVE.length);
        }

        if (node.value.endsWith(GLOBAL_SCSS_DIRECTIVE)) {
          node.global = true;
          node.value = node.value.slice(0, -GLOBAL_SCSS_DIRECTIVE.length);
        }

        node.value = parseValue(node.value);
      } catch (e) {
        throw createError(
          "(postcss-values-parser) " + e.toString(),
          node.source
        );
      }

      return node;
    }

    if (
      node.type === "css-atrule" &&
      typeof node.params === "string" &&
      node.params.trim().length > 0
    ) {
      if (
        node.name === "charset" ||
        node.name.toLowerCase() === "counter-style" ||
        node.name.toLowerCase().endsWith("keyframes") ||
        node.name.toLowerCase() === "page" ||
        node.name.toLowerCase() === "font-feature-values"
      ) {
        return node;
      }

      if (node.name === "warn" || node.name === "error") {
        node.params = {
          type: "media-unknown",
          value: node.params
        };

        return node;
      }

      if (node.name === "extend") {
        node.selector = parseSelector(node.params);
        delete node.params;

        return node;
      }

      if (node.name === "at-root") {
        if (/^\(\s*(without|with)\s*:[\s\S]+\)$/.test(node.params)) {
          node.params = parseMediaQuery(node.params);
        } else {
          node.selector = parseSelector(node.params);
          delete node.params;
        }

        return node;
      }

      if (
        node.name === "if" ||
        node.name === "else" ||
        node.name === "for" ||
        node.name === "each" ||
        node.name === "while" ||
        node.name === "debug" ||
        node.name === "mixin" ||
        node.name === "include" ||
        node.name === "function" ||
        node.name === "return"
      ) {
        // Remove unnecessary spaces in SCSS variable arguments
        node.params = node.params.replace(/\s+\.\.\./, "...");
        // Remove unnecessary spaces before SCSS control, mixin and function directives
        node.params = node.params.replace(/^(\S+)\s+\(/, "$1(");

        node.value = parseValue(node.params);
        delete node.params;

        return node;
      }

      if (node.params.includes("#{")) {
        // Workaround for media at rule with scss interpolation
        return {
          type: "media-unknown",
          value: node.params
        };
      }

      if (/^custom-selector$/i.test(node.name)) {
        const customSelector = node.params.match(/:--\S+?\s+/)[0].trim();

        node.customSelector = customSelector;
        node.selector = parseSelector(
          node.params.substring(customSelector.length)
        );
        delete node.params;

        return node;
      }

      node.params = parseMediaQuery(node.params);

      return node;
    }
  }

  return node;
}

function parseWithParser(parser, text, frontMatter) {
  let result;
  try {
    result = parser.parse(text);
  } catch (e) {
    if (typeof e.line !== "number") {
      throw e;
    }
    throw createError("(postcss) " + e.name + " " + e.reason, { start: e });
  }

  if (Object.keys(frontMatter.data).length > 0) {
    result.nodes.unshift({
      type: "comment-yaml",
      value: grayMatter.stringify("", frontMatter.data).replace(/\s$/, "")
    });
  }

  const prefixedResult = addTypePrefix(result, "css-");
  const parsedResult = parseNestedCSS(prefixedResult);
  return parsedResult;
}

function requireParser(isSCSS) {
  if (isSCSS) {
    return require("postcss-scss");
  }

  // TODO: Remove this hack when this issue is fixed:
  // https://github.com/shellscape/postcss-less/issues/88
  const LessParser = require("postcss-less/dist/less-parser");
  LessParser.prototype.atrule = function() {
    return Object.getPrototypeOf(LessParser.prototype).atrule.apply(
      this,
      arguments
    );
  };

  return require("postcss-less");
}

const IS_POSSIBLY_SCSS = /(\w\s*: [^}:]+|#){|@import[^\n]+(url|,)/;

function parse(text, parsers, opts) {
  const hasExplicitParserChoice =
    opts.parser === "less" || opts.parser === "scss";

  const isSCSS = hasExplicitParserChoice
    ? opts.parser === "scss"
    : IS_POSSIBLY_SCSS.test(text);

  const frontMatter = grayMatter(text);
  const normalizedText = frontMatter.content;

  try {
    return parseWithParser(requireParser(isSCSS), normalizedText, frontMatter);
  } catch (originalError) {
    if (hasExplicitParserChoice) {
      throw originalError;
    }

    try {
      return parseWithParser(
        requireParser(!isSCSS),
        normalizedText,
        frontMatter
      );
    } catch (_secondError) {
      throw originalError;
    }
  }
}

module.exports = parse;
