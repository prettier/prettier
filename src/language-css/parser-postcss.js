"use strict";

const createError = require("../common/parser-create-error");
const parseFrontMatter = require("../utils/front-matter");
const lineColumnToIndex = require("../utils/line-column-to-index");
const { hasPragma } = require("./pragma");

// utils
const utils = require("./utils");

const isSCSS = utils.isSCSS;
const isSCSSNestedPropertyNode = utils.isSCSSNestedPropertyNode;

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

  let result = null;

  try {
    result = valueParser(value, { loose: true }).parse();
  } catch (e) {
    return {
      type: "value-unknown",
      value: value
    };
  }

  const parsedResult = parseNestedValue(result);

  return addTypePrefix(parsedResult, "value-");
}

function parseSelector(selector) {
  // If there's a comment inside of a selector, the parser tries to parse
  // the content of the comment as selectors which turns it into complete
  // garbage. Better to print the whole selector as-is and not try to parse
  // and reformat it.
  if (selector.match(/\/\/|\/\*/)) {
    return {
      type: "selector-unknown",
      value: selector.replace(/^ +/, "").replace(/ +$/, "")
    };
  }

  const selectorParser = require("postcss-selector-parser");

  let result = null;

  try {
    selectorParser(result_ => {
      result = result_;
    }).process(selector);
  } catch (e) {
    // Fail silently. It's better to print it as is than to try and parse it
    // Note: A common failure is for SCSS nested properties. `background:
    // none { color: red; }` is parsed as a NestedDeclaration by
    // postcss-scss, while `background: { color: red; }` is parsed as a Rule
    // with a selector ending with a colon. See:
    // https://github.com/postcss/postcss-scss/issues/39
    return {
      type: "selector-unknown",
      value: selector
    };
  }

  return addTypePrefix(result, "selector-");
}

function parseMediaQuery(params) {
  const mediaParser = require("postcss-media-query-parser").default;

  let result = null;

  try {
    result = mediaParser(params);
  } catch (e) {
    // Ignore bad media queries
    return {
      type: "selector-unknown",
      value: params
    };
  }

  return addTypePrefix(addMissingType(result), "media-");
}

const DEFAULT_SCSS_DIRECTIVE = /(\s*?)(!default).*$/;
const GLOBAL_SCSS_DIRECTIVE = /(\s*?)(!global).*$/;

function parseNestedCSS(node, options) {
  if (node && typeof node === "object") {
    delete node.parent;

    for (const key in node) {
      parseNestedCSS(node[key], options);
    }

    if (!node.type) {
      return node;
    }

    if (!node.raws) {
      node.raws = {};
    }

    let selector = "";

    if (typeof node.selector === "string") {
      selector = node.raws.selector
        ? node.raws.selector.scss
          ? node.raws.selector.scss
          : node.raws.selector.raw
        : node.selector;

      if (node.raws.between && node.raws.between.trim().length > 0) {
        selector += node.raws.between;
      }

      node.raws.selector = selector;
    }

    // postcss-less@2.0.0 parse `custom-selector` as `css-decl`
    if (
      options.parser === "css" &&
      node.type === "css-decl" &&
      node.prop === "@custom-selector"
    ) {
      selector = node.value;
      node.raws.value = selector;
    }

    let value = "";

    if (typeof node.value === "string") {
      value = node.raws.value
        ? node.raws.value.scss
          ? node.raws.value.scss
          : node.raws.value.raw
        : node.value;

      value = value.trim();

      node.raws.value = selector;
    }

    let params = "";

    if (typeof node.params === "string") {
      params = node.raws.params
        ? node.raws.params.scss
          ? node.raws.params.scss
          : node.raws.params.raw
        : node.params;

      if (node.raws.afterName && node.raws.afterName.trim().length > 0) {
        params = node.raws.afterName + params;
      }

      if (node.raws.between && node.raws.between.trim().length > 0) {
        params = params + node.raws.between;
      }

      params = params.trim();

      node.raws.params = params;
    }

    // Ignore LESS mixin declaration
    if (selector.trim().length > 0) {
      if (selector.startsWith("@") && selector.endsWith(":")) {
        return node;
      }

      // Ignore LESS mixins
      if (node.mixin) {
        node.selector = parseValue(selector);

        return node;
      }

      // Check on SCSS nested property
      if (isSCSSNestedPropertyNode(node)) {
        node.isSCSSNesterProperty = true;
      }

      node.selector = parseSelector(selector);

      return node;
    }

    if (value.length > 0) {
      const defaultSCSSDirectiveIndex = value.match(DEFAULT_SCSS_DIRECTIVE);

      if (defaultSCSSDirectiveIndex) {
        value = value.substring(0, defaultSCSSDirectiveIndex.index);
        node.scssDefault = true;

        if (defaultSCSSDirectiveIndex[0].trim() !== "!default") {
          node.raws.scssDefault = defaultSCSSDirectiveIndex[0];
        }
      }

      const globalSCSSDirectiveIndex = value.match(GLOBAL_SCSS_DIRECTIVE);

      if (globalSCSSDirectiveIndex) {
        value = value.substring(0, globalSCSSDirectiveIndex.index);
        node.scssGlobal = true;

        if (globalSCSSDirectiveIndex[0].trim() !== "!global") {
          node.raws.scssGlobal = globalSCSSDirectiveIndex[0];
        }
      }

      if (value.startsWith("progid:")) {
        return {
          type: "value-unknown",
          value: value
        };
      }

      node.value = parseValue(value);
    }

    if (node.type === "css-atrule" && params.length > 0) {
      const name = node.name;
      const lowercasedName = node.name.toLowerCase();

      if (name === "warn" || name === "error") {
        node.params = {
          type: "media-unknown",
          value: params
        };

        return node;
      }

      if (name === "extend" || name === "nest") {
        node.selector = parseSelector(params);
        delete node.params;

        return node;
      }

      if (name === "at-root") {
        if (/^\(\s*(without|with)\s*:[\s\S]+\)$/.test(params)) {
          node.params = parseValue(params);
        } else {
          node.selector = parseSelector(params);
          delete node.params;
        }

        return node;
      }

      if (lowercasedName === "import") {
        node.params = parseValue(params);
        return node;
      }

      if (
        [
          "namespace",
          "supports",
          "if",
          "else",
          "for",
          "each",
          "while",
          "debug",
          "mixin",
          "include",
          "function",
          "return",
          "define-mixin",
          "add-mixin"
        ].indexOf(name) !== -1
      ) {
        // Remove unnecessary spaces in SCSS variable arguments
        params = params.replace(/(\$\S+?)\s+?\.\.\./, "$1...");
        // Remove unnecessary spaces before SCSS control, mixin and function directives
        params = params.replace(/^(?!if)(\S+)\s+\(/, "$1(");

        node.value = parseValue(params);
        delete node.params;

        return node;
      }

      if (name === "custom-selector") {
        const customSelector = params.match(/:--\S+?\s+/)[0].trim();

        node.customSelector = customSelector;
        node.selector = parseSelector(params.substring(customSelector.length));
        delete node.params;

        return node;
      }

      if (["media", "custom-media"].indexOf(lowercasedName) !== -1) {
        if (params.includes("#{")) {
          // Workaround for media at rule with scss interpolation
          return {
            type: "media-unknown",
            value: params
          };
        }

        node.params = parseMediaQuery(params);

        return node;
      }

      node.params = params;

      return node;
    }
  }

  return node;
}

function parseWithParser(parser, text, options) {
  const parsed = parseFrontMatter(text);
  const { frontMatter } = parsed;
  text = parsed.content;

  let result;

  try {
    result = parser.parse(text);
  } catch (e) {
    if (typeof e.line !== "number") {
      throw e;
    }
    throw createError("(postcss) " + e.name + " " + e.reason, { start: e });
  }

  result = parseNestedCSS(addTypePrefix(result, "css-"), options);

  if (frontMatter) {
    result.nodes.unshift(frontMatter);
  }

  return result;
}

function requireParser(isSCSSParser) {
  if (isSCSSParser) {
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

function parse(text, parsers, options) {
  const hasExplicitParserChoice =
    options.parser === "less" || options.parser === "scss";
  const isSCSSParser = isSCSS(options.parser, text);

  try {
    return parseWithParser(requireParser(isSCSSParser), text, options);
  } catch (originalError) {
    if (hasExplicitParserChoice) {
      throw originalError;
    }

    try {
      return parseWithParser(requireParser(!isSCSSParser), text, options);
    } catch (_secondError) {
      throw originalError;
    }
  }
}

const parser = {
  parse,
  astFormat: "postcss",
  hasPragma,
  locStart(node) {
    if (node.source) {
      return lineColumnToIndex(node.source.start, node.source.input.css) - 1;
    }
    return null;
  },
  locEnd(node) {
    const endNode = node.nodes && node.nodes[node.nodes.length - 1];
    if (endNode && node.source && !node.source.end) {
      node = endNode;
    }
    if (node.source && node.source.end) {
      return lineColumnToIndex(node.source.end, node.source.input.css);
    }
    return null;
  }
};

// Export as a plugin so we can reuse the same bundle for UMD loading
module.exports = {
  parsers: {
    css: parser,
    less: parser,
    scss: parser
  }
};
